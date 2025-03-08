const { sequelize } = require("../config/database");
const MilkTea = require("./milkTea");
const User = require("./user");

// 设置模型关联
User.hasMany(MilkTea, { foreignKey: "userId" });
MilkTea.belongsTo(User, { foreignKey: "userId" });

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
  User,
  initModels,
};
