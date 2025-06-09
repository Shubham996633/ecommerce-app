import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return new Response("Webhook secret not set", { status: 500 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const purchaseId = session.metadata?.purchaseId;
    if (!purchaseId) {
      console.error("No purchaseId in session metadata");
      return NextResponse.json({ received: true });
    }

    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
    });
    if (purchase) {
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: "success" },
      });

      const invoice = await prisma.invoice.create({
        data: {
          purchaseId: purchase.id,
          details: JSON.stringify({
            total: purchase.total,
            items: "PC Device",
          }),
        },
      });

      const dbUser = await prisma.user.findUnique({
        where: { id: purchase.userId },
      });
      if (dbUser) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "orders@techshop.com",
          to: dbUser.email,
          subject: "Order Confirmation",
          html: `
            <h1>Order Confirmed</h1>
            <p>Thank you for your purchase!</p>
            <p>Total: $${purchase.total.toFixed(2)}</p>
            <p>Estimated Delivery: 3-5 business days</p>
            <p>Invoice ID: ${invoice.id}</p>
          `,
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
