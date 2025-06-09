import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const addressId = searchParams.get("addressId");

  if (!addressId) {
    return NextResponse.json({ error: "Missing addressId" }, { status: 400 });
  }

  const address = await prisma.address.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    return NextResponse.json({ error: "Address not found" }, { status: 404 });
  }

  return NextResponse.json(address);
}
