import { createContext, useContext, useState, useEffect } from "react";
import {
  clearAuthStorage,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from "@/utils/authStorage.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const login = (userData, token, refreshToken) => {
    setAccessToken(token);
    if (refreshToken) {
      setRefreshToken(refreshToken);
    }
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    clearAuthStorage();
    setUser(null);
  };

  useEffect(() => {
    const handleForcedLogout = () => {
      logout();
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    };

    window.addEventListener("auth:logout-required", handleForcedLogout);
    return () => {
      window.removeEventListener("auth:logout-required", handleForcedLogout);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
