"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StudentNavbar() {
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    router.push("/login");
  };

  return (
    <nav className="w-full bg-blue-600 text-white px-6 py-3 flex items-center justify-between shadow">
      
      <div className="flex space-x-6 text-lg">
        <Link href="/student" className="hover:underline">
          Dashboard
        </Link>

        <Link href="/student/my-courses" className="hover:underline">
          My Courses
        </Link>

        <Link href="/student/courses" className="hover:underline">
          Available Courses
        </Link>
      </div>


      <button
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
      >
        Logout
      </button>
    </nav>
  );
}
