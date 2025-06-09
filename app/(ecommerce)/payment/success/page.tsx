/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import emailjs from "@emailjs/browser";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function PaymentSuccess({
  searchParams: paramsPromise,
}: {
  searchParams: Promise<{ purchaseId: string }>;
}) {
  const params = React.use(paramsPromise);

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [progress, setProgress] = useState<string>(
    "Checking payment status..."
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Utility to add a delay for smoother UI updates
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    async function handleSuccess() {
      try {
        if (!params.purchaseId) {
          throw new Error("Missing purchase ID");
        }

        // Step 1: Check payment status
        setProgress("Checking payment status...");
        await delay(500);
        const verifyCheckResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-payment?purchaseId=${params.purchaseId}`,
          { cache: "no-store" }
        );
        if (!verifyCheckResponse.ok) {
          throw new Error("Failed to check payment status");
        }
        const { isVerified } = await verifyCheckResponse.json();
        if (isVerified) {
          setStatus("success");
          setProgress("Payment already processed. Redirecting...");
          setTimeout(() => router.push("/account"), 2000);
          return;
        }

        // Step 2: Fetch purchase details
        setProgress("Fetching purchase details...");
        await delay(500);
        const purchaseResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/purchase?purchaseId=${params.purchaseId}`,
          { cache: "no-store" }
        );
        if (!purchaseResponse.ok) {
          throw new Error("Failed to fetch purchase details");
        }
        const purchase = await purchaseResponse.json();
        if (!purchase) {
          throw new Error("Purchase not found");
        }

        // Step 3: Fetch user details
        setProgress("Fetching user details...");
        await delay(500);
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/user`,
          { cache: "no-store" }
        );
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user details");
        }
        const { email, name } = await userResponse.json();

        // Step 4: Fetch address details
        setProgress("Fetching shipping address...");
        await delay(500);
        const addressResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/address?addressId=${purchase.addressId}`,
          { cache: "no-store" }
        );
        if (!addressResponse.ok) {
          throw new Error("Failed to fetch address details");
        }
        const address = await addressResponse.json();

        // Step 5: Verify payment and generate invoice
        setProgress("Generating invoice...");
        await delay(500);
        const verifyResponse = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-payment`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              purchaseId: params.purchaseId,
              status: "success",
              email,
              total: purchase.total,
            }),
          }
        );
        if (!verifyResponse.ok) {
          throw new Error("Payment verification failed");
        }

        // Step 6: Prepare and send email
        setProgress("Preparing confirmation email...");
        await delay(500);

        // Prepare items as a formatted string
        const items = (purchase.items || []).map((item: any, index: number) => {
          const quantity = Number(item.quantity) || 1;
          const price = item.product?.price
            ? Number(item.product.price).toFixed(2)
            : Number(purchase.total / quantity).toFixed(2);
          return `${item.product?.name || `Item ${index + 1}`} - Quantity: ${quantity} - Price: $${price}`;
        });

        // If no items, add a fallback
        if (items.length === 0) {
          items.push(
            `Unknown Item - Quantity: 1 - Price: $${Number(purchase.total).toFixed(2)}`
          );
        }

        const emailParams = {
          user_name: name || email || "Customer",
          email: email || "unknown@example.com",
          order_id: purchase.id || "N/A",
          items: items.join("\n"), // Convert array to newline-separated string
          total_amount: Number(purchase.total || 0).toFixed(2),
          address_street: address?.street || "N/A",
          address_city: address?.city || "N/A",
          address_state: address?.state || "N/A",
          address_zip: address?.zip || "N/A",
          delivery_info: "3-5 business days",
        };

        // Validate email parameters
        if (!emailParams.email || !emailParams.items) {
          console.error("Invalid email parameters:", emailParams);
          throw new Error(
            "Invalid email parameters: required fields are missing"
          );
        }

        // Send email via EmailJS
        setProgress("Sending confirmation email...");
        await delay(500);
        const emailResponse = await emailjs.send(
          process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
          process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
          emailParams,
          process.env.NEXT_PUBLIC_EMAILJS_USER_ID!
        );
        console.log("EmailJS response:", emailResponse);

        setStatus("success");
        setProgress("Payment processed successfully. Redirecting...");
        setTimeout(() => router.push("/account"), 2000);
      } catch (error: any) {
        console.error("Payment success error:", error);
        setStatus("error");
        setErrorMessage(
          error.message || "An error occurred while processing your payment."
        );
      }
    }

    if (params.purchaseId && status === "loading") {
      handleSuccess();
    }
  }, [params.purchaseId, status, router]);

  return (
    <div className="min-h-screen  overflow-hidden flex flex-col bg-gray-50">
      <div className="flex flex-1 mb-6 overflow-hidden items-center">
        <main className="flex-1 p-4  text-center">
          {status === "loading" && (
            <div className="flex flex-col  items-center">
              <Loader2 className="w-16 h-16 animate-spin text-blue-500 mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Processing Payment...
              </h1>
              <p className="text-gray-600">{progress}</p>
            </div>
          )}
          {status === "success" && (
            <div>
              <h1 className="text-3xl font-bold text-green-600">
                Payment Successful!
              </h1>
              <p className="mt-4 text-gray-600">{progress}</p>
            </div>
          )}
          {status === "error" && (
            <div>
              <h1 className="text-3xl font-bold text-red-600">
                Payment Processing Error
              </h1>
              <p className="mt-4 text-gray-600">
                {errorMessage || "Please try again or contact support."}
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
