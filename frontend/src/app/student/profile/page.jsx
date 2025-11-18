"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

import api from "@/lib/api";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [selectedImage, setSelectedImage] = useState(null);

  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      const endpoints = [
        "/profile/me/",
        "/profile/",
        "/users/me/",
        "/users/profile/",
      ];

      let res = null;
      for (const ep of endpoints) {
        try {
          res = await api.get(ep);
          if (res && (res.status === 200 || res.status === 201)) break;
        } catch (err) {
          if (err?.response?.status === 404) {
            continue;
          } else {
            console.warn("Failed to load profile (non-404):", err);
            res = null;
            break;
          }
        }
      }

      if (!res) {
        console.warn("No working profile endpoint found — using empty profile fallback");
        setProfile({});
        setFullName("");
        setLoading(false);
        return;
      }

      setProfile(res.data || {});
      setFullName((res.data && res.data.full_name) || "");
      setLoading(false);
    }

    loadProfile();
  }, []);

  // Update name
  const saveProfile = async () => {
    try {
      await api.put("/profile/update/", {
        full_name: fullName,
      });

      alert("Profile updated successfully!");
  
      router.push("/student/profile");
    } catch (error) {
      console.error(error);
      alert("Failed to update profile");
    }
  };


  const uploadPicture = async () => {
    if (!selectedImage) return alert("No image selected");

    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      await api.post("/profile/upload-image/", formData);
      alert("Profile picture updated!");
      router.push("/student/profile");
    } catch (error) {
      console.error(error);
      alert("Failed to upload image");
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      await api.post("/profile/change-password/", {
        new_password: newPassword,
      });

      alert("Password updated!");
      setShowPasswordModal(false);
      router.push("/student/profile");
    } catch (error) {
      console.error(error);
      alert("Failed to change password");
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;


  if (!profile || Object.keys(profile).length === 0) {
    return (
      <ProtectedRoute>
        <div className="p-8 max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Profile</h1>
          <div className="border rounded p-6 shadow bg-white">
            <p className="text-gray-700">No profile data available.</p>
            <button
              onClick={() => router.push("/student/profile")}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              Go to profile folder
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {/* StudentNavbar removed — avoid duplicate navbar shown by layout/ProtectedRoute */}
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>

        {/* Profile Card */}
        <div className="border rounded p-6 shadow bg-white space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center space-x-4">
            <img
              src={profile.image_url || "/default-avatar.png"}
              className="w-24 h-24 rounded-full object-cover border"
            />
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="mb-2"
              />
              <button
                onClick={uploadPicture}
                className="bg-blue-600 text-white px-3 py-1 rounded"
              >
                Upload
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="text-gray-600">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
            />
          </div>

          {/* Email (Not editable) */}
          <div>
            <label className="text-gray-600">Email</label>
            <p className="text-lg">{profile.email}</p>
          </div>

          {/* Account Created */}
          <div>
            <label className="text-gray-600">Account Created</label>
            <p className="text-lg">
              {new Date(profile.created_at).toDateString()}
            </p>
          </div>

          {/* Joined Courses */}
          <div>
            <label className="text-gray-600">Joined Courses</label>
            <p className="text-lg">{profile.joined_courses}</p>
          </div>

          {/* Save button */}
          <button
            onClick={saveProfile}
            className="bg-green-600 text-white px-4 py-2 rounded mt-4"
          >
            Save Changes
          </button>

          {/* Change Password */}
          <button
            onClick={() => setShowPasswordModal(true)}
            className="bg-yellow-600 text-white px-4 py-2 rounded mt-2"
          >
            Change Password
          </button>
        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>

            <input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-3"
            />

            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border rounded px-3 py-2 mb-4"
            />

            <button
              onClick={changePassword}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full"
            >
              Update Password
            </button>

            <button
              onClick={() => setShowPasswordModal(false)}
              className="mt-3 text-gray-600 underline w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </ProtectedRoute>
  );
}
