"use client";

import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner"; // Import sonner for toast notifications

type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  product: { id: string; name: string; price: number; image: string };
};

export default function Cart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCartItems();
  }, []);

  async function fetchCartItems() {
    const response = await fetch("/api/cart");
    const data = await response.json();
    if (response.ok) {
      // Combine duplicate products
      const combinedItems = data.reduce((acc: CartItem[], item: CartItem) => {
        const existingItem = acc.find((i) => i.productId === item.productId);
        if (existingItem) {
          existingItem.quantity += item.quantity;
        } else {
          acc.push(item);
        }
        return acc;
      }, []);
      setCartItems(combinedItems);
    } else {
      router.push("/sign-in");
    }
  }

  async function updateQuantity(itemId: string, change: number) {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    const newQuantity = item.quantity + change;
    let updatePromise;

    if (newQuantity <= 0) {
      // Create a promise for the DELETE operation
      updatePromise = fetch(`/api/cart/${itemId}`, {
        method: "Delete",
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to remove item from cart");
        }
        return response.json();
      });
    } else {
      // Create a promise for the PATCH operation
      updatePromise = fetch(`/api/cart/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      }).then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to update item quantity");
        }
        return response.json();
      });
    }

    // Use toast.promise to handle the loading, success, and error states
    toast.promise(updatePromise, {
      loading: "Updating...",
      success: () => {
        fetchCartItems(); // Refresh the cart items after a successful update
        return "Updated!";
      },
      error: (error: Error) => `Error: ${error.message}`,
    });
  }

  const filteredItems = cartItems.filter((item) => {
    const matchesSearch = item.product.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesPrice = priceFilter
      ? item.product.price <= Number(priceFilter)
      : true;
    return matchesSearch && matchesPrice;
  });

  const total = filteredItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  if (!cartItems.length) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex flex-1">
          <main className="flex-1 p-4">
            <h1 className="text-3xl font-bold text-gray-900">Cart</h1>
            <p className="mt-4 text-gray-600">Your cart is empty.</p>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cart</h1>
          <div className="mb-4 flex space-x-4">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 border rounded"
            />
            <input
              type="number"
              placeholder="Max price..."
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
          <ul className="space-y-4">
            {filteredItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center space-x-4 border p-4 rounded-lg"
              >
                <Image
                  height={100}
                  width={100}
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p>
                    Price: ${(item.product.price * item.quantity).toFixed(2)} (x
                    {item.quantity})
                  </p>
                  <div className="flex space-x-2 mt-2">
                    <Button onClick={() => updateQuantity(item.id, -1)}>
                      −
                    </Button>
                    <span className="px-4">{item.quantity}</span>
                    <Button onClick={() => updateQuantity(item.id, 1)}>
                      +
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-semibold">
            Total: ${total.toFixed(2)}
          </p>
          <Button onClick={() => router.push("/delivery")} className="mt-4">
            Proceed to Delivery
          </Button>
        </main>
      </div>
      <Footer />
    </div>
  );
}
