"use client";

import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";
import Link from "next/link";

type AppNavbarProps = {
  onToggleSidebar: () => void;
};

export default function AppNavbar({ onToggleSidebar }: AppNavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-10 bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          className="lg:hidden text-white"
          onClick={onToggleSidebar}
        >
          <Menu className="w-6 h-6" />
        </Button>
        <Link href="/">
          <h1 className="text-2xl font-bold">TechShop</h1>
        </Link>
      </div>
      <SignOutButton>
        <Button className="text-white border-white bg-pink-950 hover:bg-gray-700">
          Logout
        </Button>
      </SignOutButton>
    </nav>
  );
}
