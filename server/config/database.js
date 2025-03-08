const { Sequelize } = require("sequelize");
const path = require("path");

// 创建Sequelize实例，连接到SQLite数据库
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(__dirname, "../data/milktea.sqlite"),
  logging: false, // 设置为true可以在控制台看到SQL查询
});

// 测试数据库连接
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("数据库连接成功");
  } catch (error) {
    console.error("数据库连接失败:", error);
  }
};

module.exports = {
  sequelize,
  testConnection,
};
