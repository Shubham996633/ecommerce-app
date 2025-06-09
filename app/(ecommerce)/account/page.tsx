import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AccountClient from "./_components/AccountClient";

export default async function Account() {
  const user = await currentUser();
  const userId = user?.id;
  if (!userId) redirect("/sign-in");

  const purchases = await prisma.purchase.findMany({
    where: { userId },
    include: { address: true, items: { include: { product: true } } },
  });

  const userDetails = {
    name: user?.firstName || user?.username || "User",
    email: user?.emailAddresses[0]?.emailAddress || "N/A",
  };

  // Calculate min and max total for the range filter
  const minTotal =
    purchases.length > 0 ? Math.min(...purchases.map((p) => p.total)) : 0;
  const maxTotal =
    purchases.length > 0 ? Math.max(...purchases.map((p) => p.total)) : 1000;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1">
        <main className="flex-1 p-6 max-w-5xl mx-auto">
          {/* User Details */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Account</h1>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-semibold text-gray-700">
                  Name: {userDetails.name}
                </p>
                <p className="text-gray-600">Email: {userDetails.email}</p>
              </div>
              <SignOutButton>
                <Button className="bg-pink-950 text-white hover:bg-gray-700">
                  Logout
                </Button>
              </SignOutButton>
            </div>
          </div>

          {/* Pass data to Client Component */}
          <AccountClient
            purchases={purchases}
            minTotal={minTotal}
            maxTotal={maxTotal}
          />
        </main>
      </div>
    </div>
  );
}
