"use client";

import Link from "next/link";
import { FiBookOpen, FiPlusCircle, FiHome, FiArrowLeftCircle } from "react-icons/fi";

export default function InstructorNavbar() {
  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

     
          <div className="flex items-center space-x-6">

       
            <Link
              href="/instructor"
              className="flex items-center text-xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              <FiHome className="mr-2" size={22} />
              Instructor
            </Link>

        
            <div className="hidden md:flex items-center space-x-5 ml-4">
              <Link
                href="/instructor/courses"
                className="flex items-center text-gray-700 hover:text-blue-600 font-medium transition"
              >
                <FiBookOpen className="mr-1" />
                My Courses
              </Link>

              <Link
                href="/instructor/courses/create"
                className="flex items-center text-gray-700 hover:text-green-600 font-medium transition"
              >
                <FiPlusCircle className="mr-1" />
                Create Course
              </Link>
            </div>
          </div>

        
          <div>
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-900 transition font-medium"
            >
              <FiArrowLeftCircle className="mr-1" />
              Back to Site
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
