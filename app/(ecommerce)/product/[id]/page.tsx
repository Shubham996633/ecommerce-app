"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Product } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { toast } from "sonner"; // Import sonner for toast notifications

export default function ProductPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  // Unwrap the params Promise using React.use()
  const params = React.use(paramsPromise);

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

  // Find the product with the matching ID
  const product = products.find((p) => p.id === params.id) as Product;

  if (loading) {
    return (
      <div>
        <Loader />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex flex-1">
          <main className="flex-1 p-4">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Product Not Found
              </h2>
              <p className="text-gray-600 mb-6">
                Sorry, we couldn’t find the product you’re looking for. Browse
                our other products on the dashboard.
              </p>
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.id !== params.id)
    .slice(0, 3);

  async function addToCart() {
    const userResponse = await fetch("/api/user");
    const userData = await userResponse.json();
    if (!userData.userId) {
      router.push("/sign-in");
      return;
    }
    const { userId } = userData;

    // Create a promise for the fetch operation
    const addToCartPromise = fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, productId: product.id, quantity: 1 }),
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

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex space-x-6 mt-6">
              <Image
                height={420}
                width={420}
                src={product.image}
                alt={product.name}
                className="object-cover rounded-lg"
              />
              <div className="flex-1">
                <p className="text-lg text-gray-600">{product.description}</p>
                <p className="mt-4 text-2xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <div className="mt-6 space-x-4">
                  <Button onClick={addToCart}>Add to Cart</Button>
                  <Button
                    onClick={() =>
                      router.push(`/delivery?productId=${product.id}`)
                    }
                  >
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
            {/* You May Also Like Section */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  You May Also Like
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedProducts.map((relatedProduct) => (
                    <div
                      key={relatedProduct.id}
                      className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                      <Image
                        height={300}
                        width={300}
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {relatedProduct.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {relatedProduct.description}
                      </p>
                      <p className="mt-2 text-xl font-semibold text-gray-900">
                        ${relatedProduct.price.toFixed(2)}
                      </p>
                      <Button
                        className="mt-4 w-full"
                        onClick={() =>
                          router.push(`/product/${relatedProduct.id}`)
                        }
                      >
                        View Product
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
