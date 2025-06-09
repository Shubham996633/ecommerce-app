import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Delivery({
  searchParams,
}: {
  searchParams: { productId?: string };
}) {
  const clerkUser = await currentUser();
  const userId = clerkUser?.id;
  if (!userId) redirect("/sign-in");

  // Fetch all addresses for the user
  const addresses = await prisma.address.findMany({ where: { userId } });

  // Server action to add a new address
  async function addAddress(formData: FormData) {
    "use server";
    const clerkUser = await currentUser();
    const userId = clerkUser?.id;
    if (!userId) redirect("/sign-in");

    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const zip = formData.get("zip") as string;

    await prisma.address.create({
      data: {
        userId,
        street,
        city,
        state,
        zip,
      },
    });

    redirect(
      `/delivery${searchParams.productId ? `?productId=${searchParams.productId}` : ""}`
    );
  }

  // Server action to proceed to payment with selected address
  async function proceedToPayment(formData: FormData) {
    "use server";
    const clerkUser = await currentUser();
    const userId = clerkUser?.id;
    if (!userId) redirect("/sign-in");

    const productId = formData.get("productId") as string | null;
    const addressId = formData.get("addressId") as string;

    if (!addressId) {
      redirect("/delivery?error=Please select a shipping address");
    }

    // Verify the address belongs to the user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId },
    });
    if (!address) redirect("/cart");

    let total = 0;
    let purchase;

    if (productId) {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) redirect("/cart");
      total = product.price;

      purchase = await prisma.purchase.create({
        data: {
          userId,
          total,
          addressId: address.id,
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
              },
            ],
          },
        },
      });
    } else {
      const cartItems = await prisma.cart.findMany({
        where: { userId },
        include: { product: true },
      });
      if (!cartItems.length) redirect("/cart");
      total = cartItems.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      purchase = await prisma.purchase.create({
        data: {
          userId,
          total,
          addressId: address.id,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
            })),
          },
        },
      });
    }

    redirect(`/payment?purchaseId=${purchase.id}`);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Delivery</h1>
          <div className="flex flex-row space-x-6">
            {/* Conditionally render the address selection section if addresses exist */}
            {addresses.length > 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
                <h2 className="text-xl font-semibold mb-4">
                  Select Shipping Address
                </h2>
                <form action={proceedToPayment}>
                  <RadioGroup name="addressId" defaultValue={addresses[0].id}>
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="flex items-center space-x-2 mb-3 p-3 border rounded-lg"
                      >
                        <RadioGroupItem value={address.id} id={address.id} />
                        <Label htmlFor={address.id} className="flex-1">
                          <p className="text-gray-600">{address.street}</p>
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.zip}
                          </p>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  <input
                    type="hidden"
                    name="productId"
                    value={searchParams.productId || ""}
                  />
                  <input
                    type="hidden"
                    name="addressId"
                    value={addresses[0].id}
                  />
                  <p className="mt-4 text-gray-600">
                    Estimated Delivery: 3-5 business days
                  </p>
                  <Button type="submit" className="mt-4">
                    Proceed to Payment
                  </Button>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">
                  No Addresses Found
                </h2>
                <p className="text-gray-600">
                  Please add a shipping address to proceed with your order.
                </p>
              </div>
            )}

            {/* Form to add a new address */}
            <div className="bg-white p-6 rounded-lg shadow-md w-1/2">
              <h2 className="text-xl font-semibold mb-4">Add New Address</h2>
              <form action={addAddress} className="space-y-4">
                <div>
                  <Label htmlFor="street">Street</Label>
                  <Input
                    className="mb-1"
                    id="street"
                    name="street"
                    type="text"
                    required
                    placeholder="123 Main St"
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    className="mb-1"
                    id="city"
                    name="city"
                    type="text"
                    required
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    className="mb-1"
                    id="state"
                    name="state"
                    type="text"
                    required
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label htmlFor="zip">Zip Code</Label>
                  <Input
                    className="mb-1"
                    id="zip"
                    name="zip"
                    type="text"
                    required
                    placeholder="10001"
                  />
                </div>
                <Button type="submit">Add Address</Button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
