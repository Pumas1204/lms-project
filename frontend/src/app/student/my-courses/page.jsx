"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import Link from "next/link";
import { motion } from "framer-motion";

export default function StudentMyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await api.get("/courses/my/");
        setCourses(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load student courses", err);
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading)
    return (
      <div className="p-8 text-center text-xl font-medium">
        Loading your courses…
      </div>
    );

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-6xl mx-auto">


        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold">🎒 My Courses</h1>
          <p className="text-gray-600 mt-1">Courses you are currently enrolled in.</p>
        </motion.div>

        {courses.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-16 text-center"
          >
            <img
              src="/empty-courses.svg"
              alt="No courses"
              className="w-56 mx-auto opacity-80"
            />
            <h2 className="text-2xl font-semibold mt-6">No courses yet</h2>
            <p className="text-gray-600 mt-2">
              You haven’t joined any courses. Start learning today!
            </p>
            <Link
              href="/student/courses"
              className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Browse Courses →
            </Link>
          </motion.div>
        )}


        <div className="grid gap-8 mt-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              whileHover={{ scale: 1.03 }}
              className="bg-white shadow-lg border rounded-2xl overflow-hidden flex flex-col"
            >
    
              <div className="h-40 w-full overflow-hidden">
                <img
                  src={course.thumbnail || "/placeholder-course.jpg"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-5 flex flex-col flex-grow">

                <Link href={`/student/courses/${course.id}`}>
                  <h2 className="text-xl font-bold hover:text-blue-600 transition">
                    {course.title}
                  </h2>
                </Link>

                <p className="text-gray-600 line-clamp-3 mt-2">
                  {course.description}
                </p>

                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-1">
                    Progress: {course.progress ?? 40}%
                  </p>
                  <div className="w-full bg-gray-200 h-3 rounded-full">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.progress ?? 40}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-green-500 rounded-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-5">
                  <img
                    src={course.instructor_avatar || "/avatar-placeholder.png"}
                    className="w-10 h-10 rounded-full border object-cover"
                  />
                  <div>
                    <p className="font-medium">
                      {course.instructor_name || "Instructor"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {course.enrollment_count ?? 0} enrolled
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-5 flex justify-end">
                  <Link
                    href={`/student/courses/${course.id}`}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Continue →
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
