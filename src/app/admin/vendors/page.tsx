"use client";

import { useState } from "react";

interface Vendor {
  name: string;
  category: string;
  activeOrders: number;
  status: string;
  profileImage: string;
  ownerName: string;
  shopType: string;
  businessDetails: any;
  bankDetails: any;
  documents: any;
}

export default function VendorsPage() {
  const [vendors] = useState<Vendor[]>([
    {
      name: "QuickFix Services",
      category: "AC Repair",
      activeOrders: 2,
      status: "BUSY",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
      ownerName: "Raj Verma",
      shopType: "Hardware Store",
      businessDetails: {
        shopName: "QuickFix Hardware",
        gstNumber: "22AAAAA0000A1Z5",
        contactNumber: "+91 9876543210",
        email: "raj.verma@quickfix.com",
        storeTiming: "9 AM - 9 PM",
        cityState: "Mumbai, Maharashtra",
        fullAddress: "123 Main Street, Mumbai, Maharashtra, India - 400001",
      },
      bankDetails: {
        accountHolderName: "Raj Verma",
        bankName: "State Bank of India",
        accountNumber: "123456789012",
        ifscCode: "SBIN0001234",
        upiId: "raj.verma@upi",
      },
      documents: {
        gstCertificate: "GST_CERT_001.pdf",
        storeRegistration: "STORE_REG_001.pdf",
        idProof: "ID_PROOF_001.pdf",
      },
    },
    {
      name: "PlumbPro Solutions",
      category: "Plumbing",
      activeOrders: 0,
      status: "AVAILABLE",
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg",
      ownerName: "Amit Sharma",
      shopType: "Plumbing Services",
      businessDetails: {
        shopName: "PlumbPro Plumbing",
        gstNumber: "22BBBBB0000B2Y6",
        contactNumber: "+91 9876543211",
        email: "amit.sharma@plumbpro.com",
        storeTiming: "8 AM - 8 PM",
        cityState: "Delhi, Delhi",
        fullAddress: "456 Service Lane, Delhi, India - 110001",
      },
      bankDetails: {
        accountHolderName: "Amit Sharma",
        bankName: "HDFC Bank",
        accountNumber: "987654321098",
        ifscCode: "HDFC0005678",
        upiId: "amit.sharma@upi",
      },
      documents: {
        gstCertificate: "GST_CERT_002.pdf",
        storeRegistration: "STORE_REG_002.pdf",
        idProof: "ID_PROOF_002.pdf",
      },
    },
  ]);

  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const handleView = (vendor: Vendor) => setSelectedVendor(vendor);

  const handleClose = () => setSelectedVendor(null);

  const handleFire = (name: string) => alert(`Fired ${name}`);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Vendors Dashboard</h1>
        <p className="mt-2 text-gray-500">Manage vendor availability, workload, and details.</p>
      </div>

      {/* Vendor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((v, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300 relative border border-gray-100"
          >
            {/* Status Badge */}
            <VendorStatusBadge status={v.status} />

            {/* Vendor Info */}
            <div className="flex items-center gap-4 mb-4">
              <img
                src={v.profileImage}
                alt={v.name}
                className="w-16 h-16 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-lg font-semibold text-gray-900">{v.name}</p>
                <p className="text-gray-500">{v.category}</p>
                {v.status === "BUSY" ? (
                  <p className="text-gray-700 mt-1">
                    📋 <span className="font-medium">Active Orders: {v.activeOrders}</span>
                  </p>
                ) : (
                  <p className="text-green-600 font-medium mt-1">🟢 Available</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => handleView(v)}
                className="flex-1 py-2 px-4 text-white font-semibold bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-md"
              >
                View
              </button>
              <button
                onClick={() => handleFire(v.name)}
                className="flex-1 py-2 px-4 text-white font-semibold bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-md"
              >
                Fire
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{selectedVendor.name}</h2>
              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-700 font-bold text-xl"
              >
                ✕
              </button>
            </div>

            {/* Profile */}
            <div className="flex items-center gap-6 mb-6">
              <img
                src={selectedVendor.profileImage}
                alt={selectedVendor.name}
                className="w-24 h-24 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-xl font-semibold">{selectedVendor.ownerName}</p>
                <p className="text-gray-600">{selectedVendor.shopType}</p>
              </div>
            </div>

            {/* Business & Bank Details */}
            <div className="space-y-6">
              <Section title="Business Details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Shop Name:</strong> {selectedVendor.businessDetails.shopName}</p>
                    <p><strong>GST Number:</strong> {selectedVendor.businessDetails.gstNumber}</p>
                    <p><strong>Contact:</strong> {selectedVendor.businessDetails.contactNumber}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {selectedVendor.businessDetails.email}</p>
                    <p><strong>Store Timing:</strong> {selectedVendor.businessDetails.storeTiming}</p>
                    <p><strong>City/State:</strong> {selectedVendor.businessDetails.cityState}</p>
                  </div>
                </div>
                <p><strong>Full Address:</strong> {selectedVendor.businessDetails.fullAddress}</p>
              </Section>

              <Section title="Bank Details">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Account Holder:</strong> {selectedVendor.bankDetails.accountHolderName}</p>
                    <p><strong>Bank Name:</strong> {selectedVendor.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <p><strong>Account Number:</strong> {selectedVendor.bankDetails.accountNumber}</p>
                    <p><strong>IFSC:</strong> {selectedVendor.bankDetails.ifscCode}</p>
                    <p><strong>UPI ID:</strong> {selectedVendor.bankDetails.upiId}</p>
                  </div>
                </div>
              </Section>

              <Section title="Documents">
                <div className="space-y-2">
                  <p><strong>GST Certificate:</strong> <a href="#" className="text-blue-600">{selectedVendor.documents.gstCertificate}</a></p>
                  <p><strong>Store Registration:</strong> <a href="#" className="text-blue-600">{selectedVendor.documents.storeRegistration}</a></p>
                  <p><strong>ID Proof:</strong> <a href="#" className="text-blue-600">{selectedVendor.documents.idProof}</a></p>
                </div>
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Section Component for Modal */
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-lg font-semibold mb-2">{title}</h4>
    <div>{children}</div>
  </div>
);

/* Status Badge */
function VendorStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold ${
        status === "BUSY"
          ? "bg-yellow-200 text-yellow-800"
          : "bg-green-200 text-green-800"
      }`}
    >
      {status === "BUSY" ? "Busy" : "Available"}
    </span>
  );
}
