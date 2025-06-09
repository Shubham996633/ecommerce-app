import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

export async function POST(req: Request) {
  const { amount, purchaseId, email } = await req.json();

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "PC Device Purchase",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?purchaseId=${purchaseId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/cart`,
      metadata: { purchaseId },
      customer_email: email,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Error creating Checkout Session:", error);
    return NextResponse.json(
      { error: "Failed to create Checkout Session" },
      { status: 500 }
    );
  }
}
