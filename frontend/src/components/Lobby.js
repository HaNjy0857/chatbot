import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  Grid,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import { AuthContext } from "../contexts/AuthContext";

const Lobby = () => {
  const { isAuthenticated, logout, user, login } = useContext(AuthContext);
  const [socket, setSocket] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const navigate = useNavigate();

  const establishSocketConnection = useCallback(() => {
    if (socket) {
      console.log("Closing existing socket connection");
      socket.disconnect();
    }

    console.log("Establishing new socket connection");
    const newSocket = io("http://localhost:5000", {
      auth: {
        token: localStorage.getItem("authToken"),
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
      newSocket.emit("getRooms");
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("roomList", (roomList) => {
      console.log("收到房間列表:", roomList);
      setRooms(roomList);
    });

    newSocket.on("roomCreated", ({ roomName }) => {
      console.log("Room created:", roomName);
      newSocket.emit("getRooms");
    });

    newSocket.on("roomClosed", (closedRoomName) => {
      newSocket.emit("getRooms");
    });

    setSocket(newSocket);
    return newSocket;
  }, []);

  const handleLogout = () => {
    if (socket) {
      socket.disconnect();
    }
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const newSocket = establishSocketConnection();

    return () => {
      if (newSocket) {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
      }
    };
  }, [isAuthenticated, navigate, establishSocketConnection]);

  const createRoom = () => {
    if (newRoomName && socket) {
      const userData = user || JSON.parse(localStorage.getItem("user"));
      // 添加數據驗證
      console.log("userData:", userData); // 檢查用戶數據
      if (!userData) {
        console.error("無法獲取用戶數據");
        return;
      }

      // 打印要發送的數據
      const roomData = {
        roomName: newRoomName,
        creator: userData.id,
        members: [userData.id],
        type: "public",
      };
      console.log("發送創建房間數據:", roomData);

      socket.emit("createRoom", roomData);
      setNewRoomName("");
    }
  };

  const joinRoom = (roomName) => {
    if (socket) {
      console.log("Joining room:", roomName);
      socket.emit("joinRoom", roomName);
      navigate(`/chat/${roomName}`);
    }
  };

  const handleUpgradeToAdmin = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/upgrade/${user.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          login(result.token, result.user);
          establishSocketConnection();
          alert("升級成功！");
        }
      }
    } catch (error) {
      console.error("Error upgrading user:", error);
    }
  };

  const handleDowngradeToUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/downgrade/${user.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          login(result.token, result.user);
          establishSocketConnection();
          alert("降級成功！");
        }
      }
    } catch (error) {
      console.error("Error downgrading user:", error);
    }
  };

  const handleBroadcast = () => {
    if (socket && broadcastMessage.trim()) {
      socket.emit("broadcast", {
        message: broadcastMessage,
        sender: user.id,
        role: user.role,
        username: user.username,
      });
      setBroadcastMessage(""); // 清空輸入框
    }
  };

  return (
    <Box>
      <AppBar position="static" sx={{ mb: 4 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6">聊天室大廳</Typography>
          <Box>
            {user && (
              <Button
                color="error"
                variant="contained"
                onClick={
                  user.role === "admin"
                    ? handleDowngradeToUser
                    : handleUpgradeToAdmin
                }
                sx={{ mr: 2 }}
              >
                {user.role === "admin" ? "我不想當平偉了" : "我想大聲"}
              </Button>
            )}
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              登出
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
        {isAuthenticated ? (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="輸入新房間名稱"
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={createRoom}
                  disabled={!newRoomName.trim() || !socket}
                >
                  創建房間
                </Button>
              </Grid>

              {user?.role === "admin" && (
                <>
                  <Grid item xs={8}>
                    <TextField
                      fullWidth
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="輸入廣播訊息"
                      variant="outlined"
                      size="small"
                      sx={{ mt: 2 }}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleBroadcast}
                      disabled={!broadcastMessage.trim() || !socket}
                      color="secondary"
                      sx={{ mt: 2 }}
                    >
                      廣播訊息
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              可用房間
            </Typography>
            <List>
              {rooms.map((room) => (
                <ListItem
                  key={room.name}
                  disablePadding
                  sx={{
                    mb: 1,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography variant="body1">
                      {room.name}
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({room.userCount || 0})
                      </Typography>
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    onClick={() => joinRoom(room.name)}
                    size="small"
                  >
                    加入
                  </Button>
                </ListItem>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography variant="h6">請先登入以訪問大廳</Typography>
        )}
      </Box>
    </Box>
  );
};

export default Lobby;
