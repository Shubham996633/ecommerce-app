import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const purchaseId = searchParams.get("purchaseId");

  if (!purchaseId) {
    return NextResponse.json({ error: "Missing purchaseId" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: { invoice: true },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json({
    isVerified: !!purchase.invoice || purchase.status === "success",
  });
}

export async function POST(request: Request) {
  try {
    const { purchaseId, status, email, total } = await request.json();

    if (!purchaseId || !status || !email || typeof total !== "number") {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if purchase exists and hasn't been processed yet
    const purchase = await prisma.purchase.findUnique({
      where: { id: purchaseId },
      include: { invoice: true, user: true },
    });

    if (!purchase) {
      return NextResponse.json(
        { error: "Purchase not found" },
        { status: 404 }
      );
    }

    // If invoice already exists, skip creation to prevent duplicates
    if (purchase.invoice) {
      return NextResponse.json(
        { message: "Payment already processed" },
        { status: 200 }
      );
    }

    // Update purchase status
    await prisma.purchase.update({
      where: { id: purchaseId },
      data: { status },
    });

    if (status === "success") {
      // Create invoice
      await prisma.invoice.create({
        data: {
          purchaseId,
          details: JSON.stringify({ total, items: "PC Device" }),
        },
      });

      // Clear cart for the user
      if (purchase.userId) {
        await prisma.cart.deleteMany({ where: { userId: purchase.userId } });
        const user = await currentUser();
        const userId = user?.id;
        await prisma.cart.deleteMany({ where: { userId } });
      }

      return NextResponse.json(
        { message: "Payment verified successfully" },
        { status: 200 }
      );
    } else {
      return NextResponse.json({ message: "Payment failed" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
