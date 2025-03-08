/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  console.error("服务器错误:", err.stack);

  // 检查是否是已知错误类型
  if (err.response && err.response.data) {
    // API调用错误
    return res.status(err.response.status || 500).json({
      error: "外部API调用失败",
      message: err.message,
      details: err.response.data,
    });
  }

  // 默认错误响应
  res.status(500).json({
    error: "服务器内部错误",
    message: err.message,
  });
}

module.exports = errorHandler;
