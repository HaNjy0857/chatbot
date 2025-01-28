# 即時聊天系統

一個基於 Node.js 的即時聊天系統，整合了 RESTful API、WebSocket、權限管理等後端核心功能。

## 核心功能

### 1. 使用者系統

- JWT 身份驗證
- 權限分級（管理員/一般用戶）
- 權限動態調整

### 2. 即時通訊

- 多房間管理
- 即時訊息傳遞
- 管理員廣播功能

### 3. 資料持久化

- 用戶資料管理
- 聊天記錄保存
- 房間狀態維護

## 技術架構

### 後端技術

- **Node.js & Express**: RESTful API 實現
- **Socket.IO**: 即時通訊功能
- **MySQL**: 使用者資料儲存
- **MongoDB**: 聊天訊息儲存
- **JWT**: 使用者認證
- **Docker**: 容器化部署

## API 文件

### 認證相關

```
POST /api/auth/register - 用戶註冊
POST /api/auth/login    - 用戶登入
```

### 用戶管理

```
PUT /api/users/upgrade/:id   - 升級為管理員
PUT /api/users/downgrade/:id - 降級為一般用戶
```

### 聊天室管理

```
GET  /api/rooms      - 獲取房間列表
POST /api/rooms      - 創建新房間
POST /api/rooms/join - 加入房間
```

## WebSocket 事件

### 客戶端事件

```
joinRoom   - 加入聊天室
leaveRoom  - 離開聊天室
message    - 發送訊息
broadcast  - 管理員廣播
```

### 服務器事件

```
newMessage   - 新訊息通知
roomList     - 房間列表更新
userJoined   - 用戶加入通知
userLeft     - 用戶離開通知
```

## 授權

MIT License
