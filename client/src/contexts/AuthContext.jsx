import { createContext, useContext, useState, useEffect } from "react";
import {
  clearAuthStorage,
  getAccessToken,
  getStoredUser,
  setAccessToken,
  setRefreshToken,
  setStoredUser,
} from "@/utils/authStorage.js";
import { requestApi } from "@/utils/request.js";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      const storedUser = getStoredUser();
      const accessToken = getAccessToken();

      if (!storedUser || !accessToken) {
        if (storedUser || accessToken) {
          clearAuthStorage();
        }
        if (isMounted) {
          setUser(null);
          setIsAuthReady(true);
        }
        return;
      }

      if (isMounted) {
        setUser(storedUser);
      }

      try {
        const me = await requestApi(
          "/api/users/me",
          {},
          { requireAuth: true, errorMessage: "세션이 만료되었습니다." },
        );

        if (!isMounted) return;
        setStoredUser(me);
        setUser(me);
      } catch {
        if (!isMounted) return;
        clearAuthStorage();
        setUser(null);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
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

  return (
    <AuthContext.Provider value={{ user, isAuthReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
