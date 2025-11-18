"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import api from "@/lib/api";

export default function CourseDetailPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadCourse() {
      if (!courseId) return;
      if (mounted) {
        setLoading(true);
        setError(null);
      }

      try {
        let res = null;

        // Numeric id: try multiple fallbacks if the primary endpoint returns 404
        if (/^\d+$/.test(String(courseId))) {
          try {
            res = await api.get(`/courses/${courseId}/`);
          } catch (err) {
            // if numeric endpoint 404, attempt alternatives
            if (err?.response?.status === 404) {
              // 1) try without trailing slash
              try {
                res = await api.get(`/courses/${courseId}`);
              } catch (_) {
                // ignore and continue
              }

              // 2) try list endpoint with id query param (if backend supports it)
              if (!res) {
                try {
                  const byIdRes = await api.get("/courses/", { params: { id: courseId } });
                  if (byIdRes.data && byIdRes.data.length > 0) {
                    res = { data: byIdRes.data[0] };
                  }
                } catch (_) {}
              }

              // 3) fallback: fetch all and match by id
              if (!res) {
                try {
                  const allRes = await api.get("/courses/");
                  const found = (allRes.data || []).find((c) => String(c.id) === String(courseId));
                  if (found) res = { data: found };
                } catch (_) {}
              }

              // if still not found, rethrow original 404-like error to be handled below
              if (!res) throw err;
            } else {
              // non-404 error -> rethrow
              throw err;
            }
          }
        } else {
          // non-numeric -> treat as slug (unchanged behavior)
          try {
            const slugRes = await api.get("/courses/", { params: { slug: courseId } });
            if (slugRes.data && slugRes.data.length > 0) {
              res = { data: slugRes.data[0] };
            }
          } catch (_) {}
          if (!res) {
            const allRes = await api.get("/courses/");
            const found = (allRes.data || []).find((c) => c.slug === courseId);
            if (found) res = { data: found };
            else {
              const notFoundErr = new Error("Course not found");
              notFoundErr.response = { status: 404 };
              throw notFoundErr;
            }
          }
        }

        if (mounted && res) setCourse(res.data);
      } catch (err) {
        console.error("Failed to load course", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadCourse();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  return (
    <ProtectedRoute>
      <div className="p-8">
        {loading && <div>Loading course...</div>}

        {!loading && error && (
          <div>
            <p className="text-red-600 mb-4">Course not found or failed to load.</p>
            <Link href="/student/courses" className="text-blue-600 hover:underline">Back to courses</Link>
          </div>
        )}

        {!loading && course && (
          <>
            <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
            {/* debug: show id and slug to verify which record was loaded */}
            <div className="text-sm text-gray-500 mb-4">ID: {String(course.id ?? "—")} | Slug: {course.slug ?? "—"}</div>
            <p className="text-gray-700 mb-4">{course.description}</p>
            {/* ...other course details as needed... */}
            <Link href="/student/courses" className="text-blue-600 hover:underline">Back to courses</Link>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
