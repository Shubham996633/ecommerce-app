"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
};

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchUserAndProducts() {
      const userResponse = await fetch("/api/user");
      const user = await userResponse.json();
      if (!userResponse.ok || !user.userId) {
        router.push("/sign-in");
        return;
      }

      const response = await fetch("/api/products");
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchUserAndProducts();
  }, [router]);

  async function addToCart(productId: string) {
    const userResponse = await fetch("/api/user");
    const { userId } = await userResponse.json();
    if (!userId) {
      router.push("/sign-in");
      return;
    }

    const addToCartPromise = fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId, quantity: 1 }),
    }).then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add item to cart");
      }
      return response.json(); // Resolve the promise with the response data
    });

    // Use toast.promise to handle the loading, success, and error states
    toast.promise(addToCartPromise, {
      loading: "Adding to cart...",
      success: () => {
        return "Item added to cart successfully!";
      },
      error: (error: Error) => `Error: ${error.message}`,
    });
  }

  if (loading) {
    return (
      <>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        <Loader />
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <p className="text-gray-600 text-xl mb-6">
        Welcome to your TechShop dashboard! <br />
        Browse our latest products below.
      </p>
      {products.length === 0 ? (
        <p className="text-gray-600">No products available.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow-md bg-white"
            >
              <Image
                height={420}
                width={420}
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-xl font-semibold text-gray-900">
                {product.name}
              </h2>
              <p className="text-gray-600 mt-2">{product.description}</p>
              <p className="text-lg font-semibold text-gray-900 mt-2">
                ${product.price.toFixed(2)}
              </p>
              <div className="mt-4 flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => router.push(`/product/${product.id}`)}
                >
                  View
                </Button>
                <Button onClick={() => addToCart(product.id)}>
                  Add to Cart
                </Button>
                <Button
                  onClick={() =>
                    router.push(`/delivery?productId=${product.id}`)
                  }
                  variant="secondary"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
