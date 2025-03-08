require("dotenv").config();
const express = require("express");
const cors = require("cors");
const deepseekRoutes = require("./routes/deepseek");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(logger);

// 健康检查路由
app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({ status: "ok", message: "DeepSeek API代理服务运行正常" });
});

// 路由
app.use("/api/deepseek", deepseekRoutes);

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
