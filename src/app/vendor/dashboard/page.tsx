"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/sidebar";
import ApexCharts from "apexcharts";
import DataTable from "react-data-table-component";
import api from "../../../lib/api";

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

export default function VendorDashboardPage() {
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- GET userId ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUserId(parsed.id);
    } else {
      setLoading(false);
    }
  }, []);

  /* ---------------- FETCH VENDOR DATA FROM API ---------------- */
  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    api
      .get(`/api/profile/vendor/${userId}`)
      .then((res) => {
        const { user, profile } = res.data.data;

        setVendor({
          id: user.id,
          name: profile.business_name || user.name,
          email: user.email,
          products: profile.products || [], // If backend sends products
          requests: profile.requests || [], // If backend sends requests
        });
      })
      .catch((err) => {
        console.error("Vendor dashboard API error:", err.response?.data || err.message);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  /* ---------------- ApexCharts: Total Selling per Product ---------------- */
  useEffect(() => {
    if (!vendor || typeof document === "undefined" || !vendor.products) return;

    const options = {
      chart: { type: "bar", height: 350 },
      series: [
        {
          name: "Units Sold",
          data: vendor.products.map((p) => p.sold),
        },
      ],
      xaxis: { categories: vendor.products.map((p) => p.name) },
      dataLabels: { enabled: true },
      colors: ["#1D4ED8"],
    };

    const chart = new ApexCharts(document.querySelector("#chart")!, options);
    chart.render();

    return () => chart.destroy();
  }, [vendor]);

  /* ---------------- Tables ---------------- */
  const lowStock = vendor?.products?.filter((p) => p.stock <= 10) || [];
  const pendingRequests = vendor?.requests?.filter((r) => r.status === "pending") || [];

  const lowStockColumns = [
    { name: "Product", selector: (row: Product) => row.name },
    { name: "Price", selector: (row: Product) => `$${row.price}` },
    { name: "Stock", selector: (row: Product) => row.stock },
  ];

  const requestsColumns = [
    { name: "Customer", selector: (row: Request) => row.customer },
    { name: "Product", selector: (row: Request) => row.product },
    { name: "Quantity", selector: (row: Request) => row.quantity },
    { name: "Status", selector: (row: Request) => row.status },
    {
      name: "Actions",
      cell: (row: Request) => (
        <div className="flex gap-2">
          <button
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
            onClick={() => alert(`Approve Request ${row.id}`)}
          >
            Approve
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => alert(`Reject Request ${row.id}`)}
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  if (loading) return <div className="p-10 text-lg font-semibold">Loading dashboard...</div>;
  if (!vendor) return <div className="p-10 text-red-600 font-semibold">No vendor data found</div>;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{vendor.name} Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{vendor.email}</span>
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
              {vendor.name.charAt(0)}
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 flex-1 overflow-auto">
          {/* ApexChart */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Total Selling</h2>
            <div id="chart" />
          </div>

          {/* Low Stock Table */}
          <div className="bg-white shadow rounded p-4 mb-6">
            <h2 className="text-xl font-semibold mb-4">Low Stock Products</h2>
            <DataTable
              columns={lowStockColumns}
              data={lowStock}
              pagination
              highlightOnHover
              striped
              noHeader
              customStyles={{
                header: { style: { display: "none" } },
                rows: { style: { borderBottom: "1px solid #e5e7eb" } },
                table: { style: { border: "1px solid #e5e7eb", borderRadius: "0.5rem" } },
              }}
              noDataComponent="No low stock products"
            />
          </div>

          {/* New Requests Table */}
          <div className="bg-white shadow rounded p-4">
            <h2 className="text-xl font-semibold mb-4">New Requests</h2>
            <DataTable
              columns={requestsColumns}
              data={pendingRequests}
              pagination
              highlightOnHover
              striped
              noHeader
              customStyles={{
                header: { style: { display: "none" } },
                rows: { style: { borderBottom: "1px solid #e5e7eb" } },
                table: { style: { border: "1px solid #e5e7eb", borderRadius: "0.5rem" } },
              }}
              noDataComponent="No pending requests"
            />
          </div>
        </main>
      </div>
    </div>
  );
}
