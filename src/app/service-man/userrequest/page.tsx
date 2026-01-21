"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import { FiInfo } from "react-icons/fi";

interface CustomerRequest {
  id: number;
  name: string;
  phone: string;
  address: string;
  service: string;
  category: string;
  problem: string;
  distance: string;
  status: "Pending" | "Accepted" | "Rejected" | "Completed" | "Canceled";
}

export default function CustomerRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "SERVICEMAN") {
      router.replace("/service-man");
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      try {
        const dummyData: CustomerRequest[] = [
          {
            id: 1,
            name: "Ajay Sharma",
            phone: "9876543210",
            address: "123 MG Road, Baroda",
            service: "Electrical Service",
            category: "Electrical",
            problem: "Light not working",
            distance: "3 km",
            status: "Pending",
          },
          {
            id: 2,
            name: "Vinod Patel",
            phone: "9123456780",
            address: "45 Park Street, Baroda",
            service: "AC Repairing",
            category: "Appliance",
            problem: "AC not cooling",
            distance: "4 km",
            status: "Pending",
          },
        ];
        setRequests(dummyData);
      } catch (error) {
        console.error("Error fetching requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  const handleStatusChange = (id: number, status: CustomerRequest["status"]) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status } : req))
    );
  };

  if (loading) return <p className="p-6">Loading requests...</p>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Requests</h1>

      <div className="space-y-4">
        {requests.map((req) => (
          <div
            key={req.id}
            className="bg-white p-4 rounded-xl shadow flex justify-between items-center hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedRequest(req)}
          >
            <div>
              <p className="font-medium text-gray-800">{req.name}</p>
              <p className="text-sm text-gray-500">Distance: {req.distance}</p>
              <p className="text-sm text-gray-500">Service: {req.service}</p>
              <p className={`text-sm font-medium mt-1 ${
                req.status === "Accepted" || req.status === "Completed" ? "text-green-600" :
                req.status === "Rejected" || req.status === "Canceled" ? "text-red-600" : "text-yellow-600"
              }`}>
                Status: {req.status}
              </p>
            </div>
            <div className="flex gap-2">
              <select
                value={req.status}
                onChange={(e) => {
                  e.stopPropagation();
                  handleStatusChange(req.id, e.target.value as CustomerRequest["status"]);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Completed">Completed</option>
                <option value="Canceled">Canceled</option>
              </select>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedRequest(req);
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm flex items-center gap-1"
              >
                <FiInfo /> Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Details Modal */}
      {selectedRequest && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Request Details</h2>
            <p><span className="font-medium">Name:</span> {selectedRequest.name}</p>
            <p><span className="font-medium">Phone:</span> {selectedRequest.phone}</p>
            <p><span className="font-medium">Address:</span> {selectedRequest.address}</p>
            <p><span className="font-medium">Service:</span> {selectedRequest.service}</p>
            <p><span className="font-medium">Category:</span> {selectedRequest.category}</p>
            <p><span className="font-medium">Problem:</span> {selectedRequest.problem}</p>
            <p><span className="font-medium">Distance:</span> {selectedRequest.distance}</p>
            <p><span className="font-medium">Status:</span> {selectedRequest.status}</p>

            <button
              onClick={() => setSelectedRequest(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
