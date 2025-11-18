"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import StudentNavbar from "@/components/StudentNavbar";
import api from "@/lib/api";

export default function StudentProgress() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    async function fetchProgress() {
      try {
        const res = await api.get("/progress/my/");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to load progress", err);
      }
    }
    fetchProgress();
  }, []);

  return (
    <ProtectedRoute>
      <StudentNavbar />

      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Progress</h1>

        {courses.length === 0 && (
          <p className="text-gray-600">You have not joined any courses yet.</p>
        )}

        <div className="space-y-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="border rounded p-5 bg-white shadow"
            >
              <h2 className="text-xl font-semibold">{course.title}</h2>

              <div className="mt-3 w-full bg-gray-200 h-4 rounded">
                <div
                  className="bg-blue-600 h-4 rounded"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>

              <p className="text-sm text-gray-600 mt-1">
                {course.progress}% completed
              </p>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
