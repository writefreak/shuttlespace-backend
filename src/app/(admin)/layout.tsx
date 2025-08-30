"use client";
import Sidebar from "@/components/sidebar";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Dashboardlayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [email, setEmail] = useState<string>();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn !== "true") {
      router.push("/home/login");
    }

    const userJson = localStorage.getItem("studentUser");
    if (userJson) {
      const user = JSON.parse(userJson);
      setEmail(user.email.split("@")[0] || null);
    }
  }, [router]);

  return (
    <div>
      <div className="min-h-screen md:flex">
        {/* Sidebar on the left */}
        <div className="w-[10rem] h-screen hidden md:block bg-white shadow-md z-10">
          <Sidebar />
        </div>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto h-screen flex-row  p-4 md:p-6">
          <div className="md:hidden pt-6 absolute top-0 right-0"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Dashboardlayout;
