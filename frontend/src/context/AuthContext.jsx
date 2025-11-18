"use client";
import { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import api from "../lib/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = Cookies.get("access");
    if (token) {
      loadUser();
    }
  }, []);

  const loadUser = async () => {
    try {
      const res = await api.get("profile/");
      setUser(res.data);
    } catch (err) {
      console.log("Not logged in");
      setUser(null);
    }
  };

  const login = async (username, password) => {
    const res = await api.post("token/", {
      username,
      password,
    });

    Cookies.set("access", res.data.access);
    Cookies.set("refresh", res.data.refresh);

    await loadUser();
  };

  const register = async (username, password, full_name, role) => {
    await api.post("register/", {
      username,
      password,
      full_name,
      role,
    });
  };

  const logout = () => {
    Cookies.remove("access");
    Cookies.remove("refresh");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
