/**
 * 环境配置文件
 * 用于区分开发环境和生产环境
 */

// 判断当前环境
const isDevelopment = process.env.NODE_ENV === "development";
const envName =
  process.env.REACT_APP_ENV || (isDevelopment ? "development" : "production");

// API基础URL
const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isDevelopment
    ? "http://localhost:9000/api"
    : "https://tuanzi.voderl.cn/api");

console.log(`应用运行在 ${envName} 环境，API地址: ${API_BASE_URL}`);

// 导出配置
const config = {
  // 环境名称
  env: envName,

  // API相关配置
  api: {
    baseUrl: API_BASE_URL,
    endpoints: {
      milkTea: `${API_BASE_URL}/milktea`,
      auth: `${API_BASE_URL}/auth`,
      ocr: `${API_BASE_URL}/ocr`,
    },
    // 请求超时时间（毫秒）
    timeout: 10000,
  },

  // 本地存储相关配置
  storage: {
    keys: {
      userId: "milk_tea_app_user_id",
      teaRecords: "milk_tea_app_tea_records",
      lastSync: "milk_tea_app_last_sync",
      authToken: "milk_tea_app_auth_token",
    },
    // 数据同步间隔（毫秒）
    syncInterval: 3600000, // 1小时
  },

  // 环境标志
  isDevelopment,
  isProduction: !isDevelopment,
};

export default config;
