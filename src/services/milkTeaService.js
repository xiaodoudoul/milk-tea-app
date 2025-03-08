/**
 * 获取所有奶茶消费记录
 * @param {Object} filters - 过滤条件，如品牌、口味、日期范围等
 * @returns {Promise<Array>} - 返回奶茶消费记录数组
 */
export const getAllMilkTeas = async (filters = {}) => {
  try {
    // 构建查询参数
    const queryParams = new URLSearchParams();

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

    return await response.json();
  } catch (error) {
    console.error("获取奶茶记录失败:", error);
    throw error;
  }
};

/**
 * 获取奶茶消费统计信息
 * @returns {Promise<Object>} - 返回统计信息
 */
export const getMilkTeaStats = async () => {
  try {
    const response = await fetch(
      "http://localhost:3001/api/milktea/stats/summary"
    );

    if (!response.ok) {
      throw new Error(
        `获取奶茶统计信息失败: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("获取奶茶统计信息失败:", error);
    throw error;
  }
};

/**
 * 创建奶茶消费记录
 * @param {Object} data - 奶茶消费记录数据
 * @returns {Promise<Object>} - 返回创建的记录
 */
export const createMilkTea = async (data) => {
  try {
    const response = await fetch("http://localhost:3001/api/milktea", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(
        `创建奶茶记录失败: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("创建奶茶记录失败:", error);
    throw error;
  }
};
