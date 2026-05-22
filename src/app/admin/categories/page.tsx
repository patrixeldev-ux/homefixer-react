"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import axios from "axios";

import {
  Plus,
  Search,
  Loader2,
  Trash2,
  Pencil,
  Package,
  Wrench,
  X,
  Bell,
} from "lucide-react";

import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

interface Category {
  id: number;

  name: string;

  category_type:
    | "SERVICE"
    | "PRODUCT";
}

interface NotificationItem {
  id: string;

  title: string;

  message: string;

  read: boolean;
}

const CategoriesPage = () => {

  const router = useRouter();

  /*
    =====================================
    STATES
    =====================================
  */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [search, setSearch] =
    useState("");

  const [filterType, setFilterType] =
    useState<
      "ALL" | "SERVICE" | "PRODUCT"
    >("ALL");

  const [showModal, setShowModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState<Category | null>(
      null
    );

  const [formData, setFormData] =
    useState<{
      name: string;

      category_type:
        | "SERVICE"
        | "PRODUCT";
    }>({
      name: "",

      category_type:
        "SERVICE",
    });

  /*
    =====================================
    NOTIFICATIONS
    =====================================
  */

  const [showNotifications, setShowNotifications] =
    useState(false);

  const [notifications, setNotifications] =
    useState<
      NotificationItem[]
    >([]);

  /*
    =====================================
    AUTH
    =====================================
  */

  useEffect(() => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    if (!token) {

      router.push("/auth");

      return;
    }

    fetchCategories();

  }, []);

  /*
    =====================================
    HEADERS
    =====================================
  */

  const getHeaders = () => {

    const token =
      localStorage.getItem(
        "accessToken"
      );

    return token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {};
  };

  /*
    =====================================
    FETCH CATEGORIES
    =====================================
  */

  const fetchCategories =
    async () => {

      try {

        setLoading(true);

        const response =
          await axios.get(

            `${API_BASE}/admin/categories/all/`,

            {
              headers:
                getHeaders(),
            }
          );

        const mappedCategories: Category[] =
          response.data.map(
            (cat: any) => ({

              id: cat.id,

              name:
                cat.name ||
                "Unnamed Category",

              category_type:
                (
                  cat.category_type ||
                  "SERVICE"
                ) as
                  | "SERVICE"
                  | "PRODUCT",
            })
          );

        mappedCategories.sort(
          (
            a: Category,
            b: Category
          ) => {

            if (
              a.category_type ===
                "SERVICE" &&
              b.category_type ===
                "PRODUCT"
            )
              return -1;

            if (
              a.category_type ===
                "PRODUCT" &&
              b.category_type ===
                "SERVICE"
            )
              return 1;

            return a.name.localeCompare(
              b.name
            );
          }
        );

        setCategories(
          mappedCategories
        );

      } catch (err) {

        console.error(
          "FETCH CATEGORIES ERROR:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /*
    =====================================
    FILTERED CATEGORIES
    =====================================
  */

  const filteredCategories =
    useMemo(() => {

      return categories.filter(
        (category) => {

          const matchesSearch =
            category.name
              .toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesType =
            filterType === "ALL"

              ? true

              : category.category_type ===
                filterType;

          return (
            matchesSearch &&
            matchesType
          );
        }
      );

    }, [
      categories,
      search,
      filterType,
    ]);

  /*
    =====================================
    OPEN CREATE
    =====================================
  */

  const openCreateModal =
    () => {

      setEditingCategory(null);

      setFormData({
        name: "",

        category_type:
          "SERVICE",
      });

      setShowModal(true);
    };

  /*
    =====================================
    OPEN EDIT
    =====================================
  */

  const openEditModal = (
    category: Category
  ) => {

    setEditingCategory(
      category
    );

    setFormData({
      name: category.name,

      category_type:
        category.category_type,
    });

    setShowModal(true);
  };

  /*
    =====================================
    SAVE CATEGORY
    =====================================
  */

  const handleSave =
    async () => {

      try {

        setSaving(true);

        const payload: {
          name: string;

          category_type:
            | "SERVICE"
            | "PRODUCT";
        } = {
          name: formData.name,

          category_type:
            formData.category_type as
              | "SERVICE"
              | "PRODUCT",
        };

        /*
          =========================
          UPDATE
          =========================
        */

        if (
          editingCategory
        ) {

          await axios.patch(

            `${API_BASE}/admin/categories/${editingCategory.id}/`,

            payload,

            {
              headers:
                getHeaders(),
            }
          );

          setCategories(
            (
              prev: Category[]
            ) =>
              prev.map(
                (cat) =>
                  cat.id ===
                  editingCategory.id
                    ? {
                        ...cat,

                        ...payload,
                      }
                    : cat
              )
          );
        }

        /*
          =========================
          CREATE
          =========================
        */

        else {

          const response =
            await axios.post(

              `${API_BASE}/admin/categories/create/`,

              payload,

              {
                headers:
                  getHeaders(),
              }
            );

          const newCategory: Category = {
            id:
              response.data.id,

            name:
              response.data.name,

            category_type:
              response.data
                .category_type as
                  | "SERVICE"
                  | "PRODUCT",
          };

          setCategories(
            (
              prev: Category[]
            ) => [
              newCategory,
              ...prev,
            ]
          );
        }

        /*
          =========================
          NOTIFICATION
          =========================
        */

        setNotifications(
          (prev) => [

            {
              id:
                Date.now().toString(),

              title:
                editingCategory
                  ? "Category Updated"
                  : "Category Created",

              message:
                `${formData.name} saved successfully`,

              read: false,
            },

            ...prev,
          ]
        );

        setShowModal(false);

      } catch (err) {

        console.error(
          "SAVE CATEGORY ERROR:",
          err
        );

      } finally {

        setSaving(false);
      }
    };

  /*
    =====================================
    DELETE CATEGORY
    =====================================
  */

  const handleDelete =
    async (id: number) => {

      try {

        await axios.delete(

          `${API_BASE}/admin/categories/${id}/`,

          {
            headers:
              getHeaders(),
          }
        );

        setCategories(
          (
            prev: Category[]
          ) =>
            prev.filter(
              (cat) =>
                cat.id !== id
            )
        );

      } catch (err) {

        console.error(
          "DELETE CATEGORY ERROR:",
          err
        );
      }
    };

  /*
    =====================================
    NOTIFICATIONS
    =====================================
  */

  const markAllRead =
    () => {

      setNotifications(
        (prev) =>
          prev.map((n) => ({
            ...n,
            read: true,
          }))
      );
    };

  /*
    =====================================
    LOADING
    =====================================
  */

  if (loading) {

    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">

        <div className="flex flex-col items-center gap-4">

          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />

          <p className="text-black font-medium">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">

      {/* ================= HEADER ================= */}

      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          {/* LEFT */}

          <div>

            <h1 className="text-4xl font-bold text-black">
              Categories
            </h1>

            <p className="text-neutral-500 mt-2">
              Manage service and product categories
            </p>
          </div>

          {/* RIGHT */}

          <div className="flex flex-wrap items-center gap-3">

            {/* SEARCH */}

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 min-w-[260px]">

              <Search
                size={18}
                className="text-black"
              />

              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="ml-3 w-full bg-transparent outline-none text-black placeholder:text-neutral-400"
              />
            </div>

            {/* FILTERS */}

            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl p-1">

              <button
                onClick={() =>
                  setFilterType(
                    "ALL"
                  )
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterType ===
                  "ALL"
                    ? "bg-black text-white"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                All
              </button>

              <button
                onClick={() =>
                  setFilterType(
                    "SERVICE"
                  )
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterType ===
                  "SERVICE"
                    ? "bg-blue-600 text-white"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                Services
              </button>

              <button
                onClick={() =>
                  setFilterType(
                    "PRODUCT"
                  )
                }
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                  filterType ===
                  "PRODUCT"
                    ? "bg-orange-500 text-white"
                    : "text-black hover:bg-slate-100"
                }`}
              >
                Products
              </button>
            </div>

            {/* ADD */}

            <button
              onClick={
                openCreateModal
              }
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
            >

              <Plus size={18} />

              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* ================= GRID ================= */}

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {filteredCategories.map(
          (category) => (

            <div
              key={category.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
            >

              <div className="flex items-start justify-between">

                <div>

                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      category.category_type ===
                      "SERVICE"
                        ? "bg-blue-100"
                        : "bg-orange-100"
                    }`}
                  >

                    {category.category_type ===
                    "SERVICE" ? (

                      <Wrench className="text-blue-700" />

                    ) : (

                      <Package className="text-orange-700" />
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-black mt-5">
                    {category.name}
                  </h2>

                  <span
                    className={`inline-flex mt-3 px-3 py-1 rounded-xl text-xs font-bold ${
                      category.category_type ===
                      "SERVICE"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >

                    {
                      category.category_type
                    }
                  </span>
                </div>

                {/* ACTIONS */}

                <div className="flex items-center gap-2">

                  <button
                    onClick={() =>
                      openEditModal(
                        category
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 flex items-center justify-center"
                  >

                    <Pencil className="w-4 h-4 text-blue-700" />
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(
                        category.id
                      )
                    }
                    className="w-10 h-10 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center"
                  >

                    <Trash2 className="w-4 h-4 text-red-700" />
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* EMPTY */}

      {filteredCategories.length ===
        0 && (

        <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-16 text-center">

          <p className="text-black text-lg font-semibold">
            No categories found
          </p>

          <p className="text-neutral-500 mt-2">
            Try changing search or filter
          </p>
        </div>
      )}

      {/* ================= MODAL ================= */}

      {showModal && (

        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">

          <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative shadow-2xl">

            <button
              onClick={() =>
                setShowModal(false)
              }
              className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
            >

              <X className="w-5 h-5 text-black" />
            </button>

            {/* TITLE */}

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-black">
                {editingCategory
                  ? "Edit Category"
                  : "Add Category"}
              </h2>

              <p className="text-neutral-500 mt-2">
                Manage service and product categories
              </p>
            </div>

            {/* FORM */}

            <div className="space-y-5">

              {/* NAME */}

              <div>

                <label className="block text-sm font-semibold text-black mb-2">
                  Category Name
                </label>

                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,

                      name:
                        e.target.value,
                    })
                  }
                  placeholder="Enter category name"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-black placeholder:text-neutral-400"
                />
              </div>

              {/* TYPE */}

              <div>

                <label className="block text-sm font-semibold text-black mb-2">
                  Category Type
                </label>

                <select
                  value={
                    formData.category_type
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,

                      category_type:
                        e.target
                          .value as
                          | "SERVICE"
                          | "PRODUCT",
                    })
                  }
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 outline-none text-black"
                >

                  <option value="SERVICE">
                    SERVICE
                  </option>

                  <option value="PRODUCT">
                    PRODUCT
                  </option>
                </select>
              </div>

              {/* SAVE */}

              <button
                disabled={
                  saving
                }
                onClick={
                  handleSave
                }
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50"
              >

                {saving
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;