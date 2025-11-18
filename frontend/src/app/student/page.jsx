"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StudentDashboard() {
  const [user, setUser] = useState(null);

  // Fake course progress example
  const progressData = [
    { name: "Math", progress: 80 },
    { name: "Biology", progress: 45 },
    { name: "History", progress: 67 },
  ];

  // Chart sample data
  const chartData = [
    { month: "Jan", score: 70 },
    { month: "Feb", score: 75 },
    { month: "Mar", score: 85 },
    { month: "Apr", score: 90 },
    { month: "May", score: 95 },
  ];

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await api.get("/me/");
        setUser(res.data);
      } catch (error) {
        console.error("Error loading user:", error);
      }
    }
    loadUser();
  }, []);

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 rounded-2xl shadow-xl"
        >
          <h1 className="text-4xl font-extrabold">Student Dashboard</h1>

          {user && (
            <p className="mt-2 text-blue-100 text-lg">
              Welcome back, <span className="font-semibold">{user.username}</span> 👋
            </p>
          )}
        </motion.div>

        {/* Animated Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-6 bg-white shadow-lg rounded-xl border"
          >
            <h2 className="text-xl font-semibold text-blue-600">📚 Browse Courses</h2>
            <p className="mt-2 text-gray-700">Explore all available courses.</p>
            <Link
              href="/student/courses"
              className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              View Courses
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-6 bg-white shadow-lg rounded-xl border"
          >
            <h2 className="text-xl font-semibold text-green-600">🎒 My Courses</h2>
            <p className="mt-2 text-gray-700">See what you're enrolled in.</p>
            <Link
              href="/student/my-courses"
              className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              My Courses
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="p-6 bg-white shadow-lg rounded-xl border"
          >
            <h2 className="text-xl font-semibold text-purple-600">👤 Profile</h2>
            <p className="mt-2 text-gray-700">Manage your account and settings.</p>
            <Link
              href="/student/profile"
              className="inline-block mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Profile
            </Link>
          </motion.div>
        </div>

        {/* Charts Section */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Line Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl border shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">📈 Performance Over Time</h3>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Bar Chart or Progress Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-6 rounded-xl border shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">🔥 Your Course Progress</h3>

            <div className="space-y-6">
              {progressData.map((course) => (
                <div key={course.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{course.name}</span>
                    <span className="text-gray-600">{course.progress}%</span>
                  </div>

                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="h-20"></div>
      </div>
    </ProtectedRoute>
  );
}
