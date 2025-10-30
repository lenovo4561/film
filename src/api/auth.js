import axios from "axios";
import { Toast } from "mint-ui";

// 创建认证服务实例
const authService = axios.create({
  baseURL: "http://192.168.6.235:3000/api",
  timeout: 10000
});

// 响应拦截器
authService.interceptors.response.use(
  response => {
    const res = response.data;
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
    console.error("认证错误:", error);
    Toast({
      message:
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "网络错误",
      position: "middle",
      duration: 2000
    });
    return Promise.reject(error);
  }
);

/**
 * 用户登录
 * @param {Object} data - { username, password }
 * @returns {Promise}
 */
export function login(data) {
  return authService({
    url: "/auth/login",
    method: "post",
    data
  });
}

/**
 * 用户注册
 * @param {Object} data - { username, password, phone, email }
 * @returns {Promise}
 */
export function register(data) {
  return authService({
    url: "/auth/register",
    method: "post",
    data
  });
}

/**
 * 获取用户信息
 * @returns {Promise}
 */
export function getUserInfo() {
  const token = localStorage.getItem("token");

  return authService({
    url: "/auth/userinfo",
    method: "get",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

/**
 * 用户登出
 * @returns {Promise}
 */
export function logout() {
  const token = localStorage.getItem("token");

  return authService({
    url: "/auth/logout",
    method: "post",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export default authService;
