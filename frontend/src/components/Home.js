import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import { AuthContext } from "../contexts/AuthContext"; // 假設您有一個 AuthContext

function Home() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Box sx={{ textAlign: "center", mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        歡迎來到聊天室
      </Typography>
      <Box sx={{ mt: 2, "& > button": { mx: 1 } }}>
        {isAuthenticated ? (
          <Button
            onClick={() => navigate("/lobby")}
            variant="contained"
            color="primary"
          >
            進入大廳
          </Button>
        ) : (
          <>
            <Button
              onClick={() => navigate("/login")}
              variant="contained"
              color="primary"
            >
              登入
            </Button>
            <Button
              onClick={() => navigate("/register")}
              variant="outlined"
              color="primary"
            >
              註冊
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Home;
