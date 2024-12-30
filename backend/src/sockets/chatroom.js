const chatService = require("../services/chatService");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // 發送訊息
    socket.on("sendMessage", async (messageData) => {
      try {
        console.log("收到發送訊息請求:", messageData);

        const result = await chatService.saveMessage(
          messageData.room,
          messageData.message,
          messageData.sender,
          messageData.username
        );

        if (result.success) {
          io.to(messageData.room).emit("message", result.data);
        }
      } catch (error) {
        console.error("發送訊息錯誤:", error);
        socket.emit("error", "發送訊息失敗");
      }
    });

    // 加入房間
    socket.on("joinRoom", (roomName) => {
      console.log(`用戶加入房間: ${roomName}`);
      socket.join(roomName);

      // 發送系統消息通知其他用戶
      socket.to(roomName).emit("userJoined", {
        user: socket.user,
        message: {
          text: `用戶已加入聊天室`,
          sender: "系統",
          timestamp: new Date(),
          room: roomName,
        },
      });
    });

    // 離開房間
    socket.on("leaveRoom", (roomName) => {
      console.log(`用戶離開房間: ${roomName}`);
      socket.leave(roomName);

      // 發送系統消息通知其他用戶
      socket.to(roomName).emit("userLeft", {
        user: socket.user,
        message: {
          text: `用戶已離開聊天室`,
          sender: "系統",
          timestamp: new Date(),
          room: roomName,
        },
      });
    });

    // 獲取最近的訊息
    socket.on("getRecentMessages", async (roomName) => {
      try {
        console.log(`獲取房間 ${roomName} 的最近訊息`);
        const result = await chatService.getRecentMessages(roomName);
        if (result.success) {
          socket.emit("recentMessages", result.data);
        }
      } catch (error) {
        console.error("獲取最近訊息錯誤:", error);
        socket.emit("error", "獲取訊息失敗");
      }
    });
  });
};
