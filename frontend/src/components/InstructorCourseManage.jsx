"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorNavbar from "@/components/InstructorNavbar";
import api from "@/lib/api";
import Link from "next/link";

export default function ClientManage({ courseId }) {
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [error, setError] = useState(null);

  const [sending, setSending] = useState(false);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyResult, setNotifyResult] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/courses/instructor/${courseId}/`);
      setCourse(res.data);
    } catch (err) {
      console.error("Failed to load course details", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data ||
          err?.message ||
          "Failed to load course details"
      );
      setCourse(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
   
  }, [courseId]);

  async function sendNotification(e) {
    e.preventDefault();
    if (!notifyTitle || !notifyMessage) {
      setNotifyResult({ ok: false, msg: "Title and message are required." });
      return;
    }
    setSending(true);
    setNotifyResult(null);
    try {
      await api.post(`/courses/${courseId}/notify/`, {
        title: notifyTitle,
        message: notifyMessage,
      });
      setNotifyResult({ ok: true, msg: "Notification sent." });
      setNotifyTitle("");
      setNotifyMessage("");
    } catch (err) {
      console.error("Failed to send notification", err);
      setNotifyResult({
        ok: false,
        msg:
          err?.response?.data?.detail ||
          err?.response?.data ||
          err?.message ||
          "Failed to send notification",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <ProtectedRoute>
      <InstructorNavbar />

      <div className="p-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            Manage Course {course ? `: ${course.title}` : ""}
          </h1>
          <div className="flex gap-2">
            <button
              onClick={load}
              className="bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              Refresh
            </button>
            <Link
              href="/instructor/courses"
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
            >
              Back to Courses
            </Link>
          </div>
        </div>

        {loading ? (
          <p>Loading course…</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : !course ? (
          <p className="text-gray-600">Course not found.</p>
        ) : (
          <>
            <p className="text-gray-700 mb-4">{course.description}</p>

            <h2 className="text-lg font-semibold mb-2">Enrolled Students</h2>
            {Array.isArray(course.students_detail) && course.students_detail.length > 0 ? (
              <div className="overflow-x-auto mb-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left">
                      <th className="py-1 pr-4">Name</th>
                      <th className="py-1 pr-4">Email</th>
                      <th className="py-1 pr-4">Grade / Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {course.students_detail.map((s) => (
                      <tr key={s.id || s.username} className="border-t">
                        <td className="py-2">
                          {s.first_name || s.username || `${s.first_name || ""} ${s.last_name || ""}`.trim()}
                        </td>
                        <td className="py-2">{s.email || "—"}</td>
                        <td className="py-2">{s.grade ?? s.progress ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600 mb-6">No students enrolled yet.</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Send Notification</h2>
            <form onSubmit={sendNotification} className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="Notification title"
                className="w-full border p-2 rounded"
                value={notifyTitle}
                onChange={(e) => setNotifyTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Message"
                className="w-full border p-2 rounded"
                rows={4}
                value={notifyMessage}
                onChange={(e) => setNotifyMessage(e.target.value)}
                required
              />
              {notifyResult && (
                <p className={notifyResult.ok ? "text-green-600" : "text-red-600"}>
                  {notifyResult.msg}
                </p>
              )}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={sending}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
                >
                  {sending ? "Sending…" : "Send to students"}
                </button>
                <button
                  type="button"
                  onClick={load}
                  className="bg-gray-200 px-3 py-2 rounded hover:bg-gray-300"
                >
                  Refresh
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </ProtectedRoute>
  );
}
