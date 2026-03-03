import { createContext } from "react";

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface AuthContextType {
  token: string | null;
  user: AuthUser | null;  // ✅ add user
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);