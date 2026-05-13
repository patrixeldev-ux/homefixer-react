"use client";

import React, { useEffect, useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
};

type Address = {
  id: number;
  type: string;
  firstName: string;
  lastName: string;
  phone: string;
  altPhone: string;
  address: string;
  city: string;
  country: string;
  zip: string;
};

const PRODUCTS: Product[] = [
  { id: 1, name: "Hammer", price: 12.99, image: "/assets/comingsoon.png" },
  { id: 2, name: "Screwdriver Set", price: 15.5, image: "/assets/comingsoon.png" },
];

const EMPTY_ADDRESS: Address = {
  id: 0,
  type: "Home",
  firstName: "",
  lastName: "",
  phone: "",
  altPhone: "",
  address: "",
  city: "",
  country: "",
  zip: "",
};

export default function Checkout() {
  /* CART */
  const cartIds = [1, 2];
  const quantities: Record<number, number> = { 1: 2, 2: 1 };

  /* ADDRESS */
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Address>(EMPTY_ADDRESS);

  /* LOAD LOCAL STORAGE */
  useEffect(() => {
    const saved = localStorage.getItem("addresses");
    if (saved) setAddresses(JSON.parse(saved));
  }, []);

  const saveToStorage = (list: Address[]) => {
    setAddresses(list);
    localStorage.setItem("addresses", JSON.stringify(list));
  };

  /* SAVE / UPDATE ADDRESS */
  const saveAddress = () => {
    if (!form.firstName || !form.phone || !form.address) {
      alert("Please fill required fields");
      return;
    }

    if (editingId) {
      const updated = addresses.map(a =>
        a.id === editingId ? { ...form, id: editingId } : a
      );
      saveToStorage(updated);
    } else {
      saveToStorage([...addresses, { ...form, id: Date.now() }]);
    }

    setForm(EMPTY_ADDRESS);
    setEditingId(null);
  };

  /* EDIT */
  const editAddress = (addr: Address) => {
    setForm(addr);
    setEditingId(addr.id);
  };

  /* DELETE */
  const deleteAddress = (id: number) => {
    const filtered = addresses.filter(a => a.id !== id);
    saveToStorage(filtered);
    if (selectedId === id) setSelectedId(null);
  };

  /* CART CALCULATION */
  const cartItems = PRODUCTS.filter(p => cartIds.includes(p.id));

  const subTotal = cartItems.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] ?? 1),
    0
  );

  const vat = subTotal * 0.06;
  const shipping = 35;
  const total = subTotal + vat + shipping;

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

      {/* LEFT */}
      <div className="lg:col-span-2 space-y-6">

        {/* ADDRESS LIST */}
        {addresses.map(addr => (
          <div key={addr.id} className="border rounded-lg p-6 bg-white">
            <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded text-sm">
              {addr.type}
            </span>

            <div className="flex justify-between mt-3">
              <div>
                <p className="font-semibold">
                  {addr.firstName} {addr.lastName} – {addr.phone}
                </p>
                <p className="text-sm text-gray-500">
                  {addr.address}, {addr.city}, {addr.country} – {addr.zip}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => editAddress(addr)}
                  className="text-blue-500"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="text-red-500"
                >
                  Delete
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedId(addr.id)}
              className={`mt-4 px-4 py-2 border rounded-lg ${
                selectedId === addr.id ? "bg-green-500 text-white" : ""
              }`}
            >
              {selectedId === addr.id ? "Selected" : "Select Address"}
            </button>
          </div>
        ))}

        {/* ADD / EDIT FORM */}
        <div className="border rounded-lg p-6 bg-white">
          <h2 className="font-bold mb-4">
            {editingId ? "Edit Address" : "Add New Address"}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="First Name"
              className="border p-3 rounded-lg"
              value={form.firstName}
              onChange={e => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              placeholder="Last Name"
              className="border p-3 rounded-lg"
              value={form.lastName}
              onChange={e => setForm({ ...form, lastName: e.target.value })}
            />
            <input
              placeholder="Phone"
              className="border p-3 rounded-lg"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Alt Phone"
              className="border p-3 rounded-lg"
              value={form.altPhone}
              onChange={e => setForm({ ...form, altPhone: e.target.value })}
            />
          </div>

          <textarea
            className="border p-3 rounded-lg w-full mt-4"
            placeholder="Full Address"
            value={form.address}
            onChange={e => setForm({ ...form, address: e.target.value })}
          />

          <div className="grid grid-cols-3 gap-4 mt-4">
            <input
              placeholder="City"
              className="border p-3 rounded-lg"
              value={form.city}
              onChange={e => setForm({ ...form, city: e.target.value })}
            />
            <input
              placeholder="Country"
              className="border p-3 rounded-lg"
              value={form.country}
              onChange={e => setForm({ ...form, country: e.target.value })}
            />
            <input
              placeholder="ZIP"
              className="border p-3 rounded-lg"
              value={form.zip}
              onChange={e => setForm({ ...form, zip: e.target.value })}
            />
          </div>

          <button
            onClick={saveAddress}
            className="mt-6 bg-green-500 text-white px-6 py-2 rounded-lg"
          >
            {editingId ? "Update Address" : "Save Address"}
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <div className="border rounded-lg p-6 bg-white h-fit">
        <h2 className="font-bold mb-4">Order Summary</h2>

        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm mb-2">
            <span>{item.name} × {quantities[item.id] ?? 1}</span>
            <span>${(item.price * (quantities[item.id] ?? 1)).toFixed(2)}</span>
          </div>
        ))}

        <hr className="my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sub Total</span>
            <span>${subTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>VAT (6%)</span>
            <span>${vat.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>${shipping}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <button
          disabled={!selectedId}
          className="mt-6 w-full bg-blue-500 text-white py-3 rounded-lg disabled:opacity-50"
        >
          Checkout Now
        </button>
      </div>
    </div>
  );
}
