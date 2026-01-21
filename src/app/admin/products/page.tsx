"use client";

import { useState } from "react";

interface Product {
  id: number;
  name: string;
  image_url?: string;
  category_name: string;
  price: number;
  stock: number;
  status: "Active" | "Inactive";
}

export default function ProductTable() {
  // Dummy initial products
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Pipe Wrench",
      image_url: "https://via.placeholder.com/40",
      category_name: "Plumbing",
      price: 25,
      stock: 10,
      status: "Active",
    },
    {
      id: 2,
      name: "Electric Drill",
      image_url: "https://via.placeholder.com/40",
      category_name: "Electrician",
      price: 75,
      stock: 5,
      status: "Active",
    },
  ]);

  // State for the form
  const [form, setForm] = useState({
    name: "",
    image_url: "",
    category_name: "",
    price: "",
    stock: "",
    status: "Active" as "Active" | "Inactive",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const addProduct = () => {
    if (!form.name || !form.price || !form.stock || !form.category_name) {
      alert("Please fill all required fields");
      return;
    }

    const newProduct: Product = {
      id: products.length + 1,
      name: form.name,
      image_url: form.image_url || "https://via.placeholder.com/40",
      category_name: form.category_name,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      status: form.status,
    };

    setProducts([...products, newProduct]);

    // Reset form
    setForm({
      name: "",
      image_url: "",
      category_name: "",
      price: "",
      stock: "",
      status: "Active",
    });
  };

  const deleteProduct = (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      {/* ---------------- Add Product Form ---------------- */}
      <div className="mb-6 border p-4 rounded-lg bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">Add New Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          <input
            type="text"
            name="name"
            placeholder="Product Name"
            value={form.name}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded col-span-1 md:col-span-2"
          />
          <input
            type="text"
            name="image_url"
            placeholder="Image URL (optional)"
            value={form.image_url}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded col-span-1 md:col-span-2"
          />
          <input
            type="text"
            name="category_name"
            placeholder="Category"
            value={form.category_name}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded col-span-1 md:col-span-1"
          />
          <input
            type="number"
            name="price"
            placeholder="Price"
            value={form.price}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded col-span-1 md:col-span-1"
          />
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={form.stock}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded col-span-1 md:col-span-1"
          />
          <select
            name="status"
            value={form.status}
            onChange={handleInputChange}
            className="border px-3 py-2 rounded col-span-1 md:col-span-1"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button
            onClick={addProduct}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 col-span-1 md:col-span-1"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* ---------------- Product Table ---------------- */}
      <div className="overflow-x-auto border rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 border">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-8 py-2 text-left border-r">
                <input type="checkbox" />
              </th>
              <th className="px-8 py-2 text-left border-r">Product ID</th>
              <th className="px-8 py-2 text-left border-r">Product Name</th>
              <th className="px-8 py-2 text-left border-r">Category</th>
              <th className="px-8 py-2 text-left border-r">Price</th>
              <th className="px-8 py-2 text-left border-r">Stock</th>
              <th className="px-8 py-2 text-left border-r">Status</th>
              <th className="px-8 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100`}
              >
                <td className="px-4 py-2 border-r">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-2 border-r">{`PRD-${product.id}`}</td>
                <td className="px-4 py-2 flex items-center gap-2 border-r">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="px-4 py-2 border-r">{product.category_name}</td>
                <td className="px-4 py-2 border-r">${product.price}</td>
                <td className="px-4 py-2 border-r">{product.stock}</td>
                <td className="px-4 py-2 border-r">
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      product.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
