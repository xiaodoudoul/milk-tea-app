const { sequelize } = require("../config/database");
const MilkTea = require("./milkTea");
const User = require("./user");
const { throttledUpload } = require("../services/cosService");

// 设置模型关联
User.hasMany(MilkTea, { foreignKey: "userId" });
MilkTea.belongsTo(User, { foreignKey: "userId" });

// 添加钩子，在数据变更后触发上传
const addSyncHooks = () => {
  const models = [MilkTea, User];

  models.forEach((model) => {
    // 创建后
    model.afterCreate(() => {
      console.log(`${model.name} 创建后触发同步`);
      throttledUpload();
    });

    // 更新后
    model.afterUpdate(() => {
      console.log(`${model.name} 更新后触发同步`);
      throttledUpload();
    });

    // 删除后
    model.afterDestroy(() => {
      console.log(`${model.name} 删除后触发同步`);
      throttledUpload();
    });

    // 批量操作后
    model.afterBulkCreate(() => {
      console.log(`${model.name} 批量创建后触发同步`);
      throttledUpload();
    });

    model.afterBulkUpdate(() => {
      console.log(`${model.name} 批量更新后触发同步`);
      throttledUpload();
    });

    model.afterBulkDestroy(() => {
      console.log(`${model.name} 批量删除后触发同步`);
      throttledUpload();
    });
  });
};

// 初始化所有模型
const initModels = async () => {
  try {
    // 同步所有模型到数据库
    await sequelize.sync({ alter: true });
    console.log("所有模型已同步到数据库");

    // 添加同步钩子
    addSyncHooks();
    console.log("已添加数据库同步钩子");
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
