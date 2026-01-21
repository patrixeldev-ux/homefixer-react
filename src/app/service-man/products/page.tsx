"use client";

import React, { useState } from "react";

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

export default function CustomerProducts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState<number[]>([]);

  const toggleCart = (id: number) => {
    if (cart.includes(id)) {
      setCart(cart.filter((item) => item !== id));
    } else {
      setCart([...cart, id]);
    }
  };

  const filteredProducts = productsData.filter((product) => {
    const matchesCategory = category === "All" || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Products</h1>

      {/* Search and Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <input
          type="text"
          placeholder="Search products..."
          className="border rounded-lg p-2 w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded-lg p-2 w-full md:w-1/4"
        >
          <option value="All">All Categories</option>
          <option value="Hardware">Hardware</option>
          <option value="Electrician">Electrician</option>
          <option value="Plumbing">Plumbing</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-lg transition-shadow"
          >
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-40 object-contain mb-4"
            />

            <div className="flex flex-col gap-1">
              <span className="font-semibold text-lg">${product.price.toFixed(2)}</span>
              <span className="font-medium">{product.name}</span>
              <span className="text-gray-500 text-sm">{product.category}</span>
            </div>

            <button
              onClick={() => toggleCart(product.id)}
              className={`mt-4 text-black py-2 rounded-lg transition ${
                cart.includes(product.id)
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {cart.includes(product.id) ? "Added" : "Add to Cart"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
