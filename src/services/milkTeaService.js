import * as localStorageService from "./localStorageService";
import config from "../config/env";

/**
 * 获取所有奶茶消费记录
 * @param {Object} filters - 过滤条件，如品牌、口味、日期范围等
 * @param {boolean} forceRemote - 是否强制从后端获取数据
 * @returns {Promise<Array>} - 返回奶茶消费记录数组
 */
export const getAllMilkTeas = async (filters = {}, forceRemote = false) => {
  try {
    const userId = localStorageService.getUserId();

    // 如果有用户ID或强制从后端获取，则从后端获取数据
    if ((userId || forceRemote) && navigator.onLine) {
      // 构建查询参数
      const queryParams = new URLSearchParams();

      if (userId) queryParams.append("userId", userId);
      if (filters.brand) queryParams.append("brand", filters.brand);
      if (filters.flavor) queryParams.append("flavor", filters.flavor);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);

      // 设置默认排序为购买日期降序
      const sort = filters.sort || "purchaseDate";
      const order = filters.order || "DESC";
      queryParams.append("sort", sort);
      queryParams.append("order", order);

      const queryString = queryParams.toString();
      const url = `${config.api.endpoints.milkTea}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `获取奶茶记录失败: ${response.status} ${response.statusText}`
        );
      }

      const records = await response.json();

      // 保存到本地存储
      localStorageService.saveTeaRecords(records);

      return records;
    } else {
      // 从本地存储获取数据
      console.log("从本地存储获取奶茶记录");
      const records = localStorageService.getTeaRecords();

      // 对本地数据进行排序
      return records.sort((a, b) => {
        const dateA = new Date(a.purchaseDate);
        const dateB = new Date(b.purchaseDate);
        return dateB - dateA; // 降序排序
      });
    }
  } catch (error) {
    console.error("获取奶茶记录失败:", error);

    // 如果后端请求失败，尝试从本地存储获取
    console.log("后端请求失败，从本地存储获取奶茶记录");
    const records = localStorageService.getTeaRecords();

    // 对本地数据进行排序
    return records.sort((a, b) => {
      const dateA = new Date(a.purchaseDate);
      const dateB = new Date(b.purchaseDate);
      return dateB - dateA; // 降序排序
    });
  }
};

/**
 * 获取奶茶消费统计信息
 * @returns {Promise<Object>} - 返回统计信息
 */
export const getMilkTeaStats = async () => {
  try {
    const userId = localStorageService.getUserId();

    // 如果有用户ID且在线，则从后端获取数据
    if (userId && navigator.onLine) {
      const response = await fetch(
        `${config.api.endpoints.milkTea}/stats/summary?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error(
          `获取奶茶统计信息失败: ${response.status} ${response.statusText}`
        );
      }

      return await response.json();
    } else {
      // 从本地数据计算统计信息
      const records = localStorageService.getTeaRecords();

      // 计算总消费金额
      const totalSpent = records.reduce(
        (sum, record) => sum + (record.price || 0),
        0
      );

      // 计算品牌分布
      const brandDistribution = records.reduce((acc, record) => {
        if (record.brand) {
          acc[record.brand] = (acc[record.brand] || 0) + 1;
        }
        return acc;
      }, {});

      // 计算平均热量
      const recordsWithCalories = records.filter((record) => record.calories);
      const avgCalories =
        recordsWithCalories.length > 0
          ? recordsWithCalories.reduce(
              (sum, record) => sum + record.calories,
              0
            ) / recordsWithCalories.length
          : 0;

      return {
        totalRecords: records.length,
        totalSpent,
        brandDistribution,
        avgCalories,
        isLocalData: true,
      };
    }
  } catch (error) {
    console.error("获取奶茶统计信息失败:", error);

    // 如果后端请求失败，从本地数据计算统计信息
    const records = localStorageService.getTeaRecords();

    // 计算总消费金额
    const totalSpent = records.reduce(
      (sum, record) => sum + (record.price || 0),
      0
    );

    // 计算品牌分布
    const brandDistribution = records.reduce((acc, record) => {
      if (record.brand) {
        acc[record.brand] = (acc[record.brand] || 0) + 1;
      }
      return acc;
    }, {});

    // 计算平均热量
    const recordsWithCalories = records.filter((record) => record.calories);
    const avgCalories =
      recordsWithCalories.length > 0
        ? recordsWithCalories.reduce(
            (sum, record) => sum + record.calories,
            0
          ) / recordsWithCalories.length
        : 0;

    return {
      totalRecords: records.length,
      totalSpent,
      brandDistribution,
      avgCalories,
      isLocalData: true,
    };
  }
};

/**
 * 创建奶茶消费记录
 * @param {Object} data - 奶茶消费记录数据
 * @returns {Promise<Object>} - 返回创建的记录
 */
export const createMilkTea = async (data) => {
  try {
    const userId = localStorageService.getUserId();

    // 如果有用户ID且在线，则保存到后端
    if (userId && navigator.onLine) {
      // 添加用户ID
      const dataWithUserId = { ...data, userId };

      const response = await fetch(config.api.endpoints.milkTea, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorageService.getToken()}`,
        },
        body: JSON.stringify(dataWithUserId),
      });

      if (!response.ok) {
        throw new Error(
          `创建奶茶记录失败: ${response.status} ${response.statusText}`
        );
      }

      const savedRecord = await response.json();

      // 保存到本地存储
      localStorageService.addTeaRecord(savedRecord);

      return savedRecord;
    } else {
      // 保存到本地存储
      console.log("保存奶茶记录到本地存储");
      const localRecord = { ...data, createdAt: new Date().toISOString() };
      localStorageService.addTeaRecord(localRecord);
      return localRecord;
    }
  } catch (error) {
    console.error("创建奶茶记录失败:", error);

    // 如果后端请求失败，保存到本地存储
    console.log("后端请求失败，保存奶茶记录到本地存储");
    const localRecord = { ...data, createdAt: new Date().toISOString() };
    localStorageService.addTeaRecord(localRecord);
    return localRecord;
  }
};

/**
 * 更新奶茶消费记录
 * @param {string} id - 记录ID
 * @param {Object} data - 更新的数据
 * @returns {Promise<Object>} - 返回更新后的记录
 */
export const updateMilkTea = async (id, data) => {
  try {
    console.log(`尝试更新奶茶记录 ID: ${id}`, data);
    const userId = localStorageService.getUserId();

    // 如果有用户ID且在线，则更新后端
    if (userId && navigator.onLine && !id.toString().startsWith("local_")) {
      const response = await fetch(`${config.api.endpoints.milkTea}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorageService.getToken()}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error ||
          `更新失败: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const updatedRecord = await response.json();
      console.log(`奶茶记录 ID: ${id} 更新成功`, updatedRecord);

      // 更新本地存储
      localStorageService.updateTeaRecord(updatedRecord);

      return updatedRecord;
    } else {
      // 更新本地存储
      console.log("更新本地存储中的奶茶记录");
      const updatedRecord = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
      };
      localStorageService.updateTeaRecord(updatedRecord);
      return updatedRecord;
    }
  } catch (error) {
    console.error("更新奶茶记录失败:", error);

    // 如果后端请求失败，尝试更新本地存储
    if (error.message.includes("更新失败") || !navigator.onLine) {
      console.log("后端请求失败，更新本地存储中的奶茶记录");
      const updatedRecord = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        isLocalOnly: true,
      };
      localStorageService.updateTeaRecord(updatedRecord);
      return updatedRecord;
    }

    throw error;
  }
};

/**
 * 同步本地数据到服务器
 * @returns {Promise<Object>} - 返回同步结果
 */
export const syncLocalData = async () => {
  try {
    const userId = localStorageService.getUserId();
    const token = localStorageService.getToken();

    // 如果没有用户ID或不在线，则无法同步
    if (!userId || !token || !navigator.onLine) {
      return { success: false, message: "无法连接到服务器或未登录" };
    }

    // 获取未同步的记录
    const unsyncedRecords = localStorageService.getUnsyncedRecords();

    if (unsyncedRecords.length === 0) {
      return { success: true, message: "没有需要同步的数据" };
    }

    // 同步结果
    const results = {
      success: true,
      total: unsyncedRecords.length,
      synced: 0,
      failed: 0,
      details: [],
    };

    // 逐个同步记录
    for (const record of unsyncedRecords) {
      try {
        const localId = record.id;

        // 移除本地ID和标记
        const { id, isLocalOnly, ...recordData } = record;

        // 添加用户ID
        recordData.userId = userId;

        // 发送到服务器
        const response = await fetch(config.api.endpoints.milkTea, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(recordData),
        });

        if (!response.ok) {
          throw new Error(
            `同步失败: ${response.status} ${response.statusText}`
          );
        }

        const savedRecord = await response.json();

        // 标记为已同步
        localStorageService.markRecordSynced(localId, savedRecord.id);

        results.synced++;
        results.details.push({
          localId,
          serverId: savedRecord.id,
          success: true,
        });
      } catch (error) {
        console.error(`同步记录 ${record.id} 失败:`, error);
        results.failed++;
        results.details.push({
          localId: record.id,
          success: false,
          error: error.message,
        });
      }
    }

    // 如果有失败的记录，则标记整体同步为部分成功
    if (results.failed > 0) {
      results.success = false;
      results.message = `同步部分完成: ${results.synced}/${results.total} 条记录已同步`;
    } else {
      results.message = `同步完成: ${results.synced} 条记录已同步`;
    }

    return results;
  } catch (error) {
    console.error("同步数据失败:", error);
    return {
      success: false,
      message: `同步失败: ${error.message}`,
    };
  }
};
