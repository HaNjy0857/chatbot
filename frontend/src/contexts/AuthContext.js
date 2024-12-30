import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  login: () => {},
  logout: () => {},
  error: null,
});

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  const login = (token, userData) => {
    try {
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      setError(null);
    } catch (err) {
      console.error("登錄錯誤:", err);
      setError("登錄時發生錯誤");
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } catch (err) {
      console.error("登出錯誤:", err);
      setError("登出時發生錯誤");
    }
  };

  useEffect(() => {
    try {
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("user");
      if (token && savedUser) {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("身份驗證檢查錯誤:", err);
      setError("無法檢查身份驗證狀態");
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    isAuthenticated,
    user,
    login,
    logout,
    error,
  };

  if (loading) {
    return <div>加載中...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
