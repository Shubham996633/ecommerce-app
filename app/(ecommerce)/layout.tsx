"use client";

import AppNavbar from "@/components/AppNavbar";
import Footer from "@/components/Footer";
import Sidebar from "@/components/Sidebar";
import { ReactNode, useState } from "react";

type AppLayoutProps = {
  children: ReactNode;
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Navbar */}
      <AppNavbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <main className="flex-1 p-6 pt-20 pb-16 lg:ml-64 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Fixed Footer */}
      <Footer />
    </div>
  );
}
