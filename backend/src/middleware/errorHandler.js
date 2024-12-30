const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  // 记录错误
  logger.error(`${err.name}: ${err.message}`);
  logger.error(err.stack);

  // 设置默认错误状态码和消息
  let statusCode = 500;
  let message = "服务器内部错误";

  // 根据错误类型设置适当的状态码和消息
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "输入验证失败";
  } else if (err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "未经授权";
  } else if (err.name === "ForbiddenError") {
    statusCode = 403;
    message = "禁止访问";
  } else if (err.name === "NotFoundError") {
    statusCode = 404;
    message = "资源未找到";
  }

  // 发送错误响应
  res.status(statusCode).json({
    error: {
      message,
      stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
    },
  });
};

module.exports = { errorHandler };
