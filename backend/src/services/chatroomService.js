const ChatRoom = require("../models/chatroom");
const logger = require("../utils/logger");

exports.createRoom = async (roomData) => {
  try {
    console.log("現在在Service的roomData:", roomData);
    const existingRoom = await ChatRoom.findOne({ name: roomData.roomName });

    if (existingRoom) {
      return {
        success: false,
        message: "聊天室名稱已存在",
      };
    }

    const newRoom = new ChatRoom({
      name: roomData.roomName,
      creator: roomData.creator,
      members: roomData.members,
      type: roomData.type || "public",
    });
    await newRoom.save();

    return {
      success: true,
      message: "聊天室建立成功",
      data: newRoom,
    };
  } catch (error) {
    throw error;
  }
};

exports.getRooms = async () => {
  try {
    const rooms = await ChatRoom.find({ type: "public" }).lean();
    console.log(rooms);
    // 格式化返回數據
    const formattedRooms = rooms.map((room) => ({
      name: room.name,
      userCount: room.members.length,
      createdAt: room.createdAt,
      lastActivity: room.lastActivity,
    }));

    return {
      success: true,
      data: formattedRooms,
    };
  } catch (error) {
    logger.error("獲取聊天室列表服務錯誤:", error);
    throw error;
  }
};
