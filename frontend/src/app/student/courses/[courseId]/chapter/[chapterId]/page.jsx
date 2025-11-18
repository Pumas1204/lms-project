"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import api from "@/lib/api";
import Link from "next/link";
import { Plate, createPlugins } from "@udecode/plate-core";
import { createParagraphPlugin } from "@udecode/plate-paragraph";
import { createHeadingPlugin } from "@udecode/plate-heading";
import { createBoldPlugin } from "@udecode/plate-basic-marks";
import { createItalicPlugin } from "@udecode/plate-basic-marks";
import { createUnderlinePlugin } from "@udecode/plate-basic-marks";

export default function StudentReadChapter() {
  const { courseId, chapterId } = useParams();

  const [chapter, setChapter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plugins, setPlugins] = useState([]);

  useEffect(() => {
    setPlugins(
      createPlugins(
        [
          createParagraphPlugin(),
          createHeadingPlugin(),
          createBoldPlugin(),
          createItalicPlugin(),
          createUnderlinePlugin(),
        ],
        {}
      )
    );
  }, []);

  useEffect(() => {
    async function fetchChapter() {
      try {
        const response = await api.get(
          `/courses/${courseId}/chapters/${chapterId}/public/`
        );
        setChapter(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error loading chapter", err);
        setLoading(false);
      }
    }

    fetchChapter();
  }, [courseId, chapterId]);

  if (loading) return <div className="p-8">Loading chapter...</div>;

  if (!chapter)
    return <div className="p-8 text-red-600">Chapter not found or is private.</div>;

  return (
    <ProtectedRoute>
      <div className="p-8 max-w-3xl mx-auto">

        <Link
          href={`/student/courses/${courseId}`}
          className="text-blue-600 underline mb-4 inline-block"
        >
          ← Back to course
        </Link>

        <h1 className="text-3xl font-bold mb-6">{chapter.title}</h1>

        <div className="border p-6 rounded bg-white shadow">
          <Plate
            editableProps={{
              readOnly: true,
              className: "prose max-w-none",
            }}
            value={chapter.content}
            plugins={plugins}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
