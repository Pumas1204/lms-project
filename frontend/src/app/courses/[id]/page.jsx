"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import Link from "next/link";

export default function CoursePublicPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loadingCourse, setLoadingCourse] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);
  const [error, setError] = useState(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!id) return;
    setError(null);

    async function load() {
      setLoadingCourse(true);
      try {
     
        let res;
        try {
          res = await api.get(`/courses/${id}/`);
        } catch (e) {
     
          res = await api.get(`/courses/instructor/${id}/`);
        }
        setCourse(res.data || null);
      } catch (err) {
        console.error("Failed to load course", err);
        setError("Course not found");
        setCourse(null);
      } finally {
        setLoadingCourse(false);
      }
    }

    load();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setLoadingChapters(true);
    (async () => {
      try {
        let res;
        try {
          res = await api.get(`/courses/${id}/chapters/`);
        } catch (e) {
          try {
            res = await api.get(`/courses/instructor/${id}/chapters/`);
          } catch {
         
            res = await api.get(`/chapters/?course=${id}`);
          }
        }
        setChapters(res.data || []);
      } catch (err) {
        console.error("Failed to load chapters", err);
        setChapters([]);
      } finally {
        setLoadingChapters(false);
      }
    })();
  }, [id]);

  async function handleJoin() {
    if (!id) return;
    setJoinLoading(true);
    setError(null);
    try {

      try {
        await api.post(`/courses/${id}/join/`);
      } catch (e) {
        await api.post(`/courses/join/${id}/`);
      }
      setJoined(true);

      try {
        const res = await api.get(`/courses/${id}/`);
        setCourse(res.data || course);
      } catch {}
    } catch (err) {
      console.error("Failed to join course", err);
      setError(
        err?.response?.data?.detail ||
          err?.response?.data ||
          err?.message ||
          "Failed to join course"
      );
    } finally {
      setJoinLoading(false);
    }
  }


  function renderContent(content) {
    if (!content) return <p className="text-gray-600">No content.</p>;

    if (typeof content !== "string") {
      try {
        return (
          <pre className="whitespace-pre-wrap text-sm text-gray-800">
            {JSON.stringify(content, null, 2)}
          </pre>
        );
      } catch {}
    }


    if (typeof content === "string") {
      const trimmed = content.trim();
      if (trimmed.startsWith("<") && trimmed.endsWith(">")) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
      }
 
      try {
        const parsed = JSON.parse(content);
        return <pre className="whitespace-pre-wrap text-sm text-gray-800">{JSON.stringify(parsed, null, 2)}</pre>;
      } catch {
    
        return <div className="whitespace-pre-wrap text-sm text-gray-800">{content}</div>;
      }
    }

    return <div className="text-sm">{String(content)}</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back
        </Link>
      </div>

      {loadingCourse ? (
        <p>Loading course…</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : !course ? (
        <p className="text-gray-600">Course not found.</p>
      ) : (
        <>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="text-gray-700 mb-4">{course.description}</p>

          <div className="mb-4">
            <button
              onClick={handleJoin}
              disabled={joinLoading || joined}
              className={`px-4 py-2 rounded ${joined ? "bg-gray-400 text-white" : "bg-green-600 text-white hover:bg-green-700"}`}
            >
              {joined ? "Joined" : joinLoading ? "Joining…" : "Join Course"}
            </button>
          </div>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Chapters</h2>
            {loadingChapters ? (
              <p>Loading chapters…</p>
            ) : chapters.length === 0 ? (
              <p className="text-gray-600">No chapters published yet.</p>
            ) : (
              <div className="space-y-3">
                {chapters.map((ch) => (
                  <details key={ch.id} className="p-3 border rounded">
                    <summary className="font-medium cursor-pointer">{ch.title || "Untitled chapter"}</summary>
                    <div className="mt-2">{renderContent(ch.content)}</div>
                  </details>
                ))}
              </div>
            )}
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Instructor</h3>
            <p className="text-sm">{(course.instructor && (course.instructor.username || course.instructor)) || course.instructor_id || "—"}</p>
          </section>
        </>
      )}
    </div>
  );
}
