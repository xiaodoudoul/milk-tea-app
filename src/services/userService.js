import * as localStorageService from "./localStorageService";

/**
 * 用户登录
 * @param {Object} credentials - 登录凭证，包含用户名和密码
 * @returns {Promise<Object>} - 返回登录结果
 */
export const login = async (credentials) => {
  try {
    const response = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error(`登录失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // 保存用户ID到本地存储
    localStorageService.saveUserId(data.userId);

    return data;
  } catch (error) {
    console.error("登录失败:", error);
    throw error;
  }
};

/**
 * 用户注册
 * @param {Object} userData - 用户数据，包含用户名、密码等
 * @returns {Promise<Object>} - 返回注册结果
 */
export const register = async (userData) => {
  try {
    console.log("发送注册请求:", userData.username);

    const response = await fetch("http://localhost:3001/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("注册请求失败:", response.status, data);
      throw new Error(
        data.error || `注册失败: ${response.status} ${response.statusText}`
      );
    }

    console.log("注册请求成功:", data);

    // 保存用户ID到本地存储
    localStorageService.saveUserId(data.userId);
    console.log("用户ID已保存到本地存储:", data.userId);

    return data;
  } catch (error) {
    console.error("注册过程中出现错误:", error);
    throw error;
  }
};

/**
 * 用户登出
 * @returns {Promise<void>}
 */
export const logout = async () => {
  try {
    // 清除本地存储中的用户ID
    localStorageService.clearUserId();

    // 如果在线，则调用后端登出接口
    if (navigator.onLine) {
      await fetch("http://localhost:3001/api/auth/logout", {
        method: "POST",
      });
    }
  } catch (error) {
    console.error("登出失败:", error);
    // 即使后端请求失败，也清除本地存储
    localStorageService.clearUserId();
  }
};

/**
 * 检查用户是否已登录
 * @returns {boolean} - 是否已登录
 */
export const isLoggedIn = () => {
  return !!localStorageService.getUserId();
};

/**
 * 获取当前用户ID
 * @returns {string|null} - 用户ID，如果未登录则返回null
 */
export const getCurrentUserId = () => {
  return localStorageService.getUserId();
};

export default {
  login,
  register,
  logout,
  isLoggedIn,
  getCurrentUserId,
};
