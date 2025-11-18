"use client";

import StudentNavbar from "@/components/StudentNavbar";

export default function StudentLayout({ children }) {
  return (
    <>
      <StudentNavbar />
      <main>{children}</main>
    </>
  );
}
