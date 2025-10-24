import axios from "axios";
import { Toast } from "mint-ui";
import { addSignature } from "@/utils/signature";

// 创建axios实例
const service = axios.create({
  baseURL: "/api/offerwall", // 积分墙API地址，通过代理转发到3000端口
  timeout: 10000
});

// 请求拦截器 - 添加签名
service.interceptors.request.use(
  config => {
    // 从localStorage获取userId
    const userId = localStorage.getItem("userId") || "1";

    // 获取原始参数（支持GET的params和POST的data）
    let params = {};

    if (config.method === "get" && config.params) {
      params = config.params;
    } else if (config.method === "post" && config.data) {
      params = config.data;
    }

    // 添加userId
    params.userId = userId;

    // 添加签名
    const signedParams = addSignature(params);

    // 更新请求参数
    if (config.method === "get") {
      config.params = signedParams;
    } else if (config.method === "post") {
      config.data = signedParams;
    }

    console.log(
      `${config.method.toUpperCase()} 请求参数（含签名）:`,
      config.method === "get" ? config.params : config.data
    );

    return config;
  },
  error => {
    console.error("请求错误:", error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data;

    // 如果返回的code不是200，认为是错误
    if (res.code && res.code !== 200) {
      Toast({
        message: res.message || "请求失败",
        position: "middle",
        duration: 2000
      });
      return Promise.reject(new Error(res.message || "Error"));
    }

    return res;
  },
  error => {
    console.error("响应错误:", error);

    let message = "网络错误";
    if (error.response) {
      message = error.response.data.message || error.response.statusText;
    } else if (error.message) {
      message = error.message;
    }

    Toast({
      message,
      position: "middle",
      duration: 2000
    });

    return Promise.reject(error);
  }
);

/**
 * 获取积分墙任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getOfferwallTasks(params = {}) {
  return service({
    url: "/tasks",
    method: "get",
    params
  });
}

/**
 * 获取积分墙模板数据
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getOfferwallTemplate(params = {}) {
  return service({
    url: "/template",
    method: "post",
    data: params
  });
}

/**
 * 获取福利中心任务列表
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getWelfareTasks(params = {}) {
  return service({
    url: "/welfare/tasks",
    method: "post",
    data: params
  });
}

/**
 * 获取积分墙UI配置信息
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getOfferwallConfig(params = {}) {
  return service({
    url: "/config",
    method: "post",
    data: params
  });
}

/**
 * 获取任务详情
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function getOfferwallTaskDetail(taskId) {
  return service({
    url: `/tasks/${taskId}`,
    method: "get"
  });
}

/**
 * 开始任务
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function startOfferwallTask(taskId) {
  return service({
    url: `/tasks/${taskId}/start`,
    method: "post"
  });
}

/**
 * 完成任务
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function completeOfferwallTask(taskId) {
  return service({
    url: `/tasks/${taskId}/complete`,
    method: "post"
  });
}

/**
 * 获取我的任务记录
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getMyOfferwallRecords(params = {}) {
  return service({
    url: "/tasks/records",
    method: "get",
    params
  });
}

/**
 * 获取用户金币余额
 * 服务端优先从 session/cookie 验证身份，userId 作为备用参数
 * @returns {Promise}
 */
export function getUserCoins() {
  console.log("[getUserCoins] 开始获取用户金币...");

  // ✅ 从 localStorage 获取实际用户 ID，如果没有则从 cookie 读取
  let userId = localStorage.getItem("userId");
  console.log("[getUserCoins] localStorage userId:", userId);

  if (!userId) {
    // 尝试从 cookie 中读取
    console.log(
      "[getUserCoins] localStorage 中无 userId，尝试从 cookie 读取..."
    );
    console.log("[getUserCoins] document.cookie:", document.cookie);

    const cookieValue = document.cookie
      .split("; ")
      .find(row => row.startsWith("user_id="));

    if (cookieValue) {
      userId = cookieValue.split("=")[1];
      // 保存到 localStorage 以便下次使用
      localStorage.setItem("userId", userId);
      console.log("[getUserCoins] 从 cookie 读取 userId:", userId);
    } else {
      console.warn("[getUserCoins] ⚠️ cookie 中也没有 user_id");
    }
  }

  // 如果还是没有，使用空值，让后端完全依赖 session/cookie
  const params = userId ? { userId } : {};

  console.log("[getUserCoins] 请求参数:", params);
  console.log("[getUserCoins] 发送请求: GET /api/getUserCoins");

  return axios
    .get("/api/getUserCoins", {
      params,
      withCredentials: true // 发送 cookies（服务端优先使用）
    })
    .then(res => {
      console.log("[getUserCoins] 响应数据:", res.data);
      return res.data;
    })
    .catch(error => {
      console.error("[getUserCoins] 请求失败:", error);
      console.error(
        "[getUserCoins] 错误响应:",
        error.response && error.response.data
      );
      throw error;
    });
}

/**
 * 生成任务token
 * 用户点击"去完成"按钮时调用
 * @param {number} taskId - 任务ID
 * @returns {Promise}
 */
export function generateTaskToken(taskId) {
  return service({
    url: "/tasks/generate-token",
    method: "post",
    data: { taskId }
  });
}

/**
 * 验证任务完成
 * 用户从H5返回APP后调用
 * @param {string} token - 任务token
 * @returns {Promise}
 */
export function verifyTaskComplete(token) {
  return service({
    url: "/tasks/verify-complete",
    method: "post",
    data: { token }
  });
}

export default service;
