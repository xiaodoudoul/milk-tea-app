require("dotenv").config();
const express = require("express");
const cors = require("cors");
const deepseekRoutes = require("./routes/deepseek");
const milkTeaRoutes = require("./routes/milkTea");
const ocrRoutes = require("./routes/ocr");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
const { testConnection } = require("./config/database");
const { initModels } = require("./models");
const { initCOSSync } = require("./services/cosService");

const app = express();
const PORT = process.env.PORT || 9000;

// 初始化数据库和 COS 同步
(async () => {
  try {
    // 先从 COS 同步数据库文件
    console.log("正在初始化 COS 同步服务...");
    await initCOSSync();

    // 然后初始化数据库连接
    console.log("正在初始化数据库连接...");
    await testConnection();
    await initModels();

    console.log("服务初始化完成");
  } catch (error) {
    console.error("服务初始化失败:", error);
  }
})();

// 中间件
app.use(cors());
app.use(express.json({ limit: "50mb" })); // 增加请求体大小限制，以支持Base64图片
app.use(logger);

// 健康检查路由
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "DeepSeek API代理服务运行正常" });
});

// 路由
app.use("/api/deepseek", deepseekRoutes);
app.use("/api/milktea", milkTeaRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api/auth", authRoutes);

// 错误处理中间件
app.use(errorHandler);

// 处理404错误
app.use((req, res) => {
  res.status(404).json({ error: "未找到请求的资源" });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
});
