import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  Button,
  TextField,
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { AuthContext } from "../contexts/AuthContext";

const ChatRoom = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const { roomName } = useParams();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to chat server");
      newSocket.emit("joinRoom", roomName);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log("Reconnected after", attemptNumber, "attempts");
      newSocket.emit("joinRoom", roomName);
    });

    newSocket.on("message", (message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("recentMessages", (recentMessages) => {
      setMessages(recentMessages);
    });

    newSocket.on("userJoined", ({ user, message }) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.on("userLeft", ({ user, message }) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    newSocket.emit("getRecentMessages", roomName);

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leaveRoom", roomName);
        newSocket.close();
      }
    };
  }, [roomName, isAuthenticated, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && socket) {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      console.log("userData", userData);

      const messageData = {
        room: roomName,
        message: inputMessage.trim(),
        timestamp: new Date().toISOString(),
        sender: userData.id || "Anonymous",
        username: userData.username || "Anonymous",
      };

      console.log("Sending message:", messageData);
      socket.emit("sendMessage", messageData);
      setInputMessage("");
    }
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit("leaveRoom", roomName);
      navigate("/");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, margin: "auto", mt: 4 }}>
      {isAuthenticated ? (
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            聊天室: {roomName}
          </Typography>
          <Button variant="outlined" onClick={leaveRoom} sx={{ mb: 2 }}>
            離開房間
          </Button>
          <Paper
            variant="outlined"
            sx={{ height: 300, overflow: "auto", mb: 2, p: 2 }}
          >
            <List>
              {messages.map((message, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={message.text}
                    secondary={`${message.username} - ${new Date(
                      message.timestamp
                    ).toLocaleString()}`}
                  />
                </ListItem>
              ))}
              <div ref={messagesEndRef} />
            </List>
          </Paper>
          <Box
            component="form"
            onSubmit={sendMessage}
            sx={{ display: "flex", gap: 1 }}
          >
            <TextField
              fullWidth
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="輸入消息"
              variant="outlined"
              size="small"
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!inputMessage.trim() || !socket}
            >
              發送
            </Button>
          </Box>
        </Paper>
      ) : (
        <Typography variant="h6">請先登入以訪問聊天室</Typography>
      )}
    </Box>
  );
};

export default ChatRoom;
