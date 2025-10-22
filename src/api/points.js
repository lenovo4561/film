import axios from 'axios'
import { Toast } from 'mint-ui'

// 创建axios实例 - 用于3000端口的积分系统
const service = axios.create({
  baseURL: 'http://localhost:3000/api', // 后端API地址
  timeout: 10000
})

// 创建第二个axios实例 - 用于4000端口的film_api（金币系统）
const coinService = axios.create({
  baseURL: '/api', // 通过代理转发到4000端口
  timeout: 10000
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    if (res.code && res.code !== 200) {
      Toast({
        message: res.message || '请求失败',
        position: 'middle',
        duration: 2000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)
    Toast({
      message: error.message || '网络错误',
      position: 'middle',
      duration: 2000
    })
    return Promise.reject(error)
  }
)

// coinService 请求拦截器
coinService.interceptors.request.use(
  config => {
    // 启用 withCredentials，使请求携带 cookies（用于服务端验证身份）
    config.withCredentials = true

    // 同时从 localStorage 获取 userId 并添加到请求参数
    // 后端会优先使用 session/cookie，userId 作为备用验证
    let userId = localStorage.getItem('userId');

    // ✅ 如果 localStorage 没有，尝试从 cookie 读取
    if (!userId) {
      const cookieValue = document.cookie
        .split('; ')
        .find(row => row.startsWith('user_id='));

      if (cookieValue) {
        userId = cookieValue.split('=')[1];
        // 保存到 localStorage
        localStorage.setItem('userId', userId);
      }
    }

    // 如果有 userId，添加到请求参数
    if (userId) {
      if (config.method === 'get') {
        config.params = { ...config.params, userId }
      } else if (config.method === 'post') {
        config.data = { ...config.data, userId }
      }

      console.log('[金币系统] 请求携带 cookies + userId:', config.url, '| userId:', userId)
    } else {
      console.log('[金币系统] 请求仅携带 cookies:', config.url)
    }

    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// coinService 响应拦截器
coinService.interceptors.response.use(
  response => {
    const res = response.data
    // film_api 返回 success_code 和 error_code
    if (res.error_code) {
      Toast({
        message: res.message || '请求失败',
        position: 'middle',
        duration: 2000
      })
      return Promise.reject(new Error(res.message || 'Error'))
    }
    return res
  },
  error => {
    console.error('响应错误:', error)
    Toast({
      message: error.message || '网络错误',
      position: 'middle',
      duration: 2000
    })
    return Promise.reject(error)
  }
)

// ========== 客户端任务API ==========

/**
 * 获取用户可用任务列表
 */
export function getClientTasks(params) {
  return service({
    url: '/client/tasks',
    method: 'get',
    params
  })
}

/**
 * 获取任务详情
 */
export function getClientTaskDetail(taskId) {
  return service({
    url: `/client/tasks/${taskId}`,
    method: 'get'
  })
}

/**
 * 开始任务
 */
export function startTask(taskId) {
  return service({
    url: `/client/tasks/${taskId}/start`,
    method: 'post'
  })
}

/**
 * 更新任务进度
 */
export function updateTaskProgress(taskId, data) {
  return service({
    url: `/client/tasks/${taskId}/progress`,
    method: 'put',
    data
  })
}

/**
 * 完成任务
 */
export function completeTask(taskId) {
  return service({
    url: `/client/tasks/${taskId}/complete`,
    method: 'post'
  })
}

/**
 * 获取我的任务记录
 */
export function getMyTaskRecords(params) {
  return service({
    url: '/client/tasks/my-records',
    method: 'get',
    params
  })
}

// ========== 客户端积分API ==========

/**
 * 获取我的积分信息
 */
export function getMyPoints() {
  return service({
    url: '/client/points',
    method: 'get'
  })
}

/**
 * 获取我的积分记录
 */
export function getMyPointsLogs(params) {
  return service({
    url: '/client/points/logs',
    method: 'get',
    params
  })
}

// ========== 客户端签到API（金币系统 - film_api 4000端口）==========

/**
 * 获取我的签到状态（检查今天是否已签到）
 * 返回: { success_code: 200, checked: true/false, data: { last_checkin_date, continuous_days } }
 */
export function getMySigninStatus() {
  return coinService({
    url: '/checkSigninStatus',
    method: 'get'
  })
}

/**
 * 签到（领取金币）
 */
export function doSignin() {
  return coinService({
    url: '/userCheckin',
    method: 'post'
  })
}

/**
 * 获取我的签到历史
 * @deprecated 暂未实现，请使用金币历史接口
 */
export function getMySigninHistory(params) {
  return service({
    url: '/client/signin/history',
    method: 'get',
    params
  })
}

// ========== 客户端广告API ==========

/**
 * 获取可用广告列表
 */
export function getClientAds(params) {
  return service({
    url: '/client/ads',
    method: 'get',
    params
  })
}

/**
 * 记录广告观看
 */
export function watchAd(adId, data) {
  return service({
    url: `/client/ads/${adId}/watch`,
    method: 'post',
    data
  })
}

/**
 * 获取我的广告观看记录
 */
export function getMyAdRecords(params) {
  return service({
    url: '/client/ads/my-records',
    method: 'get',
    params
  })
}

export default service
