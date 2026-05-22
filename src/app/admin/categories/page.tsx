"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRef } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  Layers3,
  Bell,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

interface Category {
  id: number;
  name: string;
  category_type: "SERVICE" | "PRODUCT";
}

export default function CategoriesPage() {

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState("");

  const [name, setName] =
    useState("");

  const [categoryType, setCategoryType] =
    useState<"SERVICE" | "PRODUCT">(
      "SERVICE"
    );

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [showNotifications, setShowNotifications] =
    useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const getHeaders = () => {

    const token =
      localStorage.getItem("accessToken");

    return token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {};
  };

  const fetchCategories = async () => {

    try {

      setLoading(true);

      const response = await axios.get(
        `${API_BASE}/admin/categories/all/`,
        {
          headers: getHeaders(),
        }
      );

      const mapped =
        response.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          category_type:
            cat.category_type || cat.type,
        }));

      const sorted = [...mapped].sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      );

      setCategories(sorted);

    } catch (err) {

      console.error(err);

      setError(
        "Failed to load categories"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleSubmit = async () => {

    if (!name.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess("");

    /*
      =========================
      DUPLICATE PREVENTION
      =========================
    */

    const exists = categories.some(
      (cat) =>
        cat.name.toLowerCase() ===
          name.trim().toLowerCase() &&
        cat.id !== editingId
    );

    if (exists) {

      setError(
        "Category already exists"
      );

      setLoading(false);

      return;
    }

    const optimisticCategory = {
      id: editingId || Date.now(),
      name: name.trim(),
      category_type: categoryType,
    };

    try {

      /*
        =========================
        OPTIMISTIC UI UPDATE
        =========================
      */

      if (editingId) {

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === editingId
              ? optimisticCategory
              : cat
          )
        );

      } else {

        setCategories((prev) => [
          optimisticCategory,
          ...prev,
        ]);
      }

      const payload = {
        name: name.trim(),
        category_type: categoryType,
      };

      /*
        =========================
        REAL API CALL
        =========================
      */

      if (editingId) {

        await axios.patch(
          `${API_BASE}/admin/categories/${editingId}/`,
          payload,
          {
            headers: getHeaders(),
          }
        );

        setSuccess(
          "Category updated successfully"
        );

      } else {

        await axios.post(
          `${API_BASE}/admin/categories/create/`,
          payload,
          {
            headers: getHeaders(),
          }
        );

        setSuccess(
          "Category created successfully"
        );
      }

      /*
        =========================
        RESET FORM
        =========================
      */

      setName("");
      setCategoryType("SERVICE");
      setEditingId(null);

      /*
        =========================
        REFRESH REAL DATA
        =========================
      */

      fetchCategories();

    } catch (err: any) {

      console.error(
        "CATEGORY SAVE ERROR:",
        err?.response?.data || err
      );

      setError(
        editingId
          ? "Failed to update category"
          : "Failed to create category"
      );

      /*
        =========================
        ROLLBACK
        =========================
      */

      fetchCategories();

    } finally {

      setLoading(false);
    }
  };

  const handleDelete = async (
    id: number
  ) => {

    const confirmed =
      window.confirm(
        "Delete this category?"
      );

    if (!confirmed) return;

    const oldCategories = [...categories];

    try {

      /*
        =========================
        OPTIMISTIC DELETE
        =========================
      */

      setCategories((prev) =>
        prev.filter(
          (cat) => cat.id !== id
        )
      );

      await axios.delete(
        `${API_BASE}/admin/categories/${id}/`,
        {
          headers: getHeaders(),
        }
      );

      setSuccess(
        "Category deleted successfully"
      );

    } catch (err) {

      console.error(err);

      setError(
        "Failed to delete category"
      );

      /*
        =========================
        ROLLBACK
        =========================
      */

      setCategories(oldCategories);
    }
  };

  const handleEdit = (
    category: Category
  ) => {

    setEditingId(category.id);

    setName(category.name);

    setCategoryType(
      category.category_type
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="p-6 bg-[#f7f8fc] min-h-screen">

      {/* ================= NAVBAR ================= */}

      <div className="w-full bg-white border border-slate-200 rounded-3xl px-6 py-5 flex items-center justify-between shadow-sm mb-8">

        <div>
          <h1 className="text-4xl font-bold text-slate-900">
            Categories
          </h1>

          <p className="text-slate-500 mt-2">
            Manage product and service
            categories
          </p>
        </div>

        <div className="flex items-center gap-4">

          {/* NOTIFICATION */}

          <div className="relative">

          <button
              onClick={() =>
                setShowNotifications(
                  !showNotifications
                )
              }
              className="relative w-12 h-12 rounded-2xl bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center"
            >

              <Bell className="w-5 h-5 text-slate-700" />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            </button>

            {showNotifications && (

              <div className="absolute right-0 top-16 w-[320px] bg-white border border-slate-200 rounded-3xl shadow-xl p-4 z-50">

                <div className="flex items-center justify-between mb-4">

                  <h3 className="font-bold text-slate-900">
                    Notifications
                  </h3>

                  <span className="text-xs text-slate-500">
                    Admin Alerts
                  </span>
                </div>

                <div className="flex flex-col gap-3">

                  <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-100">

                    <p className="text-sm font-semibold text-slate-900">
                      Categories Updated
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Manage service and product categories
                    </p>
                  </div>
                </div>
              </div>
              )}

          </div>

          {/* LOGOUT */}

          <button
            onClick={() => {

              localStorage.removeItem(
                "accessToken"
              );

              localStorage.removeItem(
                "refreshToken"
              );

              window.location.href =
                "/auth";
            }}
            className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold transition-all"
          >
            Logout
          </button>
        </div>
      </div>

      {/* ================= FORM ================= */}

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 mb-8">

        <div className="flex items-center gap-3 mb-6">

          <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
            <Layers3 />
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              {editingId
                ? "Edit Category"
                : "Create Category"}
            </h2>

            <p className="text-slate-500 mt-1">
              Add and manage platform
              categories
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* NAME */}

          <div>

            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Category Name
            </label>

            <input
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter category name"
              className="w-full px-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-400 text-black"
            />
          </div>

          {/* TYPE */}

          <div>

            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Category Type
            </label>

            <select
              value={categoryType}
              onChange={(e) =>
                setCategoryType(
                  e.target.value as any
                )
              }
              className="w-full px-4 py-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-cyan-400 text-black"
            >
              <option value="SERVICE">
                SERVICE
              </option>

              <option value="PRODUCT">
                PRODUCT
              </option>
            </select>
          </div>
        </div>

        {/* ERROR */}

        {error && (

          <div className="mt-5 bg-red-100 text-red-700 px-4 py-3 rounded-2xl">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (

          <div className="mt-5 bg-green-100 text-green-700 px-4 py-3 rounded-2xl">
            {success}
          </div>
        )}

        {/* BUTTONS */}

        <div className="flex gap-4 mt-6">

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`bg-cyan-600 hover:bg-cyan-700
            text-white px-6 py-4 rounded-2xl
            font-semibold transition-all
            flex items-center gap-2 ${
              loading
                ? "opacity-60 cursor-not-allowed"
                : ""
            }`}
          >

            <Plus size={18} />

            {editingId
              ? "Update Category"
              : "Create Category"}
          </button>

          {editingId && (

            <button
              onClick={() => {

                setEditingId(null);

                setName("");

                setCategoryType(
                  "SERVICE"
                );
              }}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-6 py-4 rounded-2xl font-semibold transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ================= EMPTY STATE ================= */}

      {categories.length === 0 &&
        !loading && (

        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">

          <h3 className="text-2xl font-bold text-slate-800">
            No Categories Found
          </h3>

          <p className="text-slate-500 mt-3">
            Create your first category
          </p>
        </div>
      )}

      {/* ================= LIST ================= */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

        {categories.map((category) => (

          <div
            key={category.id}
            className={`border-2 rounded-3xl p-6 shadow-sm hover:shadow-lg transition-all ${
              category.category_type ===
              "SERVICE"
                ? "bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-400"
                : "bg-gradient-to-br from-violet-50 to-violet-100 border-violet-400"
            }`}
          >

            <div className="flex items-center justify-between">

              <div
                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  category.category_type ===
                  "SERVICE"
                    ? "bg-cyan-600 text-white"
                    : "bg-violet-600 text-white"
                }`}
              >
                {category.category_type}
              </div>

              <Layers3 className="text-slate-700" />
            </div>

            <h3 className="text-2xl font-bold text-slate-900 mt-6">
              {category.name}
            </h3>

            <div className="flex gap-3 mt-6">

              <button
                onClick={() =>
                  handleEdit(category)
                }
                className="flex-1 bg-slate-900 hover:bg-black text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() =>
                  handleDelete(
                    category.id
                  )
                }
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}