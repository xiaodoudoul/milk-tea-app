const express = require("express");
const router = express.Router();
const { MilkTea, sequelize } = require("../models");
const { Op } = require("sequelize");

/**
 * 获取所有奶茶记录
 * GET /api/milktea
 */
router.get("/", async (req, res, next) => {
  try {
    const { brand, flavor, startDate, endDate, sort, order } = req.query;

    // 构建查询条件
    const where = {};
    if (brand) {
      where.brand = { [Op.like]: `%${brand}%` };
    }
    if (flavor) {
      where.flavor = { [Op.like]: `%${flavor}%` };
    }
    if (startDate && endDate) {
      where.purchaseDate = {
        [Op.between]: [startDate, endDate],
      };
    } else if (startDate) {
      where.purchaseDate = { [Op.gte]: startDate };
    } else if (endDate) {
      where.purchaseDate = { [Op.lte]: endDate };
    }

    // 构建排序条件
    const orderOptions = [];
    if (
      sort &&
      ["brand", "flavor", "price", "purchaseDate", "calories"].includes(sort)
    ) {
      orderOptions.push([sort, order === "desc" ? "DESC" : "ASC"]);
    } else {
      orderOptions.push(["purchaseDate", "DESC"]); // 默认按购买日期降序
    }

    const milkTeas = await MilkTea.findAll({
      where,
      order: orderOptions,
    });

    res.status(200).json(milkTeas);
  } catch (error) {
    next(error);
  }
});

/**
 * 获取单个奶茶记录
 * GET /api/milktea/:id
 */
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const milkTea = await MilkTea.findByPk(id);

    if (!milkTea) {
      return res.status(404).json({ error: "未找到该奶茶记录" });
    }

    res.status(200).json(milkTea);
  } catch (error) {
    next(error);
  }
});

/**
 * 创建奶茶记录
 * POST /api/milktea
 */
router.post("/", async (req, res, next) => {
  try {
    const {
      brand,
      flavor,
      price,
      purchaseDate,
      calories,
      sugar,
      caffeine,
      fat,
      notes,
    } = req.body;

    // 验证必填字段
    if (!brand || !flavor || !price || !purchaseDate) {
      return res
        .status(400)
        .json({ error: "品牌、口味、价格和购买日期为必填项" });
    }

    const newMilkTea = await MilkTea.create({
      brand,
      flavor,
      price,
      purchaseDate,
      calories,
      sugar,
      caffeine,
      fat,
      notes,
    });

    res.status(201).json(newMilkTea);
  } catch (error) {
    next(error);
  }
});

/**
 * 更新奶茶记录
 * PUT /api/milktea/:id
 */
router.put("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      brand,
      flavor,
      price,
      purchaseDate,
      calories,
      sugar,
      caffeine,
      fat,
      notes,
    } = req.body;

    const milkTea = await MilkTea.findByPk(id);
    if (!milkTea) {
      return res.status(404).json({ error: "未找到该奶茶记录" });
    }

    // 更新记录
    await milkTea.update({
      brand,
      flavor,
      price,
      purchaseDate,
      calories,
      sugar,
      caffeine,
      fat,
      notes,
    });

    res.status(200).json(milkTea);
  } catch (error) {
    next(error);
  }
});

/**
 * 删除奶茶记录
 * DELETE /api/milktea/:id
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const milkTea = await MilkTea.findByPk(id);
    if (!milkTea) {
      return res.status(404).json({ error: "未找到该奶茶记录" });
    }

    await milkTea.destroy();

    res.status(200).json({ message: "奶茶记录已成功删除" });
  } catch (error) {
    next(error);
  }
});

/**
 * 获取奶茶统计信息
 * GET /api/milktea/stats/summary
 */
router.get("/stats/summary", async (req, res, next) => {
  try {
    const totalCount = await MilkTea.count();
    const totalSpent = await MilkTea.sum("price");
    const avgPrice = totalSpent / totalCount || 0;

    // 获取品牌统计
    const brands = await MilkTea.findAll({
      attributes: [
        "brand",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["brand"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
    });

    // 获取口味统计
    const flavors = await MilkTea.findAll({
      attributes: [
        "flavor",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: ["flavor"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
    });

    res.status(200).json({
      totalCount,
      totalSpent,
      avgPrice,
      brands,
      flavors,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
