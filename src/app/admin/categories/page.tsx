"use client";

import { useEffect, useState } from "react";
import api from "../../../lib/api";

/* ---------------- TYPES ---------------- */
interface Category {
  id: number;
  name: string;
  icon_url?: string | null;
  type: "SERVICE" | "PRODUCT";
  serviceCount?: number;
}

/* ---------------- PAGE ---------------- */
export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [type, setType] = useState<"SERVICE" | "PRODUCT">("SERVICE");
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* -------- FETCH CATEGORIES -------- */
  const fetchCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/api/admin/categories");

      /**
       * CHANGEABLE RESPONSE HANDLING
       * - Some APIs return array directly
       * - Some wrap inside { data: [...] }
       */
      const rawCategories: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];

      const mapped: Category[] = rawCategories.map((cat: any) => ({
        id: cat.id,
        name: cat.name || "-",
        icon_url: cat.icon_url ?? null,
        type: cat.type,
        serviceCount: cat.serviceCount ?? cat.services_count ?? 0,
      }));

      setCategories(mapped);
    } catch (err) {
      console.error("FETCH CATEGORIES ERROR:", err);
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* -------- ADD / UPDATE CATEGORY -------- */
  const handleSubmit = async () => {
    if (!name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        icon_url: iconUrl.trim() || null,
        type,
      };

      if (editingId) {
        // UPDATE
        await api.put(`/api/admin/categories/${editingId}`, payload);
      } else {
        // CREATE
        await api.post("/api/admin/categories", payload);
      }

      // RESET FORM
      setName("");
      setIconUrl("");
      setType("SERVICE");
      setEditingId(null);

      fetchCategories();
    } catch (err) {
      console.error("SAVE CATEGORY ERROR:", err);
      setError(
        editingId
          ? "Failed to update category"
          : "Failed to create category"
      );
    } finally {
      setLoading(false);
    }
  };

  /* -------- EDIT CATEGORY -------- */
  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setName(cat.name);
    setIconUrl(cat.icon_url || "");
    setType(cat.type);
  };

  /* -------- DELETE CATEGORY -------- */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);
    setError(null);

    try {
      await api.delete(`/api/admin/categories/${id}`);
      setCategories(prev => prev.filter(cat => cat.id !== id));
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Cannot delete category with active services";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      {/* ---------- HEADER ---------- */}
      <h1 className="text-3xl font-bold text-gray-900">
        Categories Management
      </h1>

      {/* ---------- ADD / EDIT ---------- */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? "Update Category" : "Add New Category"}
        </h2>

        <div className="grid md:grid-cols-4 gap-4">
          <input
            placeholder="Category Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="p-3 border rounded-lg"
          />

          <input
            placeholder="Icon URL (optional)"
            value={iconUrl}
            onChange={e => setIconUrl(e.target.value)}
            className="p-3 border rounded-lg"
          />

          <select
            value={type}
            onChange={e => setType(e.target.value as "SERVICE" | "PRODUCT")}
            className="p-3 border rounded-lg"
          >
            <option value="SERVICE">Service</option>
            <option value="PRODUCT">Product</option>
          </select>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`text-white rounded-lg font-semibold ${
              editingId
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {editingId ? "Update" : "Add"}
          </button>
        </div>

        {error && <p className="mt-3 text-red-500">{error}</p>}
      </div>

      {/* ---------- CATEGORY LIST ---------- */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Existing Categories</h2>

        {loading && <p className="text-gray-500">Loading...</p>}

        {!loading && categories.length === 0 && (
          <p className="text-gray-500">No categories found</p>
        )}

        <div className="space-y-3">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="flex justify-between items-center p-4 border rounded-lg hover:shadow"
            >
              <div>
                <p className="font-semibold text-lg">{cat.name}</p>
                <p className="text-sm text-gray-500">
                  Type: {cat.type} | Services: {cat.serviceCount ?? 0}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(cat)}
                  className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(cat.id)}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
