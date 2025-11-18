"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("access") : null;
    if (!token) {
    
      router.replace("/login");
    } else {
      setChecked(true);
    }
  }, [router]);

  if (!checked) {

    return null;
  }

  return <>{children}</>;
}
