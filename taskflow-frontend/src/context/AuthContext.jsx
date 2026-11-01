import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";

const TOKEN_KEY = "taskflow.accessToken";
const USER_KEY = "taskflow.user";
const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const value = sessionStorage.getItem(USER_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    sessionStorage.removeItem(USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener("taskflow:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("taskflow:unauthorized", handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    if (!response?.accessToken || !response?.user) {
      throw new Error("The server returned an unexpected login response.");
    }
    sessionStorage.setItem(TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(USER_KEY, JSON.stringify(response.user));
    setToken(response.accessToken);
    setUser(response.user);
    return response.user;
  }, []);

  const register = useCallback((payload) => authService.register(payload), []);

  const logout = useCallback(() => clearSession(), [clearSession]);

  const value = useMemo(() => ({
    token, user, isAuthenticated: Boolean(token && user),
    login, register, logout,
  }), [token, user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
