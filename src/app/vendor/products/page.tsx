"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  stock_quantity: number;
  category: number;
  image_url: string | null;
}

interface Category { id: number; name: string; }

export default function VendorProductsPage() {
  const router = useRouter();
  const [products, setProducts]     = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [showModal, setShowModal]   = useState(false);
  const [editingId, setEditingId]   = useState<number | null>(null);
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", stock_quantity: "", category: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/vendor"); return; }
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Products fetch failed"); }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/product-categories/");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Categories fetch failed"); }
  };

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: "", description: "", price: "", stock_quantity: "", category: "" });
    setImageFile(null);
    setError("");
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || "",
      price: p.price, stock_quantity: String(p.stock_quantity),
      category: String(p.category),
    });
    setImageFile(null);
    setError("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock_quantity || !form.category)
      return setError("All fields except description are required");

    setSaving(true);
    setError("");
    try {
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("price", form.price);
      data.append("stock_quantity", form.stock_quantity);
      data.append("category", form.category);
      if (imageFile) data.append("image", imageFile);

      if (editingId) {
        await api.put(`/api/products/${editingId}/update/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/products/create/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      await fetchProducts();
      setShowModal(false);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Failed to save product");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/api/products/${id}/delete/`);
      await fetchProducts();
    } catch { alert("Failed to delete product"); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push("/vendor/dashboard")}
              className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">←</button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-500 text-sm">{products.length} products</p>
            </div>
          </div>
          <button onClick={openAdd}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors">
            + Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
            <p className="text-5xl mb-3">📦</p>
            <p className="font-bold text-gray-900 text-lg">No products yet</p>
            <p className="text-gray-500 text-sm mt-1 mb-4">Add your first product to start receiving orders</p>
            <button onClick={openAdd}
              className="px-6 py-2.5 bg-amber-500 text-white font-bold rounded-xl">
              + Add Product
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-50 flex items-center justify-center border-b border-gray-100">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="h-full w-full object-contain p-3" />
                    : <span className="text-5xl">🔩</span>
                  }
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900">{p.name}</h3>
                  {p.description && <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{p.description}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-amber-600 font-bold text-lg">₹{p.price}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      p.stock_quantity > 5 ? "bg-green-50 text-green-700" :
                      p.stock_quantity > 0 ? "bg-yellow-50 text-yellow-700" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {p.stock_quantity > 0 ? `${p.stock_quantity} in stock` : "Out of stock"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {categories.find(c => c.id === p.category)?.name ?? "—"}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => openEdit(p)}
                      className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold rounded-lg text-sm">
                      ✎ Edit
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg text-sm">
                      🗑 Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-gray-100 rounded-full text-gray-600 font-bold hover:bg-gray-200">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Product Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Water Tap 1/2 inch"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Brief description"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="299"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1">Stock *</label>
                  <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: e.target.value }))}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Category *</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white">
                  <option value="">Select category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1">Product Image</label>
                <input type="file" accept="image/*"
                  onChange={e => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400" />
              </div>
            </div>

            {error && (
              <div className="mt-3 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-xl">
                {error}
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold rounded-xl">
                {saving ? "Saving..." : editingId ? "Update Product" : "Add Product"}
              </button>
              <button onClick={() => setShowModal(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}