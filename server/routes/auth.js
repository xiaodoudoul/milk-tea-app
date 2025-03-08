const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { authenticateToken } = require("../middleware/auth");

/**
 * 用户注册
 * POST /api/auth/register
 */
router.post("/register", async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码为必填项" });
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ error: "用户名已被使用" });
    }

    // 检查邮箱是否已存在
    if (email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(409).json({ error: "邮箱已被使用" });
      }
    }

    // 创建新用户
    const user = await User.create({
      username,
      password, // 密码会在模型的钩子中自动哈希
      email,
      lastLogin: new Date(),
    });

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 返回用户信息和令牌
    res.status(201).json({
      message: "注册成功",
      userId: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    console.error("注册失败:", error);
    res.status(500).json({ error: "注册失败，请稍后再试" });
  }
});

/**
 * 用户登录
 * POST /api/auth/login
 */
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 验证必填字段
    if (!username || !password) {
      return res.status(400).json({ error: "用户名和密码为必填项" });
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: "用户名或密码不正确" });
    }

    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "用户名或密码不正确" });
    }

    // 检查用户状态
    if (!user.isActive) {
      return res.status(403).json({ error: "账号已被禁用" });
    }

    // 更新最后登录时间
    await user.update({ lastLogin: new Date() });

    // 生成JWT令牌
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // 返回用户信息和令牌
    res.json({
      message: "登录成功",
      userId: user.id,
      username: user.username,
      token,
    });
  } catch (error) {
    console.error("登录失败:", error);
    res.status(500).json({ error: "登录失败，请稍后再试" });
  }
});

/**
 * 用户登出
 * POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
  // JWT是无状态的，客户端只需要删除令牌
  // 这个端点主要是为了保持API的一致性
  res.json({ message: "登出成功" });
});

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
router.get("/me", authenticateToken, async (req, res) => {
  try {
    // 用户信息已在认证中间件中添加到请求对象
    res.json({
      userId: req.user.id,
      username: req.user.username,
      email: req.user.email,
    });
  } catch (error) {
    console.error("获取用户信息失败:", error);
    res.status(500).json({ error: "获取用户信息失败" });
  }
});

module.exports = router;
