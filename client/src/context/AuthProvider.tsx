import { useState } from "react";
import type { ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { AuthUser } from "./AuthContext";
import { jwtDecode } from "jwt-decode";  // npm install jwt-decode

// Helper: decode token → user, return null if invalid
const decodeUser = (token: string): AuthUser | null => {
  try {
    return jwtDecode<AuthUser>(token);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const storedToken = localStorage.getItem("token");

  const [token, setToken] = useState<string | null>(storedToken);
  const [user, setUser] = useState<AuthUser | null>(          // ✅ add user state
    storedToken ? decodeUser(storedToken) : null
  );

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(decodeUser(newToken));  // ✅ decode on login
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);  // ✅ clear on logout
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};