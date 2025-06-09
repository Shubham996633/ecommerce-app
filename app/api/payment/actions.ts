"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function verifyPayment({
  purchaseId,
  status,
  email,
  total,
}: {
  purchaseId: string;
  status: "success" | "failed";
  email: string;
  total: number;
}) {
  await prisma.purchase.update({
    where: { id: purchaseId },
    data: { status },
  });

  if (status === "success") {
    const invoice = await prisma.invoice.create({
      data: {
        purchaseId,
        details: JSON.stringify({ total, items: "PC Device" }),
      },
    });

    const userResponse = await fetch("/api/user");
    const { userId } = await userResponse.json();
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (user) {
      const templateParams = {
        user_name: user.name || user.email,
        total: total.toFixed(2),
        invoice_id: invoice.id,
        to_email: email,
      };

      // Since emailjs is client-side, we'll simulate the call here
      // In a real server action, you'd use a server-side email service or an API route
      console.log("Sending email via EmailJS:", templateParams);
      // Note: EmailJS needs to be called client-side; we'll handle this in a client component
    }

    redirect("/account");
  } else {
    redirect("/cart");
  }
}
