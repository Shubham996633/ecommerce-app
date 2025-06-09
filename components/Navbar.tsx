import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="from-blue-500 border-b-2 via-purple-500 to-pink-500 text-white shadow-md p-4 flex justify-between items-center">
      <Link href="/">
        <h1 className="text-2xl font-bold text-white/800">TechShop</h1>
      </Link>
      <div className="space-x-4">
        <Link href="/sign-in">
          <Button>Sign In</Button>
        </Link>
        <Link href="/sign-up">
          <Button>Sign Up</Button>
        </Link>
      </div>
    </nav>
  );
}
