const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwtConfig");
const logger = require("../utils/logger");

exports.authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      logger.warn("未提供認證令牌");
      return res.status(401).json({ message: "請先登入" });
    }

    jwt.verify(token, jwtConfig.secret, (err, user) => {
      if (err) {
        logger.warn("令牌驗證失敗", { error: err.message });
        return res.status(403).json({ message: "無效的認證令牌" });
      }
      req.user = user;
      logger.info("用戶認證成功", { userId: user.id, role: user.role });
      next();
    });
  } catch (error) {
    logger.error("認證中間件錯誤", { error: error.message });
    return res.status(500).json({ message: "伺服器錯誤" });
  }
};

// 檢查是否為管理員
exports.isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "請先登入" });
  }

  if (req.user.role !== "admin") {
    logger.warn("非管理員嘗試訪問管理功能", {
      userId: req.user.id,
      role: req.user.role,
    });
    return res.status(403).json({ message: "需要管理員權限" });
  }

  logger.info("管理員權限驗證成功", { userId: req.user.id });
  next();
};
