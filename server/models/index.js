const { sequelize } = require("../config/database");
const MilkTea = require("./milkTea");

// 初始化所有模型
const initModels = async () => {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ alter: true });
    console.log("所有模型已同步到数据库");
  } catch (error) {
    console.error("模型同步失败:", error);
  }
};

module.exports = {
  sequelize,
  MilkTea,
  initModels,
};
