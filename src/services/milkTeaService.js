import * as localStorageService from "./localStorageService";

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
      if (filters.sort) queryParams.append("sort", filters.sort);
      if (filters.order) queryParams.append("order", filters.order);

      const queryString = queryParams.toString();
      const url = `http://localhost:3001/api/milktea${
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
      return localStorageService.getTeaRecords();
    }
  } catch (error) {
    console.error("获取奶茶记录失败:", error);

    // 如果后端请求失败，尝试从本地存储获取
    console.log("后端请求失败，从本地存储获取奶茶记录");
    return localStorageService.getTeaRecords();
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
        `http://localhost:3001/api/milktea/stats/summary?userId=${userId}`
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

      const response = await fetch("http://localhost:3001/api/milktea", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
    const userId = localStorageService.getUserId();

    // 如果有用户ID且在线，则更新后端
    if (userId && navigator.onLine && !id.startsWith("local_")) {
      const response = await fetch(`http://localhost:3001/api/milktea/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(
          `更新奶茶记录失败: ${response.status} ${response.statusText}`
        );
      }

      const updatedRecord = await response.json();

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

    // 如果后端请求失败，更新本地存储
    console.log("后端请求失败，更新本地存储中的奶茶记录");
    const updatedRecord = { ...data, id, updatedAt: new Date().toISOString() };
    localStorageService.updateTeaRecord(updatedRecord);
    return updatedRecord;
  }
};

/**
 * 同步本地数据到后端
 * @returns {Promise<Object>} - 返回同步结果
 */
export const syncLocalData = async () => {
  try {
    const userId = localStorageService.getUserId();

    // 如果没有用户ID或不在线，则无法同步
    if (!userId || !navigator.onLine) {
      return { success: false, message: "无法同步数据：未登录或离线" };
    }

    // 获取未同步的记录
    const unsyncedRecords = localStorageService.getUnsyncedRecords();

    if (unsyncedRecords.length === 0) {
      return { success: true, message: "没有需要同步的数据" };
    }

    // 同步每条记录
    const syncResults = await Promise.all(
      unsyncedRecords.map(async (record) => {
        try {
          // 移除本地ID和标记
          const { id, isLocalOnly, ...recordData } = record;

          // 添加用户ID
          const dataWithUserId = { ...recordData, userId };

          const response = await fetch("http://localhost:3001/api/milktea", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dataWithUserId),
          });

          if (!response.ok) {
            throw new Error(
              `同步记录失败: ${response.status} ${response.statusText}`
            );
          }

          const savedRecord = await response.json();

          // 标记记录为已同步
          localStorageService.markRecordSynced(id, savedRecord.id);

          return { success: true, localId: id, serverId: savedRecord.id };
        } catch (error) {
          console.error(`同步记录 ${record.id} 失败:`, error);
          return { success: false, localId: record.id, error: error.message };
        }
      })
    );

    // 获取最新的记录
    await getAllMilkTeas({}, true);

    return {
      success: true,
      message: `同步完成: ${syncResults.filter((r) => r.success).length}/${
        unsyncedRecords.length
      } 条记录同步成功`,
      results: syncResults,
    };
  } catch (error) {
    console.error("同步数据失败:", error);
    return { success: false, message: `同步失败: ${error.message}` };
  }
};
