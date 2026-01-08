"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function VendorsPage() {
  const router = useRouter();
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vendors = [
    {
      name: "QuickFix Services",
      category: "AC Repair",
      activeOrders: 2,
      status: "BUSY",
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg", // Dummy photo
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
      profileImage: "https://randomuser.me/api/portraits/men/2.jpg", // Dummy photo
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
  ];

  const handleView = (vendor: any) => {
    setSelectedVendor(vendor);
    setIsModalOpen(true);
  };

  const handleFire = (name: string) => {
    alert(`Fired ${name}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-xl font-semibold">Vendors</h1>
        <p className="text-sm text-gray-500">
          Manage vendor availability and workload
        </p>
      </div>

      {/* Vendor List */}
      <div className="space-y-4">
        {vendors.map((v, i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl shadow flex justify-between items-center"
          >
            {/* Vendor Info */}
            <div>
              <p className="font-medium text-lg">{v.name}</p>
              <p className="text-sm text-gray-500">
                Category: {v.category}
              </p>

              {v.status === "BUSY" ? (
                <p className="text-sm mt-1">
                  📋 Active Orders:{" "}
                  <span className="font-medium">
                    {v.activeOrders}
                  </span>
                </p>
              ) : (
                <p className="text-sm mt-1 text-green-600">
                  🟢 Available
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <VendorStatusBadge status={v.status} />

              <button
                onClick={() => handleView(v)}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded cursor-pointer"
              >
                View
              </button>

              <button
                onClick={() => handleFire(v.name)}
                className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded cursor-pointer"
              >
                Fire
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Vendor Profile Modal */}
      {isModalOpen && selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold">Vendor Profile</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Image and Basic Info */}
              <div className="flex items-center space-x-4">
                <img
                  src={selectedVendor.profileImage}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-xl font-medium">{selectedVendor.ownerName}</h3>
                  <p className="text-gray-600">{selectedVendor.shopType}</p>
                </div>
              </div>

              {/* Business Details */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Business Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Shop Name:</strong> {selectedVendor.businessDetails.shopName}</p>
                    <p><strong>GST Number:</strong> {selectedVendor.businessDetails.gstNumber}</p>
                    <p><strong>Contact Number:</strong> {selectedVendor.businessDetails.contactNumber}</p>
                  </div>
                  <div>
                    <p><strong>Email:</strong> {selectedVendor.businessDetails.email}</p>
                    <p><strong>Store Timing:</strong> {selectedVendor.businessDetails.storeTiming}</p>
                    <p><strong>City / State:</strong> {selectedVendor.businessDetails.cityState}</p>
                  </div>
                </div>
                <p className="mt-2"><strong>Full Address:</strong> {selectedVendor.businessDetails.fullAddress}</p>
              </div>

              {/* Bank Details */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Bank Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p><strong>Account Holder Name:</strong> {selectedVendor.bankDetails.accountHolderName}</p>
                    <p><strong>Bank Name:</strong> {selectedVendor.bankDetails.bankName}</p>
                  </div>
                  <div>
                    <p><strong>Account Number:</strong> {selectedVendor.bankDetails.accountNumber}</p>
                    <p><strong>IFSC Code:</strong> {selectedVendor.bankDetails.ifscCode}</p>
                    <p><strong>UPI ID:</strong> {selectedVendor.bankDetails.upiId}</p>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h4 className="text-lg font-semibold mb-2">Documents</h4>
                <div className="space-y-2">
                  <p><strong>GST Certificate:</strong> <a href="#" className="text-blue-600">{selectedVendor.documents.gstCertificate}</a></p>
                  <p><strong>Store Registration:</strong> <a href="#" className="text-blue-600">{selectedVendor.documents.storeRegistration}</a></p>
                  <p><strong>ID Proof:</strong> <a href="#" className="text-blue-600">{selectedVendor.documents.idProof}</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Status Badge */
function VendorStatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        status === "BUSY"
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {status === "BUSY" ? "Busy" : "Available"}
    </span>
  );
}
