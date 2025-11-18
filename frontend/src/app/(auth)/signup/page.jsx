"use client";

import { useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiUsers } from "react-icons/fi";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "STUDENT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: "",
    password: "",
  });

  const validateForm = () => {
    const errors = { username: "", email: "", password: "" };
    if (!form.username || form.username.trim().length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(form.email)) {
      errors.email = "Enter a valid email address.";
    }
    if (!form.password || form.password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }
    setFieldErrors(errors);
    return !errors.username && !errors.email && !errors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) {
      setError("Please fix the errors above.");
      return;
    }
    setLoading(true);

    try {

      await api.post("/register/", form);

 
      const loginRes = await api.post("/token/", {
        username: form.username,
        password: form.password,
      });

      localStorage.setItem("access", loginRes.data.access);
      localStorage.setItem("refresh", loginRes.data.refresh);

      localStorage.setItem("role", form.role);


      const redirectPath =
        (form.role && form.role.toUpperCase() === "INSTRUCTOR")
          ? "/instructor/"
          : "/student/";
      router.push(redirectPath);
    } catch (err) {
      console.error("Signup error:", err);
 
      const resp = err?.response?.data;
      if (resp) {
        if (typeof resp === "string") setError(resp);
        else if (typeof resp === "object") {
       
          const msgs = Object.values(resp)
            .flat()
            .filter(Boolean)
            .join(" ");
          setError(msgs || "Registration failed. Try different details.");
        } else {
          setError("Registration failed. Try different details.");
        }
      } else {
        setError("Network or server error. Try again.");
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 p-6">
      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/20 backdrop-blur-lg border border-white/30 shadow-xl rounded-2xl p-8"
      >
    
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-white drop-shadow">
            Create Your Account
          </h1>
          <p className="text-white/80 mt-1">
            Join the LMS and start learning today!
          </p>
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 text-red-700 p-3 rounded text-sm mb-4 text-center"
            role="alert"
            aria-live="assertive"
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
                placeholder="Choose a username"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={form.username}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, username: v });
                  if (fieldErrors.username)
                    setFieldErrors({ ...fieldErrors, username: "" });
                }}
                minLength={3}
                required
              />
            </div>
            {fieldErrors.username && (
              <p className="text-xs text-red-600 mt-1">
                {fieldErrors.username}
              </p>
            )}
          </div>


          <div>
            <label className="text-white text-sm font-medium">Email</label>
            <div className="relative mt-1">
              <FiMail className="absolute left-3 top-3 text-white/70" />
              <input
                type="email"
                placeholder="Your email address"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none border-white/20 focus:ring-2 focus:ring-white/50"
                value={form.email}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, email: v });
                  if (fieldErrors.email)
                    setFieldErrors({ ...fieldErrors, email: "" });
                }}
                required
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>
            )}
          </div>

     
          <div>
            <label className="text-white text-sm font-medium">Password</label>
            <div className="relative mt-1">
              <FiLock className="absolute left-3 top-3 text-white/70" />
              <input
                type="password"
                placeholder="Create a password"
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white placeholder-white/70 border border-white/20 focus:outline-none border-white/20 focus:ring-2 focus:ring-white/50"
                value={form.password}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm({ ...form, password: v });
                  if (fieldErrors.password)
                    setFieldErrors({ ...fieldErrors, password: "" });
                }}
                minLength={8}
                required
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>
            )}
          </div>


          <div>
            <label className="text-white text-sm font-medium">Role</label>
            <div className="relative mt-1">
              <FiUsers className="absolute left-3 top-3 text-white/70" />
              <select
                className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/30 text-white border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT" className="text-black">
                  Student
                </option>
                <option value="INSTRUCTOR" className="text-black">
                  Instructor
                </option>
              </select>
            </div>
          </div>

      
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={
              loading ||
              !form.username ||
              !form.email ||
              !form.password ||
              Object.values(fieldErrors).some(Boolean)
            }
            className="w-full bg-white text-blue-700 font-bold py-2 rounded-lg shadow hover:bg-gray-100 transition disabled:opacity-60"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </motion.button>
        </form>

  
        <p className="text-center mt-6 text-white text-sm">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-semibold underline hover:text-gray-100"
          >
            Login
          </a>
        </p>
      </motion.div>
    </div>
  );
}
