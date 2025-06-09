import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-6">
        <SignIn />
      </main>
      <Footer />
    </div>
  );
}
