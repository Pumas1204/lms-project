"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorNavbar from "@/components/InstructorNavbar";
import api from "@/lib/api";
import Link from "next/link";
import { Plate } from "@udecode/plate/react";
import { plateNodesToHtml, htmlToPlateNodes } from "@/lib/plateSerializer";
import { motion } from "framer-motion";
import { FiUsers, FiSettings, FiExternalLink, FiEdit2, FiTrash2, FiBookOpen } from "react-icons/fi";

export default function MyCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [detailsMap, setDetailsMap] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [detailsError, setDetailsError] = useState({});
  const [manageOpen, setManageOpen] = useState(null);

  // Chapters / editor state
  const [chaptersMap, setChaptersMap] = useState({});
  const [chaptersLoading, setChaptersLoading] = useState({});
  const [chapterEditorOpen, setChapterEditorOpen] = useState(null);
  const [chapterEditorValue, setChapterEditorValue] = useState([
    { type: "p", children: [{ text: "" }] },
  ]);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterSummary, setChapterSummary] = useState("");
  const [chapterSaving, setChapterSaving] = useState(false);
  const [chapterError, setChapterError] = useState(null);


  const [editOpen, setEditOpen] = useState(null);
  const [editData, setEditData] = useState({ title: "", description: "" });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState(null);


  function getCsrfToken() {
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function csrfConfig() {
    const token = getCsrfToken();
    const cfg = { withCredentials: true };
    if (token) cfg.headers = { "X-CSRFToken": token };
    return cfg;
  }


  useEffect(() => {

    try {
      if (api && api.defaults) api.defaults.withCredentials = true;

      try {
        const t = getCsrfToken();
        if (t && api && api.defaults && api.defaults.headers) {
          api.defaults.headers["X-CSRFToken"] = t;
        }
      } catch (_) {}
    } catch (_) {}

    
    
    
    

    async function loadCourses() {
      try {
        let uid = null;
        try {
          const meRes = await api.get("/me/");
          uid = meRes.data?.id;
        } catch {
          // ignore
        }

        try {
          const res = await api.get("/courses/instructor/");
          setCourses(res.data || []);
        } catch (err) {
          try {
            const allRes = await api.get("/courses/");
            const all = allRes.data || [];
            const filtered = uid
              ? all.filter((c) =>
                  [c.instructor, c.instructor_id, c.owner, c.creator, c.user].includes(uid)
                )
              : [];
            setCourses(filtered);
          } catch (err2) {
            console.error("Failed to fetch courses (primary and fallback):", err, err2);
            setCourses([]);
          }
        }
      } catch (err) {
        console.error("Failed to load instructor courses", err);
      }
    }

    loadCourses();
  }, []);

  async function toggleDetails(courseId) {
    if (expandedId === courseId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(courseId);

    if (detailsMap[courseId]) return;

    setLoadingDetails((s) => ({ ...s, [courseId]: true }));
    setDetailsError((s) => ({ ...s, [courseId]: null }));
    try {
      const res = await api.get(`/courses/instructor/${courseId}/`);
      setDetailsMap((s) => ({ ...s, [courseId]: res.data || {} }));
    } catch (err) {
      console.error("Failed to load course details", err);
      setDetailsError((s) => ({
        ...s,
        [courseId]:
          err?.response?.data?.detail ||
          err?.response?.data ||
          err.message ||
          "Failed to load course details",
      }));
    } finally {
      setLoadingDetails((s) => ({ ...s, [courseId]: false }));
    }
  }

  async function handleDelete(courseId) {
    if (!confirm("Delete this course? This cannot be undone.")) return;
    try {
      await api.delete(`/courses/instructor/${courseId}/`, csrfConfig());
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      if (expandedId === courseId) setExpandedId(null);
      if (manageOpen === courseId) setManageOpen(null);
    } catch (err) {
      console.error("Failed to delete course", err);
      alert(
        err?.response?.data?.detail ||
          err?.response?.data ||
          err.message ||
          "Failed to delete course"
      );
    }
  }

  function goToEdit(course) {
    const id = typeof course === "object" ? course.id : course;
    const c = (typeof course === "object" ? course : courses.find((x) => x.id === id)) || {};
    setEditOpen(id);
    setEditData({ title: c.title || "", description: c.description || "" });
    setEditError(null);
  }

  function cancelEdit() {
    setEditOpen(null);
    setEditData({ title: "", description: "" });
    setEditError(null);
  }

  async function submitEdit(courseId) {
    setSavingEdit(true);
    setEditError(null);
    try {
      const res = await api.patch(
        `/courses/instructor/${courseId}/`,
        editData,
        csrfConfig()
      );
      const updated = res.data;

      setCourses((prev) => prev.map((c) => (c.id === courseId ? { ...c, ...updated } : c)));
      setDetailsMap((s) => ({ ...s, [courseId]: { ...(s[courseId] || {}), ...updated } }));
      setEditOpen(null);
    } catch (err) {
      console.error("Failed to save course edit", err);
      setEditError(
        err?.response?.data?.detail ||
          err?.response?.data ||
          err.message ||
          "Failed to save changes"
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function loadChapters(courseId) {
    if (!courseId) return;
    if (chaptersMap[courseId]) return;
    setChaptersLoading((s) => ({ ...s, [courseId]: true }));
    try {
      let res;
      try {
        res = await api.get(`/courses/instructor/${courseId}/chapters/`);
      } catch {
        res = await api.get(`/courses/${courseId}/chapters/`);
      }
      setChaptersMap((s) => ({ ...s, [courseId]: res.data || [] }));
    } catch (err) {
      console.error("Failed to load chapters", err);
      setChaptersMap((s) => ({ ...s, [courseId]: [] }));
    } finally {
      setChaptersLoading((s) => ({ ...s, [courseId]: false }));
    }
  }

  function openCreateChapter(courseId) {
    setChapterEditorOpen({ courseId, chapterId: null, mode: "create" });
    setChapterEditorValue([{ type: "p", children: [{ text: "" }] }]);
    setChapterTitle("");
    setChapterSummary("");
    setChapterError(null);
  }

  function openEditChapter(courseId, chapter) {
    setChapterEditorOpen({ courseId, chapterId: chapter.id, mode: "edit" });
    if (chapter.content) {
      if (typeof chapter.content === "string") {
        setChapterEditorValue(htmlToPlateNodes(chapter.content));
      } else {
        setChapterEditorValue(
          Array.isArray(chapter.content)
            ? chapter.content
            : [{ type: "p", children: [{ text: "" }] }]
        );
      }
    } else {
      setChapterEditorValue([{ type: "p", children: [{ text: "" }] }]);
    }
    setChapterTitle(chapter.title || "");
    setChapterSummary(chapter.summary || "");
    setChapterError(null);
  }

  async function submitChapter() {
    if (!chapterEditorOpen) return;
    const { courseId, chapterId, mode } = chapterEditorOpen;
    setChapterSaving(true);
    setChapterError(null);

    const contentHtml = plateNodesToHtml(chapterEditorValue);
    const payload = {
      title: chapterTitle,
      content: contentHtml,
      summary: chapterSummary,
      course: courseId,
    };

    try {
      if (mode === "create") {
  const endpoints = [
    `/courses/instructor/${courseId}/chapters/`,   
    `/courses/${courseId}/chapters/instructor/`,  
  ];

  let res = null;
  let lastErr = null;

         for (const ep of endpoints) {
    try {
      res = await api.post(ep, payload, csrfConfig());
      break; 
    } catch (err) {
      lastErr = err;
      continue;
    }
  }

        if (!res) {
          const msg =
            lastErr?.response?.data?.detail ||
            lastErr?.response?.data ||
            lastErr?.message ||
            "All create endpoints failed (possible 405 Method Not Allowed).";
          throw new Error(msg);
        }

        const created = res.data;
        setChaptersMap((s) => ({ ...s, [courseId]: [...(s[courseId] || []), created] }));
        setChapterEditorOpen(null);
      } else {
        const patchEndpoints = [
  `/chapters/instructor/${chapterId}/`,
];


        let res = null;
        let lastErr = null;

        try { console.debug("Authorization header:", api.defaults?.headers?.Authorization); } catch (_) {}

        for (const ep of patchEndpoints) {
          try {
            res = await api.patch(ep, payload, csrfConfig());
            break; // success
          } catch (err) {
            lastErr = err;
            console.error("Failed to save chapter on endpoint:", ep, err.response?.data || err.message);
            if (err?.response?.status === 403) {
              const serverMsg = err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message;
              const respData = err.response?.data;
              const isHtml403 = typeof respData === "string" && (respData.includes("Origin checking failed") || respData.includes("CSRF verification failed"));
            }

            if (err?.response?.status === 405) continue;
            throw err;
          }
        }

        if (!res) {
          const msg =
            lastErr?.response?.data?.detail ||
            lastErr?.response?.data ||
            lastErr?.message ||
            "All update endpoints failed (possible 405 Method Not Allowed).";
          throw new Error(msg);
        }

        const updated = res.data;
        setChaptersMap((s) => ({
          ...s,
          [courseId]: (s[courseId] || []).map((ch) =>
            ch.id === chapterId ? { ...ch, ...updated } : ch
          ),
        }));
        setChapterEditorOpen(null);
      }
    } catch (err) {
      console.error("Failed to save chapter", err);

      const resp = err?.response?.data;
      if (typeof resp === "string" && (resp.includes("Origin checking failed") || resp.includes("CSRF verification failed"))) {
        setChapterError("CSRF/origin check failed. Add frontend origin to Django CSRF_TRUSTED_ORIGINS or proxy the requests.");
      } else {
        setChapterError(
          err?.response?.data?.detail ||
            err?.response?.data ||
            err.message ||
            "Failed to save chapter"
        );
      }
    } finally {
      setChapterSaving(false);
    }
  }

  async function deleteChapter(courseId, chapterId) {
    if (!confirm("Delete this chapter?")) return;
    try {
      await api.delete(`/chapters/instructor/${chapterId}/`, csrfConfig());
      setChaptersMap((s) => ({
        ...s,
        [courseId]: (s[courseId] || []).filter((ch) => ch.id !== chapterId),
      }));
    } catch (err) {
      console.error("Failed to delete chapter", err);
      alert("Failed to delete chapter");
    }
  }

  function openPublic(courseId) {
    router.push(`/courses/${courseId}`);
  }


  async function toggleVisibility(courseId, chapter) {
  const newState = !chapter.is_public;

  try {
    const res = await api.patch(
      `/chapters/instructor/${chapter.id}/`,
      { is_public: newState },
      csrfConfig()
    );

    const updated = res.data;

    setChaptersMap((prev) => ({
      ...prev,
      [courseId]: (prev[courseId] || []).map((ch) =>
        ch.id === chapter.id ? { ...ch, ...updated } : ch
      ),
    }));
  } catch (err) {
    console.error("Failed to toggle visibility", err);
    alert("Failed to update chapter visibility");
  }
}


  return (
    <ProtectedRoute>
      <InstructorNavbar />

      <div className="bg-gray-50 min-h-screen">
        <div className="p-8 max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <FiBookOpen className="text-indigo-600" />
                My Courses
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                Manage your courses, chapters, and enrolled students.
              </p>
            </div>
            <Link
              href="/instructor/courses/create"
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-sm flex items-center gap-2 text-sm"
            >
              <span className="text-lg leading-none">＋</span>
              New Course
            </Link>
          </div>

         
          {courses.length === 0 && (
            <div className="mt-10 text-center text-gray-600">
              You haven’t created any courses yet.{" "}
              <Link href="/instructor/courses/create" className="text-indigo-600 underline">
                Create your first course
              </Link>
              .
            </div>
          )}

  
          <div className="space-y-4">
            {courses.map((c, idx) => {
              const chapters = chaptersMap[c.id] || [];
              return (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white shadow-sm border border-gray-200 rounded-2xl p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{c.title}</h2>
                      <p className="text-gray-600 mt-1 text-sm">{c.description}</p>
                      <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
                        {chapters.length > 0 && (
                          <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full">
                            {chapters.length} chapter{chapters.length !== 1 && "s"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0">
                      <button
                        onClick={() => {
                          toggleDetails(c.id);
                          loadChapters(c.id);
                        }}
                        className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-indigo-700"
                      >
                        <FiUsers />
                        {expandedId === c.id ? "Hide Students" : "Students"}
                      </button>

                      <button
                        onClick={() => {
                          setManageOpen((p) => (p === c.id ? null : c.id));
                          if (manageOpen !== c.id) loadChapters(c.id);
                        }}
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700"
                      >
                        <FiSettings />
                        Manage
                      </button>
                    </div>
                  </div>

                  {/* Manage panel */}
                  {manageOpen === c.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      {/* Actions row */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openPublic(c.id)}
                          className="flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200"
                        >
                          <FiExternalLink />
                          Open Public Page
                        </button>

                        <button
                          onClick={() => goToEdit(c)}
                          className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-yellow-600"
                        >
                          <FiEdit2 />
                          Edit Course
                        </button>

                        <button
                          onClick={() => handleDelete(c.id)}
                          className="flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700"
                        >
                          <FiTrash2 />
                          Delete
                        </button>
                      </div>

                    
                      {editOpen === c.id && (
                        <div className="mt-3 p-4 border rounded-xl bg-gray-50 space-y-2">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            Edit Course
                          </h4>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Title
                            </label>
                            <input
                              className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-sm"
                              value={editData.title}
                              onChange={(e) =>
                                setEditData((d) => ({ ...d, title: e.target.value }))
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Description
                            </label>
                            <textarea
                              className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-sm"
                              rows={3}
                              value={editData.description}
                              onChange={(e) =>
                                setEditData((d) => ({
                                  ...d,
                                  description: e.target.value,
                                }))
                              }
                            />
                          </div>

                          {editError && (
                            <p className="text-red-600 text-xs mb-1">{editError}</p>
                          )}

                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => submitEdit(c.id)}
                              disabled={savingEdit}
                              className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                            >
                              {savingEdit ? "Saving…" : "Save"}
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 flex items-center gap-1">
                            <FiBookOpen className="text-indigo-600" />
                            Chapters
                          </h3>
                          <button
                            onClick={() => {
                              loadChapters(c.id);
                              openCreateChapter(c.id);
                            }}
                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700"
                          >
                            + New Chapter
                          </button>
                        </div>

                        {chaptersLoading[c.id] ? (
                          <p className="text-sm text-gray-500">Loading chapters…</p>
                        ) : (
                          <div className="space-y-2">
                            {chapters.length === 0 && (
                              <p className="text-sm text-gray-500">
                                No chapters yet. Create your first chapter.
                              </p>
                            )}
                            {chapters.map((ch) => (
                              <div
                                key={ch.id}
                                className="p-2 border border-gray-200 rounded-lg flex items-center justify-between bg-gray-50"
                              >
                                <div>
                                  <div className="font-medium text-sm">{ch.title}</div>
                                  {ch.summary && (
                                    <div className="text-[12px] text-gray-600 mt-1">
                                      {ch.summary}
                                    </div>
                                  )}
                                  {ch.order && (
                                    <div className="text-[11px] text-gray-500">
                                      Order: {ch.order}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2 items-center">

  <button
    onClick={() => toggleVisibility(c.id, ch)}
    className={
      "px-2 py-1 rounded text-xs font-medium " +
      (ch.is_public
        ? "bg-green-600 text-white hover:bg-green-700"
        : "bg-gray-600 text-white hover:bg-gray-700")
    }
  >
    {ch.is_public ? "Public" : "Private"}
  </button>

  <button
    onClick={() => openEditChapter(c.id, ch)}
    className="bg-yellow-400 text-white px-2 py-1 rounded text-xs hover:bg-yellow-500"
  >
    Edit
  </button>

  <button
    onClick={() => deleteChapter(c.id, ch.id)}
    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
  >
    Delete
  </button>

</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {chapterEditorOpen &&
                        chapterEditorOpen.courseId === c.id && (
                          <div className="mt-3 p-4 border rounded-xl bg-white space-y-2">
                            <h4 className="font-semibold text-gray-800 mb-1">
                              {chapterEditorOpen.mode === "create"
                                ? "New Chapter"
                                : "Edit Chapter"}
                            </h4>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Chapter Title
                              </label>
                              <input
                                className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-sm"
                                value={chapterTitle}
                                onChange={(e) => setChapterTitle(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Summary (short description)
                              </label>
                              <textarea
                                className="w-full border border-gray-300 px-2 py-1.5 rounded-lg text-sm"
                                rows={2}
                                value={chapterSummary}
                                onChange={(e) => setChapterSummary(e.target.value)}
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Content
                              </label>
                              <div className="border border-gray-300 rounded-lg p-2">
                                <Plate
                                  id={`plate-editor-${c.id}-${chapterEditorOpen.chapterId ?? "new"}`}
                                  key={`plate-${c.id}-${chapterEditorOpen.chapterId ?? "new"}-${chapterEditorOpen.mode}`}
                                  value={chapterEditorValue}
                                  onChange={(value) => setChapterEditorValue(value)}
                                />
                              </div>
                            </div>

                            {chapterError && (
                              <p className="text-red-600 text-xs">{chapterError}</p>
                            )}

                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={submitChapter}
                                disabled={chapterSaving}
                                className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                              >
                                {chapterSaving ? "Saving…" : "Save Chapter"}
                              </button>
                              <button
                                onClick={() => {
                                  setChapterEditorOpen(null);
                                  setChapterError(null);
                                }}
                                className="bg-gray-200 text-gray-800 px-3 py-1.5 rounded-lg text-sm"
                              >
                                Cancel
                              </button>
                            </div>

                            <p className="text-[11px] text-gray-500 mt-1">
                              Tip: Use the rich editor to format lessons. The content is saved as
                              HTML converted from Plate.js.
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  {expandedId === c.id && (
                    <div className="mt-4 border-t pt-4">
                      <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-1">
                        <FiUsers className="text-indigo-600" />
                        Enrolled Students
                      </h3>

                      {loadingDetails[c.id] ? (
                        <p className="text-sm text-gray-500">Loading students…</p>
                      ) : detailsError[c.id] ? (
                        <p className="text-red-600 text-sm">{detailsError[c.id]}</p>
                      ) : (() => {
                          const det = detailsMap[c.id] || {};
                          const students =
                            det.students_detail ||
                            det.students ||
                            det.students_list ||
                            (c.students ? c.students : []);

                          if (!students || students.length === 0) {
                            return (
                              <p className="text-sm text-gray-500">
                                No students enrolled yet.
                              </p>
                            );
                          }

                          return (
                            <div className="overflow-x-auto mt-2">
                              <table className="w-full text-sm border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-gray-100">
                                  <tr className="text-left text-gray-700">
                                    <th className="py-2 px-3">Name</th>
                                    <th className="py-2 px-3">Email</th>
                                    <th className="py-2 px-3">Grade / Progress</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {students.map((s) => (
                                    <tr
                                      key={s.id || s.user || s.username}
                                      className="border-t border-gray-200"
                                    >
                                      <td className="py-2 px-3">
                                        {s.first_name || s.username || `${s.first_name || ""} ${s.last_name || ""}`.trim()}
                                      </td>
                                      <td className="py-2 px-3">
                                        {s.email || s.username || "—"}
                                      </td>
                                      <td className="py-2 px-3">
                                        {s.grade ?? s.progress ?? "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
