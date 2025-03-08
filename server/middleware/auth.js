const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * 验证JWT令牌的中间件
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ error: "未提供认证令牌" });
    }

    // 验证令牌
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ error: "令牌无效或已过期" });
      }

      // 查找用户
      const user = await User.findByPk(decoded.userId);

      if (!user) {
        return res.status(404).json({ error: "用户不存在" });
      }

      if (!user.isActive) {
        return res.status(403).json({ error: "用户账号已被禁用" });
      }

      // 将用户信息添加到请求对象
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      next();
    });
  } catch (error) {
    console.error("认证中间件错误:", error);
    res.status(500).json({ error: "服务器内部错误" });
  }
};

/**
 * 可选的认证中间件，不强制要求用户登录
 */
const optionalAuthenticateToken = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    // 如果没有令牌，继续处理请求
    if (!token) {
      return next();
    }

    // 验证令牌
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        // 令牌无效，但不阻止请求
        return next();
      }

      // 查找用户
      const user = await User.findByPk(decoded.userId);

      if (user && user.isActive) {
        // 将用户信息添加到请求对象
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
        };
      }

      next();
    });
  } catch (error) {
    console.error("可选认证中间件错误:", error);
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
};
