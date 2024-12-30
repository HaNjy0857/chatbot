import React, { useState, useEffect } from "react";
import axios from "axios";

const HomePage = () => {
  const [user, setUser] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("/api/user", { headers: { Authorization: `Bearer ${token}` } })
        .then((response) => setUser(response.data))
        .catch((error) => {
          console.error("Error fetching user data:", error);
          localStorage.removeItem("token");
        });
    }
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const password = event.target.password.value;
    try {
      const response = await axios.post("/api/login", { username, password });
      localStorage.setItem("token", response.data.token);
      setUser({ username: response.data.username });
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    const username = event.target.username.value;
    const email = event.target.email.value;
    const password = event.target.password.value;
    try {
      await axios.post("/api/register", { username, email, password });
      alert("註冊成功，請登入");
      setIsRegistering(false);
    } catch (error) {
      console.error("註冊失敗:", error);
      alert("註冊失敗，請稍後再試");
    }
  };

  return (
    <div className="home-page">
      <h1>歡迎來到我們的網站</h1>
      <div className="logo">
        {/* 這裡可以放置您的簡單圖案，例如一個 SVG 圖標 */}
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="#007bff" />
          <text x="50" y="55" textAnchor="middle" fill="white" fontSize="20">
            Logo
          </text>
        </svg>
      </div>
      {user ? (
        <div>
          <p>歡迎，{user.username}！</p>
          <button onClick={handleLogout}>登出</button>
        </div>
      ) : isRegistering ? (
        <form onSubmit={handleRegister}>
          <input type="text" name="username" placeholder="用戶名" required />
          <input type="email" name="email" placeholder="電子郵件" required />
          <input type="password" name="password" placeholder="密碼" required />
          <button type="submit">註冊</button>
          <button type="button" onClick={() => setIsRegistering(false)}>
            返回登入
          </button>
        </form>
      ) : (
        <div>
          <form onSubmit={handleLogin}>
            <input type="text" name="username" placeholder="用戶名" required />
            <input
              type="password"
              name="password"
              placeholder="密碼"
              required
            />
            <button type="submit">登入</button>
          </form>
          <button onClick={() => setIsRegistering(true)}>註冊新帳號</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
