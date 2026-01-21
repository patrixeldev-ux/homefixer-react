"use client";

import React, { useState } from "react";
import Sidebar from "../components/sidebar";
import dynamic from "next/dynamic";
import { TableColumn } from "react-data-table-component";

// Make DataTable client-only to avoid hydration issues
const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

interface Order {
  id: number;
  customer: string;
  product: string;
  quantity: number;
  status: "Pending" | "Confirmed" | "Shipping" | "Delivered" | "New";
  payment: "Paid" | "COD" | "Unpaid";
  orderDate: string;
  deliveredDate: string;
  total: number;
  image: string;
}

// Dummy orders
const dummyOrders: Order[] = [
  { id: 14521, customer: "Ella Patel", product: "Denim Jacket", quantity: 1, status: "Delivered", payment: "Paid", orderDate: "15 Mar, 2022", deliveredDate: "21 Mar, 2022", total: 45.99, image: "/images/denim-jacket.png" },
  { id: 14522, customer: "Lucas Nguyen", product: "Leather Wallet", quantity: 1, status: "Pending", payment: "COD", orderDate: "02 Apr, 2022", deliveredDate: "09 Apr, 2022", total: 35.5, image: "/images/leather-wallet.png" },
  { id: 14523, customer: "Isabella Thomas", product: "Summer Dress", quantity: 2, status: "New", payment: "Unpaid", orderDate: "18 Jun, 2022", deliveredDate: "26 Jun, 2022", total: 28.75, image: "/images/summer-dress.png" },
];

export default function VendorOrdersPage() {
  const [orders] = useState<Order[]>(dummyOrders);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const columns: TableColumn<Order>[] = [
    { name: "Order ID", selector: (row: Order) => `PEO-${row.id}`, sortable: true },
    { name: "Customer", selector: (row: Order) => row.customer, sortable: true },
    { name: "Product", selector: (row: Order) => row.product, sortable: true },
    { name: "QTY", selector: (row: Order) => row.quantity, sortable: true },
    {
      name: "Payment",
      selector: (row: Order) => row.payment,
      cell: (row: Order) => (
        <span
          className={`px-2 py-1 rounded text-black text-sm ${
            row.payment === "Paid" ? "bg-green-500" : row.payment === "COD" ? "bg-gray-500" : "bg-red-500"
          }`}
        >
          {row.payment}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Order) => row.status,
      cell: (row: Order) => (
        <span
          className={`px-2 py-1 rounded text-black text-sm ${
            row.status === "Delivered"
              ? "bg-green-500"
              : row.status === "Pending"
              ? "bg-yellow-500"
              : row.status === "Shipping"
              ? "bg-purple-500"
              : "bg-blue-500"
          }`}
        >
          {row.status}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Order) => (
        <button
          className="bg-blue-500 text-black px-3 py-1 rounded hover:bg-blue-600 text-sm"
          onClick={() => setSelectedOrder(row)}
        >
          Overview
        </button>
      ),
    },
  ];

  // Custom styles for better bordered table UI
  const customStyles = {
    header: { style: { display: "none" } },
    table: { style: { border: "2px solid #e5e7eb", borderRadius: "0.5rem" } },
    rows: { style: { borderBottom: "1px solid #e5e7eb" } },
    headCells: {
      style: {
        fontWeight: "bold",
        fontSize: "14px",
        borderBottom: "2px solid #d1d5db",
        backgroundColor: "#f9fafb",
        color: "black",
      },
    },
    cells: {
      style: { padding: "12px", color: "black" },
    },
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        </header>
        <main className="p-6 flex-1 overflow-auto">
          <div className="bg-white shadow rounded p-6">
            <DataTable
              columns={columns as any}
              data={orders}
              pagination
              highlightOnHover
              striped
              customStyles={customStyles}
              noDataComponent="No orders found"
            />
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-[800px] p-10 relative">
            <button
              className="absolute top-4 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedOrder(null)}
            >
              ✕
            </button>

            <h2 className="text-xl font-bold mb-4">Order Details</h2>

            <div className="space-y-2 text-sm">
              <p><strong>Order ID:</strong> OrderPEO-{selectedOrder.id}</p>
              <p><strong>Customer:</strong> {selectedOrder.customer}</p>
              <p><strong>Items:</strong> {selectedOrder.product}</p>
              <p><strong>Order Date:</strong> {selectedOrder.orderDate}</p>
              <p><strong>Delivered Date:</strong> {selectedOrder.deliveredDate}</p>
              <p><strong>Payment Status:</strong> {selectedOrder.payment}</p>
              <p><strong>Order Status:</strong> {selectedOrder.status}</p>
              <p><strong>Product Quantity:</strong> {selectedOrder.quantity}</p>
              <p><strong>Total Amount:</strong> ${selectedOrder.total}</p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button className="text-red-500 hover:underline" onClick={() => setSelectedOrder(null)}>Cancel</button>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Edit Order</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
