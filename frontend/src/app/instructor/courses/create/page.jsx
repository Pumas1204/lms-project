"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorNavbar from "@/components/InstructorNavbar";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function CreateCourse() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/courses/instructor/", { title, description: desc });
      router.push("/instructor/courses");
      return;
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          JSON.stringify(err?.response?.data) ||
          err.message ||
          "Failed to create course"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <InstructorNavbar />

      <div className="flex justify-center items-center min-h-[85vh] p-6 bg-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-xl bg-white p-8 rounded-2xl shadow-xl border"
        >
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            Create a New Course
          </h1>
          <p className="text-gray-600 mb-6">
            Fill in the course details below to begin building your curriculum.
          </p>

          <form onSubmit={submit} className="space-y-4">
         
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Title
              </label>
              <input
                type="text"
                placeholder="e.g. Intro to Programming"
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Course Description
              </label>
              <textarea
                placeholder="Describe what students will learn..."
                className="w-full border rounded-lg px-3 py-2 min-h-[120px] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200 text-sm"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              whileTap={{ scale: 0.97 }}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-60"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Creating…" : "Create Course"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </ProtectedRoute>
  );
}
