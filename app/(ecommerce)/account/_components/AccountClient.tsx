"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, MapPin, Package, Search } from "lucide-react";
import { useState } from "react";

type Purchase = {
  id: string;
  total: number;
  status: string;
  address: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
  } | null;
  items: {
    quantity: number;
    product: { name: string; price: number } | null;
  }[];
};

type Props = {
  purchases: Purchase[];
  minTotal: number;
  maxTotal: number;
};

export default function AccountClient({
  purchases,
  minTotal,
  maxTotal,
}: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [amountFilter, setAmountFilter] = useState(maxTotal);

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAmount = purchase.total <= amountFilter;
    return matchesSearch && matchesAmount;
  });

  return (
    <>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Filter Purchases
        </h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/3 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by Purchase ID or Status"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label htmlFor="amountRange" className="block text-gray-700 mb-2">
              Amount Range: ${minTotal.toFixed(2)} - ${amountFilter.toFixed(2)}
            </label>
            <input
              type="range"
              id="amountRange"
              min={minTotal}
              max={maxTotal}
              step="10"
              value={amountFilter}
              onChange={(e) => setAmountFilter(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Purchase History */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Purchase History
      </h2>
      {filteredPurchases.length === 0 ? (
        <p className="text-gray-600">No purchases match your filters.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPurchases.map((purchase) => (
            <div
              key={purchase.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200"
            >
              <div className="flex items-center mb-3">
                <Package className="w-6 h-6 text-blue-500 mr-2" />
                <p className="font-semibold text-gray-800">
                  Purchase ID: {purchase.id.slice(0, 8)}...
                </p>
              </div>
              <div className="flex items-center mb-3">
                <MapPin className="w-6 h-6 text-green-500 mr-2" />
                <p className="text-gray-600">
                  {purchase.address?.street || "N/A"},{" "}
                  {purchase.address?.city || "N/A"},{" "}
                  {purchase.address?.state || "N/A"}{" "}
                  {purchase.address?.zip || "N/A"}
                </p>
              </div>
              <div className="mb-3">
                <p className="text-gray-600">
                  Status:{" "}
                  <span
                    className={`font-semibold ${
                      purchase.status === "success"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {purchase.status}
                  </span>
                </p>
              </div>
              <div className="mb-3">
                <p className="text-gray-600 font-semibold">Items:</p>
                <ul className="list-disc list-inside text-gray-600">
                  {purchase.items.map((item, index) => (
                    <li key={index}>
                      {item.product?.name || `Item ${index + 1}`} - Qty:{" "}
                      {item.quantity || 1}
                    </li>
                  ))}
                </ul>
              </div>
              <Button className="w-full bg-blue-500 hover:bg-blue-600">
                <DollarSign className="w-5 h-5 mr-2" />
                Total: ${purchase.total.toFixed(2)}
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
