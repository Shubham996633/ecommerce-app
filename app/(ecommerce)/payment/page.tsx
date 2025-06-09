"use client";

import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { loadStripe } from "@stripe/stripe-js";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

// Initialize Stripe with publishable key
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

interface PurchaseItem {
  product: {
    name: string;
    price: number;
  };
  quantity: number;
}

interface Purchase {
  id: string;
  total: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  items?: PurchaseItem[];
}

export default function Payment({
  searchParams: paramsPromise,
}: {
  searchParams: Promise<{ purchaseId: string }>;
}) {
  const params = React.use(paramsPromise);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [fetching, setFetching] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPurchaseDetails() {
      setFetching(true);

      const userResponse = await fetch("/api/user");
      const userData = await userResponse.json();
      if (!userResponse.ok || !userData.userId) {
        window.location.href = "/sign-in";
        return;
      }

      const purchaseResponse = await fetch(
        `/api/purchase?purchaseId=${params.purchaseId}`
      );
      const purchaseData = await purchaseResponse.json();
      if (!purchaseResponse.ok || !purchaseData) {
        window.location.href = "/cart";
        return;
      }

      setPurchase(purchaseData);
      setFetching(false);
    }

    fetchPurchaseDetails();
  }, [params.purchaseId]);

  async function handlePayment() {
    setLoading(true);
    setError(null);

    const userResponse = await fetch("/api/user");
    const userData = await userResponse.json();
    if (!userResponse.ok || !userData.userId) {
      window.location.href = "/sign-in";
      return;
    }
    const { email } = userData;

    const response = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: purchase!.total * 100,
        purchaseId: purchase!.id,
        email,
      }),
    });

    const { sessionId } = await response.json();
    if (!sessionId) {
      setError("Failed to create checkout session");
      setLoading(false);
      return;
    }

    const stripe = await stripePromise;
    if (!stripe) {
      setError("Stripe failed to load");
      setLoading(false);
      return;
    }

    const { error } = await stripe.redirectToCheckout({ sessionId });
    if (error) {
      setError(error.message || "Failed to redirect to checkout");
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 p-4">
          <Loader />
        </main>
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <main className="flex-1 p-4">
          <p className="text-lg text-red-600">Purchase not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1 p-4 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Payment</h1>

        <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
          {/* Order Summary */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            {purchase.items && purchase.items.length > 0 ? (
              <div className="space-y-3">
                {purchase.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between text-gray-600"
                  >
                    <span>
                      {item.product.name} (x{item.quantity})
                    </span>
                    <span>
                      ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-600">
                <p>Single Item Purchase</p>
                <p>Total: ${purchase.total.toFixed(2)}</p>
              </div>
            )}
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push("/cart")}
            >
              Modify Cart
            </Button>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>${purchase.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Shipping Address
            </h2>
            <div className="text-gray-600">
              <p>{purchase.address?.street}</p>
              <p>
                {purchase.address?.city}, {purchase.address?.state}{" "}
                {purchase.address?.zip}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                router.push(`/delivery?productId=${params.purchaseId}`)
              }
            >
              Change Address
            </Button>
          </div>

          {/* Payment Section with Stripe Branding */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Complete Your Payment
            </h2>
            <div className="flex justify-center mb-4">
              <Image
                src="/stripe.png"
                alt="Stripe Logo"
                width={84}
                height={60}
                className="h-10"
              />
            </div>
            <Button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? "Processing..." : "Pay with Stripe"}
            </Button>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
