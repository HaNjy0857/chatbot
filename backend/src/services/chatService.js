const Message = require("../models/message");
const logger = require("../utils/logger");

exports.saveMessage = async (
  roomName,
  content,
  userId,
  username,
  type = "text"
) => {
  try {
    const message = new Message({
      room: String(roomName),
      user: String(userId),
      username: String(username),
      content: type,
      text: content,
    });

    const savedMessage = await message.save();

    const formattedMessage = {
      success: true,
      data: {
        id: savedMessage._id,
        text: savedMessage.text,
        sender: savedMessage.user,
        username: savedMessage.username,
        timestamp: savedMessage.createdAt,
        room: savedMessage.room,
        type: savedMessage.content,
      },
    };

    return formattedMessage;
  } catch (error) {
    console.error("儲存訊息失敗:", error);
    logger.error("儲存訊息錯誤:", error);
    throw error;
  }
};

exports.getRecentMessages = async (roomName, limit = 50) => {
  try {
    const messages = await Message.find({ room: roomName }).limit(limit).lean();

    const formattedMessages = messages.map((msg) => ({
      text: msg.text,
      sender: msg.user,
      username: msg.username,
      timestamp: msg.createdAt,
      room: msg.room,
      type: msg.content,
    }));

    return {
      success: true,
      data: formattedMessages,
    };
  } catch (error) {
    logger.error("獲取最近訊息錯誤:", error);
    throw error;
  }
};

exports.getLastMessage = async (roomName) => {
  try {
    const message = await Message.findOne({ room: roomName }).lean();

    const formattedMessage = message
      ? {
          text: message.text,
          sender: message.user,
          username: message.username,
          timestamp: message.createdAt,
          room: message.room,
          type: message.content,
        }
      : null;

    return {
      success: true,
      data: formattedMessage,
    };
  } catch (error) {
    logger.error("獲取最後訊息錯誤:", error);
    throw error;
  }
};

exports.deleteMessage = async (messageId) => {
  try {
    await Message.findByIdAndDelete(messageId);
  } catch (error) {
    console.error("刪除訊息時出錯:", error);
    throw error;
  }
};

exports.updateMessage = async (messageId, newText) => {
  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      { text: newText },
      { new: true }
    );
    return updatedMessage;
  } catch (error) {
    console.error("更新訊息時出錯:", error);
    throw error;
  }
};
