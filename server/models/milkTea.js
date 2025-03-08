const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

// 定义奶茶消费记录模型
const MilkTea = sequelize.define(
  "MilkTea",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "奶茶品牌",
    },
    flavor: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: "奶茶口味",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: "奶茶价格",
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      comment: "购买日期",
    },
    calories: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "热量(大卡)",
    },
    sugar: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "含糖量(克)",
    },
    caffeine: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "咖啡因含量(毫克)",
    },
    fat: {
      type: DataTypes.FLOAT,
      allowNull: true,
      comment: "脂肪含量(克)",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "备注",
    },
  },
  {
    tableName: "milk_teas",
    timestamps: true, // 创建createdAt和updatedAt字段
    comment: "奶茶消费记录表",
  }
);

module.exports = MilkTea;
