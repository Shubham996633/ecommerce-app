import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const purchaseId = searchParams.get("purchaseId");

  if (!purchaseId) {
    return NextResponse.json({ error: "Missing purchaseId" }, { status: 400 });
  }

  const purchase = await prisma.purchase.findUnique({
    where: { id: purchaseId },
    include: {
      items: {
        include: { product: true },
      },
      address: true,
    },
  });

  if (!purchase) {
    return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...purchase,
    total: purchase.total || 0,
    items: purchase.items.map((item, index) => ({
      ...item,
      quantity: item.quantity || 1,
      product: {
        name: item.product?.name || `Item ${index + 1}`,
        price:
          item.product?.price || (purchase.total || 0) / (item.quantity || 1),
      },
    })),
  });
}
