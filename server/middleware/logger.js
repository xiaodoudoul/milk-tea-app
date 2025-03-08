/**
 * 请求日志中间件
 */
function logger(req, res, next) {
  const start = Date.now();
  const { method, url, ip } = req;

  // 请求开始日志
  console.log(`[${new Date().toISOString()}] ${method} ${url} - 来自 ${ip}`);

  // 响应完成后记录
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;

    console.log(
      `[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${duration}ms`
    );
  });

  next();
}

module.exports = logger;
