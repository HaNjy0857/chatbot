const chatroomService = require("../services/chatroomService");
const chatService = require("../services/chatService");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // 創建房間
    socket.on("createRoom", async (data) => {
      try {
        // 使用 service 創建房間
        const result = await chatroomService.createRoom(data);

        if (!result.success) {
          return socket.emit("error", result.message);
        }

        // 保存系統消息
        await chatService.saveMessage(data.roomName, "房間已創建", "系統");

        // 加入房間
        socket.join(data.roomName);

        // 廣播房間創建事件
        io.emit("roomCreated", {
          roomName: data.roomName,
          creator: data.creator,
        });

        // 更新房間列表
        const rooms = await chatroomService.getRooms();
        io.emit("roomList", rooms.data);
      } catch (error) {
        console.error("創建房間錯誤:", error);
        socket.emit("error", "創建房間失敗");
      }
    });

    // 獲取房間列表
    socket.on("getRooms", async () => {
      try {
        const result = await chatroomService.getRooms();
        if (result.success) {
          socket.emit("roomList", result.data);
        }
      } catch (error) {
        console.error("獲取房間列表錯誤:", error);
        socket.emit("error", "獲取房間列表失敗");
      }
    });
  });
};
