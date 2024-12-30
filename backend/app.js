require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const { sequelize } = require("./src/models");
const lobbyManager = require("./src/sockets/lobby");
const chatroomManager = require("./src/sockets/chatroom");
const logger = require("./src/utils/logger");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/user");
const chatRoutes = require("./src/routes/chat");
const chatroomRoutes = require("./src/routes/chatroom");

const app = express();
const server = http.createServer(app);

// 使用相同的 CORS 配置
const corsOptions = {
  origin: "http://localhost:3000", // 前端的 URL
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日誌中間件
app.use((req, res, next) => {
  logger.info(`收到 ${req.method} 請求: ${req.url}`);
  next();
});

// 路由
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes); // 添加這行
app.use("/api/chatrooms", chatroomRoutes);

// 靜態文件服務
const frontendBuildPath = path.join(__dirname, "..", "frontend", "build");
app.use(express.static(frontendBuildPath));

// 捕獲所有其他路由
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendBuildPath, "index.html"));
});

// 404 處理
app.use((req, res, next) => {
  res.status(404).json({ message: "未找到" });
});

// 錯誤處理中間件
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).send("服務器錯誤");
});

// Socket.io 設置
const io = new socketIo.Server(server, {
  cors: {
    origin: "http://localhost:3000", // 前端地址
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingTimeout: 60000, // 連接超時時間
  pingInterval: 25000, // 心跳包間隔
  transports: ["websocket", "polling"],
});

// 使用 lobby 管理器
lobbyManager(io);
chatroomManager(io);

const PORT = process.env.PORT;

async function connectToDatabase() {
  try {
    await sequelize.authenticate();
    logger.info("MySQL 連接成功");
    await sequelize.sync();
    logger.info("Sequelize 模型同步完成");

    await mongoose.connect(process.env.MONGODB_URI);
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

module.exports = app;
