"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Editor from "@/components/Editor";
import api from "@/lib/api";

export default function EditChapter() {
  const { id, chapterId } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [content, setContent] = useState([
    { type: "p", children: [{ text: "" }] },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChapter() {
      try {
        const res = await api.get(`/courses/${id}/chapters/${chapterId}/`);

        setTitle(res.data.title);
        setIsPublic(res.data.is_public);
        setContent(res.data.content);

        setLoading(false);
      } catch (error) {
        console.error("Failed to load chapter", error);
        setLoading(false);
      }
    }

    fetchChapter();
  }, [id, chapterId]);

  const submit = async (e) => {
    e.preventDefault();

    try {
      await api.put(`/courses/${id}/chapters/${chapterId}/`, {
        title,
        content,
        is_public: isPublic,
      });

      router.push(`/instructor/courses/${id}`);
    } catch (err) {
      console.error("Failed to update chapter", err);
    }
  };

  if (loading) return <div className="p-8">Loading chapter...</div>;

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Edit Chapter</h1>

        <form onSubmit={submit} className="space-y-6">

          <input
            type="text"
            placeholder="Chapter Title"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

       
          <div>
            <label className="font-semibold mb-2 block">Content</label>
            <Editor value={content} onChange={setContent} />
          </div>

    
          <div className="flex items-center space-x-3">
            <label className="font-medium">Visibility:</label>
            <select
              value={isPublic}
              onChange={(e) => setIsPublic(e.target.value === "true")}
              className="border p-2 rounded"
            >
              <option value="true">Public</option>
              <option value="false">Private</option>
            </select>
          </div>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
