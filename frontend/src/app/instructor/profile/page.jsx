"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import InstructorNavbar from "@/components/InstructorNavbar";
import api from "@/lib/api";

export default function InstructorProfilePage() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get("/profile/me/");
        setProfile(res.data);
        setFullName(res.data.full_name || "");
      } catch (err) {
        console.error("Failed to load profile:", err);
      }
    }

    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      await api.put("/profile/update/", { full_name: fullName });
      alert("Profile updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (!profile) return <div className="p-8">Loading profile...</div>;

  return (
    <ProtectedRoute>
      <InstructorNavbar />

      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Instructor Profile</h1>

        <div className="border rounded p-6 shadow bg-white space-y-4">
          <div>
            <label className="text-gray-600">Full Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 mt-1"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-gray-600">Email</label>
            <p className="text-lg">{profile.email}</p>
          </div>

          <div>
            <label className="text-gray-600">Role</label>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm">
              Instructor
            </span>
          </div>

          <button
            onClick={saveProfile}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
        </div>
      </div>
    </ProtectedRoute>  
  );
}
