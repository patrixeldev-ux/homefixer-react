"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
}

const productsData: Product[] = [
  { id: 1, name: "Hammer", price: 12.99, category: "Hardware", image: "/assets/comingsoon.png" },
  { id: 2, name: "Screwdriver Set", price: 15.5, category: "Hardware", image: "/assets/comingsoon.png" },
  { id: 3, name: "Electric Wire 5m", price: 25, category: "Electrician", image: "/assets/comingsoon.png" },
  { id: 4, name: "Plumbing Pipe 2 inch", price: 18, category: "Plumbing", image: "/assets/comingsoon.png" },
  { id: 5, name: "Light Bulb 10W", price: 5, category: "Electrician", image: "/assets/comingsoon.png" },
  { id: 6, name: "Wrench", price: 22, category: "Hardware", image: "/assets/comingsoon.png" },
  { id: 7, name: "Tap Valve", price: 30, category: "Plumbing", image: "/assets/comingsoon.png" },
  { id: 8, name: "Multimeter", price: 55, category: "Electrician", image: "/assets/comingsoon.png" },
];

export default function MyCart() {
  const router = useRouter();
  const [cart, setCart] = useState<number[]>([]);
  const [qty, setQty] = useState<Record<number, number>>({});

  /* Load cart */
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      const ids: number[] = JSON.parse(saved);
      setCart(ids);

      const q: Record<number, number> = {};
      ids.forEach(id => (q[id] = 1));
      setQty(q);
    }
  }, []);

  const cartItems = productsData.filter(p => cart.includes(p.id));

  /* Quantity handlers */
  const increase = (id: number) =>
    setQty(prev => ({ ...prev, [id]: prev[id] + 1 }));

  const decrease = (id: number) =>
    setQty(prev => ({ ...prev, [id]: Math.max(1, prev[id] - 1) }));

  const removeItem = (id: number) => {
    const updated = cart.filter(i => i !== id);
    setCart(updated);
    localStorage.setItem("cart", JSON.stringify(updated));

    const q = { ...qty };
    delete q[id];
    setQty(q);
  };

  /* Price calculations */
  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * (qty[item.id] || 1),
    0
  );
  const vat = subTotal * 0.06;
  const shipping = cartItems.length ? 35 : 0;
  const total = subTotal + vat + shipping;

  const handleCheckout = () => {
    router.push("/customer/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map(product => (
              <div
                key={product.id}
                className="flex gap-4 bg-white border rounded-lg p-4 shadow-sm"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-28 h-28 object-contain bg-gray-50 rounded"
                />

                <div className="flex-1">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>

                  <h3 className="font-semibold mt-2">{product.name}</h3>

                  <p className="font-bold mt-1">
                    ${(product.price * (qty[product.id] || 1)).toFixed(2)}
                  </p>

                  {/* QUANTITY UI */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => decrease(product.id)}
                      className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-lg font-bold"
                    >
                      −
                    </button>

                    <span className="w-6 text-center">
                      {qty[product.id]}
                    </span>

                    <button
                      onClick={() => increase(product.id)}
                      className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(product.id)}
                  className="text-gray-400 hover:text-red-500 text-xl"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="bg-white border rounded-lg p-6 shadow-sm h-fit">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Sub Amount</span>
                <span>${subTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>VAT (6%)</span>
                <span>${vat.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${shipping.toFixed(2)}</span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="mt-6 w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              Checkout Now
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => router.push("/customer/products")}
        className="mt-6 text-blue-600 hover:underline"
      >
        ← Back to Products
      </button>
    </div>
  );
}
