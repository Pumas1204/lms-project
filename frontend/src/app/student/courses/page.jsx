"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";
import { motion } from "framer-motion";

export default function StudentCourseList() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState({});
  const [joinedIds, setJoinedIds] = useState(new Set());
  const [missingIdCourses, setMissingIdCourses] = useState([]);


  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("title-asc");


  const difficultyColors = {
    Beginner: "bg-green-100 text-green-700",
    Intermediate: "bg-yellow-100 text-yellow-700",
    Advanced: "bg-red-100 text-red-700",
  };

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await api.get("/courses/");
        const missing = (res.data || []).filter(
          (c) => c == null || c.id == null
        );
        setMissingIdCourses(missing);
        setCourses(res.data || []);
        setFilteredCourses(res.data || []);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load courses", err);
        setLoading(false);
      }
    }
    loadCourses();
  }, []);

  async function joinCourse(courseId) {
    if (joining[courseId]) return;

    setJoining((s) => ({ ...s, [courseId]: true }));

    try {
      await api.post(`/courses/${courseId}/join/`);
      setJoinedIds((prev) => new Set([...prev, courseId]));
    } catch (err) {
      console.error("Failed to join course", err);
    } finally {
      setJoining((s) => ({ ...s, [courseId]: false }));
    }
  }

  useEffect(() => {
    let updated = [...courses];

    if (search.trim()) {
      updated = updated.filter(
        (c) =>
          c.title?.toLowerCase().includes(search.toLowerCase()) ||
          c.description?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category !== "all") {
      updated = updated.filter((c) => c.category === category);
    }

    updated.sort((a, b) => {
      switch (sort) {
        case "title-asc":
          return a.title.localeCompare(b.title);
        case "title-desc":
          return b.title.localeCompare(a.title);
        case "enrollment":
          return (b.enrollment_count ?? 0) - (a.enrollment_count ?? 0);
        case "difficulty":
          const diffOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        default:
          return 0;
      }
    });

    setFilteredCourses(updated);
  }, [search, category, sort, courses]);

  if (loading)
    return <div className="p-10 text-center text-xl">Loading courses…</div>;


  const uniqueCategories = [
    "all",
    ...new Set(courses.map((c) => c.category).filter(Boolean)),
  ];

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-4xl font-bold">📚 Courses</h1>
          <p className="text-gray-600 mt-1">Search, filter, and join courses easily.</p>
        </motion.div>

        {missingIdCourses.length > 0 && (
          <div className="mt-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-xl">
            <p className="text-yellow-800 font-medium">
              ⚠ Some courses are missing IDs and cannot be joined:
            </p>
            <ul className="mt-2 ml-4 text-yellow-700 list-disc">
              {missingIdCourses.map((c, i) => (
                <li key={i}>{c?.title ?? "(Untitled)"}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col md:flex-row gap-4">


          <input
            type="text"
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg shadow-sm"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm"
          >
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "All Categories" : cat}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="px-4 py-2 border rounded-lg shadow-sm"
          >
            <option value="title-asc">Title A–Z</option>
            <option value="title-desc">Title Z–A</option>
            <option value="enrollment">Most Enrolled</option>
            <option value="difficulty">Difficulty</option>
          </select>
        </div>

        <div className="grid gap-8 mt-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course, i) => {
            const identifier = course?.id ?? course?.slug;
            const hasId = course.id != null;

            return (
              <motion.div
                key={identifier ?? i}
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.03 }}
                className="bg-white shadow-lg border rounded-2xl overflow-hidden flex flex-col"
              >

                <div className="h-40 w-full overflow-hidden">
                  <img
                    src={course.thumbnail || "/placeholder-course.jpg"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow">

                  <h2 className="text-xl font-bold">{course.title}</h2>
                  <p className="text-gray-600 mt-1 line-clamp-3">{course.description}</p>

                  <div className="mt-3">
                    <span
                      className={`px-3 py-1 text-sm rounded-full ${difficultyColors[course.difficulty]}`}
                    >
                      {course.difficulty}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 mt-4">
                    <img
                      src={course.instructor_avatar || "/avatar-placeholder.png"}
                      className="w-10 h-10 rounded-full object-cover border"
                    />
                    <div>
                      <p className="font-medium">{course.instructor_name || "Instructor"}</p>
                      <p className="text-sm text-gray-600">
                        {course.enrollment_count ?? 0} enrolled
                      </p>
                    </div>
                  </div>

            
                  <div className="mt-auto flex justify-between items-center pt-5">

                    {hasId && joinedIds.has(course.id) ? (
                      <button className="bg-gray-400 text-white px-4 py-2 rounded-lg">
                        Joined ✓
                      </button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => joinCourse(course.id)}
                        disabled={!hasId || joining[course.id]}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-60"
                      >
                        {joining[course.id] ? "Joining…" : "Join"}
                      </motion.button>
                    )}

                 
                    <Link
                      href={`/student/courses/${identifier}`}
                      className="text-blue-600 font-medium hover:underline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ProtectedRoute>
  );
}
