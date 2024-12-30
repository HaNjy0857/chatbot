const chatroomService = require("../services/chatroomService");
const logger = require("../utils/logger");

exports.getRooms = async (req, res) => {
  try {
    const result = await chatroomService.getRooms();
    res.status(200).json(result);
  } catch (error) {
    logger.error("獲取聊天室列表錯誤:", error);
    res.status(500).json({ success: false, message: "服務器錯誤，請稍後再試" });
  }
};
