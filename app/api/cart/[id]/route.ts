import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server"; // Import NextRequest for proper typing
import { NextResponse } from "next/server";

// PATCH handler
export async function PATCH(
  req: NextRequest, // Use NextRequest instead of Request for better type inference
  { params }: { params: { id: string } } // Explicitly define the params type
) {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { quantity } = await req.json();
  const updatedItem = await prisma.cart.update({
    where: { id: params.id },
    data: { quantity },
  });

  return NextResponse.json(updatedItem);
}

// DELETE handler
export async function PUT(
  { params }: { params: { id: string } } // Explicitly define the params type
) {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.cart.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
