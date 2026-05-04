"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  description: string;
  category: number;
  image_url: string | null;
}

interface Category {
  id: number;
  name: string;
}

export default function ServicemanProductsPage() {
  const router = useRouter();
  const [products, setProducts]       = useState<Product[]>([]);
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [selectedCat, setSelectedCat] = useState<number | "all">("all");

  useEffect(() => {
    if (!localStorage.getItem("accessToken")) { router.replace("/service-man"); return; }
    Promise.all([fetchProducts(), fetchCategories()]).finally(() => setLoading(false));
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/api/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number } };
      if (e?.response?.status !== 403) console.error("Products fetch failed");
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/api/product-categories/");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Categories fetch failed"); }
  };

  const getCategoryName = (catId: number) =>
    categories.find(c => c.id === catId)?.name ?? "—";

  const filtered = products.filter(p => {
    const matchCat    = selectedCat === "all" || p.category === selectedCat;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Products</h1>
          <p className="text-gray-500 text-sm mt-0.5">Browse products available from nearby vendors</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 text-blue-800 text-sm font-medium max-w-sm">
          💡 To order for a booking, go to <strong>My Bookings → Active → Order Materials</strong>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
        <select
          value={selectedCat}
          onChange={e => setSelectedCat(e.target.value === "all" ? "all" : parseInt(e.target.value))}
          className="px-4 py-2.5 border border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-48"
        >
          <option value="all">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-sm text-gray-500 -mt-2">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span> product{filtered.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
          <p className="text-4xl mb-3">📦</p>
          <p className="font-bold text-gray-900">No products found</p>
          <p className="text-gray-500 text-sm mt-1">
            {products.length === 0
              ? "Products from vendors will appear here once available"
              : "Try adjusting your search or category filter"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 overflow-y-auto pb-4">
          {filtered.map(product => (
            <div
              key={product.id}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col"
            >
              {/* Image */}
              <div className="h-36 bg-gray-50 flex items-center justify-center border-b border-gray-100 flex-shrink-0">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="h-full w-full object-contain p-3"
                  />
                ) : (
                  <span className="text-4xl">🔩</span>
                )}
              </div>

              {/* Info */}
              <div className="p-3 flex flex-col gap-1.5 flex-1">
                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-gray-500 text-xs line-clamp-2">{product.description}</p>
                )}
                <div className="mt-auto pt-1.5 flex items-center justify-between gap-1 flex-wrap">
                  <span className="text-blue-700 font-bold text-sm">₹{product.price}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    product.stock_quantity > 0
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}>
                    {product.stock_quantity > 0 ? `${product.stock_quantity} left` : "Out"}
                  </span>
                </div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full w-fit">
                  {getCategoryName(product.category)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
