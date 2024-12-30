require("dotenv").config();
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { sequelize } = require("./src/models");
const chatSocket = require("./src/sockets/chat");
const roomManagement = require("./src/sockets/roomManagement");
const privateChat = require("./src/sockets/privateChat");
const logger = require("./src/utils/logger");
const app = require("./app");

const server = http.createServer(app);
const io = socketIo(server);

chatSocket(io);
roomManagement(io);
privateChat(io);

const PORT = process.env.PORT;

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    logger.info("MySQL 連接成功");
    await sequelize.sync();
    logger.info("Sequelize 模型同步完成");

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info("MongoDB 連接成功");
  } catch (error) {
    logger.error("數據庫連接失敗:", error);
    process.exit(1);
  }
}

async function startServer() {
  try {
    await connectToDatabase();

    server.listen(PORT, () => {
      logger.info(`服務器運行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("啟動服務器時發生錯誤:", error);
    process.exit(1);
  }
}

startServer();

process.on("SIGTERM", () => {
  logger.info("收到 SIGTERM 信號：正在關閉 HTTP 服務器");
  server.close(() => {
    logger.info("HTTP 服務器已關閉");
    mongoose.connection.close(false, () => {
      logger.info("MongoDB 連接已關閉");
      sequelize.close().then(() => {
        logger.info("MySQL 連接已關閉");
        process.exit(0);
      });
    });
  });
});
