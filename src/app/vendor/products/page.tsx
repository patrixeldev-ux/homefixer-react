"use client";

import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import DataTable from "react-data-table-component";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

const dummyProducts: Product[] = [
  {
    id: 1,
    name: "Hammer",
    description: "Heavy duty hammer",
    price: 50,
    stock: 10,
    category: "Tools",
    image: "/assets/hammer.jpg",
  },
  {
    id: 2,
    name: "Drill",
    description: "Electric drill",
    price: 150,
    stock: 5,
    category: "Tools",
    image: "/assets/drill.jpg",
  },
];

export default function VendorProductsPage() {
  const [products, setProducts] = useState<Product[]>(dummyProducts);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    price: 0,
    stock: 0,
    category: "",
    image: "",
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setNewProduct({
      name: "",
      description: "",
      price: 0,
      stock: 0,
      category: "",
      image: "",
    });
    setShowModal(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct(product);
    setShowModal(true);
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleSaveProduct = () => {
    if (editingProduct) {
      setProducts(
        products.map((p) => (p.id === editingProduct.id ? { ...p, ...newProduct } : p))
      );
    } else {
      const newId = Math.max(...products.map((p) => p.id)) + 1;
      setProducts([...products, { ...newProduct, id: newId } as Product]);
    }
    setShowModal(false);
  };

  const columns = [
    { name: "ID", selector: (row: Product) => row.id, sortable: true },
    { name: "Name", selector: (row: Product) => row.name, sortable: true },
    { name: "Description", selector: (row: Product) => row.description },
    { name: "Price", selector: (row: Product) => `$${row.price}`, sortable: true },
    { name: "Stock", selector: (row: Product) => row.stock, sortable: true },
    { name: "Category", selector: (row: Product) => row.category, sortable: true },
    {
      name: "Actions",
      cell: (row: Product) => (
        <div className="flex gap-1">
          <button
            className="text-blue-600 text-sm hover:underline"
            onClick={() => handleEditProduct(row)}
          >
            Edit 
          </button>
          
          <button
            className="text-red-600 text-sm hover:underline"
            onClick={() => handleDeleteProduct(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-md shadow hover:bg-green-700 transition"
            onClick={handleAddProduct}
          >
            Add Product
          </button>
        </header>
        <main className="p-6 flex-1 overflow-auto">
          <div className="bg-white shadow-md rounded-lg p-6">
            <DataTable
              columns={columns}
              data={products}
              pagination
              highlightOnHover
              striped
              customStyles={{
                header: { style: { display: "none" } },
                rows: {
                  style: {
                    borderBottom: "1px solid #e5e7eb",
                  },
                },
                table: {
                  style: {
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.75rem",
                  },
                },
              }}
              noDataComponent="No products found"
            />
          </div>
        </main>
      </div>

      {/* Modal for Add/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={newProduct.name || ""}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="input input-bordered w-full"
              />
              <textarea
                placeholder="Description"
                value={newProduct.description || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, description: e.target.value })
                }
                className="textarea textarea-bordered w-full"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })
                }
                className="input input-bordered w-full"
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Category"
                value={newProduct.category || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, category: e.target.value })
                }
                className="input input-bordered w-full"
              />
              <input
                type="text"
                placeholder="Image URL"
                value={newProduct.image || ""}
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.value })
                }
                className="input input-bordered w-full"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
                onClick={handleSaveProduct}
              >
                Save
              </button>
              <button
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md shadow hover:bg-gray-300 transition"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
