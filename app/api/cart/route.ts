import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cartItems = await prisma.cart.findMany({
    where: { userId },
    include: { product: true },
  });

  return NextResponse.json(cartItems);
}

export async function POST(req: Request) {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { productId, quantity } = await req.json();
  const existingItem = await prisma.cart.findFirst({
    where: { userId, productId },
  });

  if (existingItem) {
    await prisma.cart.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
  } else {
    await prisma.cart.create({
      data: { userId, productId, quantity },
    });
  }

  return NextResponse.json({ success: true });
}
