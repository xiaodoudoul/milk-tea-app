/**
 * 本地存储服务
 * 提供保存和获取用户ID、奶茶记录等功能
 */
import config from "../config/env";

// 存储键名
const STORAGE_KEYS = config.storage.keys;

/**
 * 保存用户ID到本地存储
 * @param {string} userId 用户ID
 */
export const saveUserId = (userId) => {
  if (userId) {
    localStorage.setItem(STORAGE_KEYS.userId, userId);
  }
};

/**
 * 从本地存储获取用户ID
 * @returns {string|null} 用户ID，如果不存在则返回null
 */
export const getUserId = () => {
  return localStorage.getItem(STORAGE_KEYS.userId);
};

/**
 * 清除用户ID（登出）
 */
export const clearUserId = () => {
  localStorage.removeItem(STORAGE_KEYS.userId);
};

/**
 * 保存奶茶记录到本地存储
 * @param {Array} records 奶茶记录数组
 */
export const saveTeaRecords = (records) => {
  if (records && Array.isArray(records)) {
    localStorage.setItem(STORAGE_KEYS.teaRecords, JSON.stringify(records));
    // 更新同步时间
    localStorage.setItem(STORAGE_KEYS.lastSync, new Date().toISOString());
  }
};

/**
 * 从本地存储获取奶茶记录
 * @returns {Array} 奶茶记录数组，如果不存在则返回空数组
 */
export const getTeaRecords = () => {
  const records = localStorage.getItem(STORAGE_KEYS.teaRecords);
  return records ? JSON.parse(records) : [];
};

/**
 * 添加单条奶茶记录到本地存储
 * @param {Object} record 单条奶茶记录
 */
export const addTeaRecord = (record) => {
  if (record) {
    const records = getTeaRecords();

    // 如果是本地记录，生成临时ID
    if (!record.id) {
      record.id = `local_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      record.isLocalOnly = true;
    }

    records.push(record);
    saveTeaRecords(records);
  }
};

/**
 * 更新本地存储中的单条奶茶记录
 * @param {Object} updatedRecord 更新后的奶茶记录
 */
export const updateTeaRecord = (updatedRecord) => {
  if (updatedRecord && updatedRecord.id) {
    const records = getTeaRecords();
    const index = records.findIndex((record) => record.id === updatedRecord.id);

    if (index !== -1) {
      records[index] = { ...records[index], ...updatedRecord };
      saveTeaRecords(records);
    }
  }
};

/**
 * 获取最后同步时间
 * @returns {Date|null} 最后同步时间，如果不存在则返回null
 */
export const getLastSyncTime = () => {
  const lastSync = localStorage.getItem(STORAGE_KEYS.lastSync);
  return lastSync ? new Date(lastSync) : null;
};

/**
 * 检查是否需要同步数据
 * @param {number} syncInterval 同步间隔（毫秒）
 * @returns {boolean} 是否需要同步
 */
export const shouldSync = (syncInterval = config.storage.syncInterval) => {
  const lastSync = getLastSyncTime();
  if (!lastSync) return true;

  const now = new Date();
  return now.getTime() - lastSync.getTime() > syncInterval;
};

/**
 * 获取本地存储中的未同步记录
 * @returns {Array} 未同步的奶茶记录数组
 */
export const getUnsyncedRecords = () => {
  const records = getTeaRecords();
  return records.filter((record) => record.isLocalOnly);
};

/**
 * 标记记录为已同步
 * @param {string} localId 本地ID
 * @param {string} serverId 服务器ID
 */
export const markRecordSynced = (localId, serverId) => {
  const records = getTeaRecords();
  const index = records.findIndex((record) => record.id === localId);

  if (index !== -1) {
    records[index].id = serverId;
    records[index].isLocalOnly = false;
    saveTeaRecords(records);
  }
};

/**
 * 保存认证令牌到本地存储
 * @param {string} token 认证令牌
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.authToken, token);
  }
};

/**
 * 从本地存储获取认证令牌
 * @returns {string|null} 认证令牌，如果不存在则返回null
 */
export const getToken = () => {
  return localStorage.getItem(STORAGE_KEYS.authToken);
};

/**
 * 清除认证令牌（登出）
 */
export const clearToken = () => {
  localStorage.removeItem(STORAGE_KEYS.authToken);
};

export default {
  saveUserId,
  getUserId,
  clearUserId,
  saveTeaRecords,
  getTeaRecords,
  addTeaRecord,
  updateTeaRecord,
  getLastSyncTime,
  shouldSync,
  getUnsyncedRecords,
  markRecordSynced,
  saveToken,
  getToken,
  clearToken,
};
