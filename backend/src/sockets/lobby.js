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

    // 處理廣播消息
    socket.on("broadcast", async (data) => {
      try {
        console.log(data);
        // 驗證發送者是否為管理員
        if (data.role !== "admin") {
          return socket.emit("error", {
            message: "只有管理員可以發送廣播訊息",
          });
        }

        // 獲取所有房間
        const result = await chatroomService.getRooms();
        if (!result.success) {
          return socket.emit("error", {
            message: "獲取房間列表失敗",
          });
        }

        // 為每個房間保存廣播消息
        for (const room of result.data) {
          await chatService.saveMessage(
            room.name,
            data.message,
            data.sender,
            data.username,
            "broadcast" // 消息類型
          );
        }

        // 向所有客戶端廣播消息
        io.emit("newMessage", {
          type: "broadcast",
          content: data.message,
          sender: "系統廣播",
          timestamp: new Date(),
        });

        // 通知發送者廣播成功
        socket.emit("broadcastSuccess", {
          message: "廣播訊息已發送",
        });
      } catch (error) {
        console.error("廣播訊息錯誤:", error);
        socket.emit("error", {
          message: "廣播訊息發送失敗",
        });
      }
    });
  });
};
