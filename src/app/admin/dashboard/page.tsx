"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import ApexCharts from "apexcharts";
import DataTable from "react-data-table-component";
import {
  FiSearch,
  FiBell,
  FiGrid,
  FiSettings,
  FiMoon,
  FiSun,
  FiMenu,
  FiEdit,
  FiTrash2,
} from "react-icons/fi";

/* ---------------- TYPES ---------------- */
interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  sold: number;
}

interface Request {
  id: number;
  customer: string;
  product: string;
  quantity: number;
  status: "pending" | "approved";
}

interface Vendor {
  id: number;
  name: string;
  email: string;
  products: Product[];
  requests: Request[];
}

/* ---------------- STATIC DATA ---------------- */
const dummyVendor: Vendor = {
  id: 1,
  name: "Dhruv Hardware",
  email: "dhruv@gmail.com",
  products: [
    { id: 1, name: "Hammer", price: 50, stock: 5, sold: 40 },
    { id: 2, name: "Drill", price: 150, stock: 8, sold: 25 },
    { id: 3, name: "Screwdriver", price: 15, stock: 20, sold: 60 },
  ],
  requests: [
    { id: 1, customer: "Rahul", product: "Hammer", quantity: 2, status: "pending" },
    { id: 2, customer: "Meena", product: "Drill", quantity: 1, status: "pending" },
    { id: 3, customer: "Kiran", product: "Screwdriver", quantity: 5, status: "approved" },
  ],
};

export default function VendorDashboardPage() {
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [isDark, setIsDark] = useState(false);
  const chartRef = useRef<ApexCharts | null>(null);

  /* ---------- Load Vendor Data ---------- */
  useEffect(() => {
    setVendor(dummyVendor);
  }, []);

  /* ---------- THEME ---------- */
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
    if (!isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  /* ---------- LOGOUT ---------- */
  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  /* ---------- MONTHLY TOTAL SALES CHART ---------- */
  useEffect(() => {
    if (!vendor) return;

    const options = {
      chart: { type: "line", height: 200, toolbar: { show: false } },
      series: [{ name: "Total Sold", data: vendor.products.map((p) => p.sold) }],
      xaxis: { categories: vendor.products.map((p) => p.name) },
      colors: ["#3b82f6"],
      dataLabels: { enabled: false },
      stroke: { curve: "smooth" },
      grid: { strokeDashArray: 4 },
    };

    const el = document.querySelector("#totalSalesChart");
    if (!el) return;

    chartRef.current = new ApexCharts(el, options);
    chartRef.current.render();

    return () => chartRef.current?.destroy();
  }, [vendor]);

  /* ---------- LOW STOCK TABLE ---------- */
  const lowStock = vendor?.products.filter((p) => p.stock <= 10) || [];
  const lowStockColumns = [
    { name: "Product", selector: (row: Product) => row.name },
    { name: "Price", selector: (row: Product) => `$${row.price}` },
    { name: "Stock", selector: (row: Product) => row.stock },
  ];

  /* ---------- NEW REQUESTS TABLE ---------- */
  const pendingRequests = vendor?.requests.filter((r) => r.status === "pending") || [];
  const requestColumns = [
    { name: "Customer", selector: (row: Request) => row.customer },
    { name: "Product", selector: (row: Request) => row.product },
    { name: "Qty", selector: (row: Request) => row.quantity },
    {
      name: "Actions",
      cell: (row: Request) => (
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-green-500 text-white rounded" onClick={() => alert(`Approve ${row.id}`)}>
            Approve
          </button>
          <button className="px-2 py-1 bg-red-500 text-white rounded" onClick={() => alert(`Reject ${row.id}`)}>
            Reject
          </button>
        </div>
      ),
    },
  ];

  if (!vendor) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 p-6">

      {/* ================= HEADER ================= */}
      <header className="flex items-center justify-between w-full bg-white dark:bg-gray-800 h-16 px-6 rounded-xl shadow border-b mb-6">
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
            <FiMenu className="text-xl text-gray-700 dark:text-gray-200" />
          </button>
          <span className="font-bold text-lg text-gray-800 dark:text-white">
            {vendor.name}
          </span>
        </div>

        <div className="hidden lg:flex relative w-80">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            placeholder="Search for products"
            className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <FiGrid className="text-gray-600 dark:text-gray-300" />
          <FiSettings className="text-gray-600 dark:text-gray-300" />
          <FiBell className="text-gray-600 dark:text-gray-300" />

          <button onClick={toggleDarkMode}>
            {isDark ? <FiSun className="text-yellow-400" /> : <FiMoon className="text-gray-600 dark:text-gray-300" />}
          </button>

          <img src="https://i.pravatar.cc/40?img=12" className="w-9 h-9 rounded-full" alt="profile" />

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* ================= TOTAL SALES CARD ================= */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-5 mb-6">
        <h6 className="font-semibold text-gray-800 dark:text-white mb-3">Monthly Total Sales</h6>
        <div id="totalSalesChart" />
      </div>

      {/* ================= GRID: LOW STOCK + NEW REQUESTS ================= */}
      <div className="grid grid-cols-12 gap-4">
        {/* LOW STOCK */}
        <div className="col-span-12 xl:col-span-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h6 className="font-semibold mb-4 text-gray-800 dark:text-white">Low Stock Products</h6>
          <DataTable
            columns={lowStockColumns}
            data={lowStock}
            pagination
            highlightOnHover
            responsive
            customStyles={{
              table: { style: { border: "1px solid #e5e7eb", borderRadius: "0.5rem" } },
              rows: { style: { borderBottom: "1px solid #e5e7eb" } },
            }}
            noDataComponent="No low stock products"
          />
        </div>

        {/* NEW REQUESTS */}
        <div className="col-span-12 xl:col-span-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          <h6 className="font-semibold mb-4 text-gray-800 dark:text-white">New Requests</h6>
          <DataTable
            columns={requestColumns}
            data={pendingRequests}
            pagination
            highlightOnHover
            responsive
            customStyles={{
              table: { style: { border: "1px solid #e5e7eb", borderRadius: "0.5rem" } },
              rows: { style: { borderBottom: "1px solid #e5e7eb" } },
            }}
            noDataComponent="No new requests"
          />
        </div>
      </div>
    </div>
  );
}
