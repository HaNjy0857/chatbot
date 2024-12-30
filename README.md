# 即時聊天平台

此專案整合了 REST API、權限認證、Socket.IO、Docker 和 MySQL/MongoDB/Redis 技術，並提供即時聊天功能。

## 啟動方式

1. 安裝相依套件：

   ```bash
   npm install
   ```

2. 設置環境變數：

   複製 `.env.example` 文件並重命名為 `.env`，然後根據您的環境設置相應的變數。

3. 啟動 Docker 容器：

   ```bash
   docker-compose up -d
   ```

4. 啟動應用程序：

   ```bash
   npm start
   ```

## 專案結構
