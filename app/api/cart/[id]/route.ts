import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: { id: string };
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
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

export async function DELETE(req: NextRequest, context: RouteContext) {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.cart.delete({ where: { id: context.params.id } });
  return NextResponse.json({ success: true });
}
