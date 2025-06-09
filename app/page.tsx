import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <h1 className="text-5xl font-bold mb-4">Welcome to TechShop</h1>
        <p className="text-xl mb-6 max-w-2xl">
          Discover the best in tech gadgets and accessories. From cutting-edge
          PCs to stylish devices, we have it all. Shop now and enjoy fast
          delivery, secure payments, and top-notch customer service.
        </p>
        <p className="text-lg mb-8 max-w-2xl">
          Join thousands of happy customers who trust TechShop for their tech
          needs. Explore our curated collection and take advantage of exclusive
          offers today!
        </p>
        <Link href="/dashboard">
          <Button className="bg-white text-black hover:bg-gray-200">
            Shop Now
          </Button>
        </Link>
      </main>
      <Footer />
    </div>
  );
}
