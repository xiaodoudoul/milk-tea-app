const express = require("express");
const router = express.Router();
const { MilkTea, sequelize } = require("../models");
const { Op } = require("sequelize");
const {
  optionalAuthenticateToken,
  authenticateToken,
} = require("../middleware/auth");

// 应用可选认证中间件到所有路由
router.use(optionalAuthenticateToken);

/**
 * 获取所有奶茶记录
 * GET /api/milktea
 */
router.get("/", async (req, res, next) => {
  try {
    const { brand, flavor, startDate, endDate, sort, order, userId } =
      req.query;

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

    // 如果提供了userId参数或用户已登录，则按用户ID过滤
    if (userId) {
      where.userId = userId;
    } else if (req.user) {
      where.userId = req.user.id;
    }

    // 构建排序条件
    const order_by = [];
    if (sort && order) {
      order_by.push([sort, order.toUpperCase()]);
    } else {
      order_by.push(["createdAt", "DESC"]);
    }

    const milkTeas = await MilkTea.findAll({
      where,
      order: order_by,
    });

    res.json(milkTeas);
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
      userId,
    } = req.body;

    // 验证必填字段
    if (!brand || !flavor || !price) {
      return res.status(400).json({ error: "品牌、口味和价格为必填项" });
    }

    // 确定用户ID
    let userIdToUse = userId;

    // 如果请求中没有提供userId但用户已登录，则使用登录用户的ID
    if (!userIdToUse && req.user) {
      userIdToUse = req.user.id;
    }

    // 创建记录
    const milkTea = await MilkTea.create({
      brand,
      flavor,
      price,
      purchaseDate: purchaseDate || new Date(),
      calories,
      sugar,
      caffeine,
      fat,
      notes,
      userId: userIdToUse,
    });

    res.status(201).json(milkTea);
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

    console.log(`尝试更新奶茶记录 ID: ${id}`, req.body);

    // 查找记录
    const milkTea = await MilkTea.findByPk(id);

    if (!milkTea) {
      console.log(`未找到奶茶记录 ID: ${id}`);
      return res.status(404).json({ error: "未找到该奶茶记录" });
    }

    // 验证权限：只有记录的创建者或管理员可以更新
    if (milkTea.userId && req.user && milkTea.userId !== req.user.id) {
      console.log(`用户 ${req.user.id} 无权更新记录 ${id}`);
      return res.status(403).json({ error: "无权更新此记录" });
    }

    // 验证必填字段
    if (!brand && !flavor && price === undefined) {
      return res.status(400).json({ error: "至少需要提供一个字段进行更新" });
    }

    // 验证价格
    if (price !== undefined && (isNaN(price) || price < 0)) {
      return res.status(400).json({ error: "价格必须是非负数" });
    }

    // 准备更新数据
    const updateData = {};

    if (brand !== undefined) updateData.brand = brand;
    if (flavor !== undefined) updateData.flavor = flavor;
    if (price !== undefined) updateData.price = price;
    if (purchaseDate !== undefined) updateData.purchaseDate = purchaseDate;
    if (calories !== undefined) updateData.calories = calories;
    if (sugar !== undefined) updateData.sugar = sugar;
    if (caffeine !== undefined) updateData.caffeine = caffeine;
    if (fat !== undefined) updateData.fat = fat;
    if (notes !== undefined) updateData.notes = notes;

    console.log(`更新奶茶记录 ID: ${id}`, updateData);

    // 更新记录
    await milkTea.update(updateData);

    // 获取更新后的记录
    const updatedMilkTea = await MilkTea.findByPk(id);

    console.log(`奶茶记录 ID: ${id} 更新成功`);
    res.json(updatedMilkTea);
  } catch (error) {
    console.error(`更新奶茶记录失败:`, error);
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

    // 验证权限：只有记录的创建者或管理员可以删除
    if (milkTea.userId && req.user && milkTea.userId !== req.user.id) {
      return res.status(403).json({ error: "无权删除此记录" });
    }

    await milkTea.destroy();
    res.json({ message: "记录已成功删除" });
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
    const { userId } = req.query;

    // 构建查询条件
    const where = {};

    // 如果提供了userId参数或用户已登录，则按用户ID过滤
    if (userId) {
      where.userId = userId;
    } else if (req.user) {
      where.userId = req.user.id;
    }

    const totalCount = await MilkTea.count({ where });
    const totalSpent = await MilkTea.sum("price", { where });
    const avgPrice = totalSpent / totalCount || 0;

    // 获取平均热量
    const avgCalories = await MilkTea.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("calories")), "avgCalories"],
      ],
      where: {
        ...where,
        calories: { [Op.not]: null },
      },
      raw: true,
    });

    // 获取品牌统计
    const brands = await MilkTea.findAll({
      attributes: [
        "brand",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where,
      group: ["brand"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
    });

    // 获取口味统计
    const flavors = await MilkTea.findAll({
      attributes: [
        "flavor",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where,
      group: ["flavor"],
      order: [[sequelize.fn("COUNT", sequelize.col("id")), "DESC"]],
    });

    res.json({
      totalCount,
      totalSpent,
      avgPrice,
      avgCalories: avgCalories?.avgCalories || 0,
      brands,
      flavors,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
