"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiLock } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("token/", form);

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      try {
        const profileRes = await api.get("user/");
        const role = profileRes?.data?.profile?.role?.toString()?.toUpperCase();

        if (role === "INSTRUCTOR") {
          router.push("/instructor");
        } else {
          router.push("/student");
        }
      } catch (e) {
        router.push("/student");
      }
    } catch (err) {
      console.error("Login error:", err);
      const status = err?.response?.status;
      const data = err?.response?.data;
      setError(
        status ? `Error ${status}: ${JSON.stringify(data)}` : "Network error."
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl p-8"
      >
    
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white drop-shadow">
            LMS Login
          </h1>
          <p className="text-white/80 mt-1">Access your learning dashboard</p>
        </div>

    
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-700 p-3 rounded text-sm mb-4 text-center"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">


          <div>
            <label className="text-white text-sm font-medium">Username</label>
            <div className="relative mt-1">
              <FiUser className="absolute left-3 top-3 text-white/70" />
              <input
                type="text"
                placeholder="Enter your username"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
              />
            </div>
          </div>

   
          <div>
            <label className="text-white text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-3 text-white/70" />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full bg-white text-blue-700 font-bold py-2 rounded-lg shadow hover:bg-gray-100 transition disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </motion.button>
        </form>

   
        <p className="text-center mt-6 text-white text-sm">
          Don't have an account?{" "}
          <a href="/signup" className="font-semibold underline hover:text-gray-100">
            Sign Up
          </a>
        </p>
      </motion.div>
    </div>
  );
}
