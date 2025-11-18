"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorNavbar from "@/components/InstructorNavbar";
import api from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiBook, FiUsers, FiPlusCircle, FiFolder } from "react-icons/fi";

export default function InstructorDashboard() {
  const [user, setUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isOffline, setIsOffline] = useState(false);
  const [stats, setStats] = useState({ courses: 0, students: 0 });


  async function loadData() {
    setLoading(true);
    setErrorMessage("");
    setIsOffline(false);
    try {
      const meRes = await api.get("/me/");
      setUser(meRes.data);

      let instructorCourses = [];
      try {
        const coursesRes = await api.get("/courses/instructor/");
        instructorCourses = coursesRes.data || [];
      } catch (err) {
        try {
          const allRes = await api.get("/courses/");
          const all = allRes.data || [];
          const uid = meRes.data?.id;

          instructorCourses = all.filter((c) => {
            return (
              c.instructor === uid ||
              c.instructor_id === uid ||
              c.owner === uid ||
              c.creator === uid ||
              c.user === uid
            );
          });
        } catch (err2) {
          instructorCourses = [];
        }
      }

      const coursesCount = instructorCourses.length;

      const studentsCount = instructorCourses.reduce((acc, c) => {
        const count =
          c.student_count ??
          c.enrolled_count ??
          c.students_count ??
          (Array.isArray(c.students) ? c.students.length : 0);
        return acc + (typeof count === "number" ? count : 0);
      }, 0);

      setStats({ courses: coursesCount, students: studentsCount });
    } catch (err) {
      console.error("Failed to load instructor dashboard data", err);

      if (!err?.response) {
        setErrorMessage("Network error: Unable to reach the API. Check your server or network.");
        setIsOffline(true);
      } else {
        setErrorMessage(err.message || "An error occurred while loading data.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <ProtectedRoute>
      <InstructorNavbar />

      <div className="p-8 max-w-6xl mx-auto">

        {isOffline && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 flex items-center justify-between">
            <span>{errorMessage}</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadData()}
                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && !isOffline && (
          <div className="mb-4 text-sm text-gray-500">Loading instructor data…</div>
        )}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-md mb-8"
        >
          <h1 className="text-3xl font-bold">Instructor Dashboard</h1>
          {user && (
            <p className="mt-1 text-white/90 text-lg">
              Welcome back, <span className="font-semibold">{user.username}</span> 👋
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-xl shadow-lg border flex items-center gap-4"
          >
            <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
              <FiBook size={28} />
            </div>

            <div>
              <h2 className="text-gray-500 text-sm">Total Courses</h2>
              <p className="text-3xl font-bold">{stats.courses}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-lg border flex items-center gap-4"
          >
            <div className="bg-green-100 text-green-600 p-4 rounded-full">
              <FiUsers size={28} />
            </div>

            <div>
              <h2 className="text-gray-500 text-sm">Total Students</h2>
              <p className="text-3xl font-bold">{stats.students}</p>
            </div>
          </motion.div>
        </div>

        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          <Link
            href="/instructor/courses/create"
            className="bg-green-600 text-white p-4 rounded-xl shadow hover:bg-green-700 flex items-center gap-3 transition"
          >
            <FiPlusCircle size={22} />
            <span className="font-medium">Create New Course</span>
          </Link>

          <Link
            href="/instructor/courses"
            className="bg-blue-600 text-white p-4 rounded-xl shadow hover:bg-blue-700 flex items-center gap-3 transition"
          >
            <FiFolder size={22} />
            <span className="font-medium">View My Courses</span>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md border">
          <h2 className="text-xl font-bold mb-2">Announcements</h2>
          <p className="text-gray-600">
            No announcements yet. Updates about new students, course enrollments, and LMS
            features will appear here.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
