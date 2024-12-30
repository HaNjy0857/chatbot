const authService = require("../services/authService");
const logger = require("../utils/logger");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    logger.info("開始註冊流程", { username, email });

    const result = await authService.register(username, email, password);

    if (!result.success) {
      return res.status(409).json(result);
    }

    res.status(201).json(result);
  } catch (error) {
    logger.error("註冊錯誤:", error);
    res.status(500).json({ success: false, message: "服務器錯誤，請稍後再試" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    logger.info("開始登入流程", { email });

    const result = await authService.login(email, password);

    if (!result.success) {
      return res.status(401).json(result);
    }

    res.status(200).json(result);
  } catch (error) {
    logger.error("登入過程中發生錯誤", { error: error.message });
    res.status(500).json({ success: false, message: "服務器錯誤，請稍後再試" });
  }
};
