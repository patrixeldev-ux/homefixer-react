"use client";

import React, { useMemo, useState, useEffect } from "react";

import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  User,
  MapPin,
} from "lucide-react";
import { useRouter } from "next/dist/client/components/navigation";

interface BookingType {
  id: string;
  bookingId: string;
  customer: string;
  serviceMan: string;
  service: string;
  amount: string;
  bookingTime: string;

  status:
    | "Pending"
    | "Confirmed"
    | "On Going"
    | "Completed"
    | "Cancelled";

  address: string;
  phone: string;
}

const CurrentBookings: React.FC = () => {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      const adminToken = localStorage.getItem("adminToken");
      
      if (!adminToken) {
        router.push("/admin/login");
      } else {
        setLoading(false);
      }
  
    }, [router]);
  
      if (loading) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
          <div className="text-2xl font-bold text-blue-600">
            Loading...
          </div>
        </div>
      );
    }
  

  const [search, setSearch] =
    useState<string>("");

  const [statusFilter, setStatusFilter] =
    useState<string>("All");

  const [currentPage, setCurrentPage] =
    useState<number>(1);

  const [selectedBooking, setSelectedBooking] =
    useState<BookingType | null>(null);

  const bookingsPerPage = 10;

  const allBookings: BookingType[] =
    Array.from({ length: 30 }, (_, index) => ({
      id: `${index + 1}`,

      bookingId: `#HF${1 + index}`,

      customer:
        index % 2 === 0
          ? "Rahul Sharma"
          : "Anjali Patel",

      serviceMan:
        index % 2 === 0
          ? "Ramesh Kumar"
          : "Suresh Mehta",

      service:
        index % 4 === 0
          ? "AC Repair"
          : index % 4 === 1
          ? "Plumbing"
          : index % 4 === 2
          ? "Electric Repair"
          : "Washing Machine Repair",

      amount: `₹${1500 + index * 200}`,

      bookingTime:
        index === 0
          ? "Current Booking"
          : `${index} day ago`,

      status:
        index % 5 === 0
          ? "Pending"
          : index % 5 === 1
          ? "Confirmed"
          : index % 5 === 2
          ? "On Going"
          : index % 5 === 3
          ? "Completed"
          : "Cancelled",

      address:
        index % 2 === 0
          ? "Ahmedabad, Gujarat"
          : "Vadodara, Gujarat",

      phone: "+91 9876543210",
    }));

  const filteredBookings = useMemo(() => {
    return allBookings.filter((booking) => {
      const matchesSearch =
        booking.customer
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        booking.service
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        booking.bookingId
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        booking.status === statusFilter;

      return (
        matchesSearch && matchesStatus
      );
    });
  }, [search, statusFilter]);


  const totalPages = Math.ceil(
    filteredBookings.length / bookingsPerPage
  );

  const startIndex =
    (currentPage - 1) * bookingsPerPage;

  const currentBookings =
    filteredBookings.slice(
      startIndex,
      startIndex + bookingsPerPage
    );


  const getStatusStyle = (
    status: string
  ) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";

      case "Confirmed":
        return "bg-blue-100 text-blue-700";

      case "On Going":
        return "bg-orange-100 text-orange-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Current Bookings
            </h1>

            <p className="text-gray-500 mt-1">
              Manage all customer bookings
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-3">

            <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-3 min-w-[260px]">
              <Search 
                size={18}
                className="text-gray-500"
              />

              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                className="ml-3 w-full bg-transparent outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>

            {/* FILTER */}

            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
              <Filter
                size={18}
                className="text-gray-400 mr-2"
              />

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none text-gray-700 font-medium"
              >
                <option value="All">
                  All Status
                </option>

                <option value="Pending">
                  Pending
                </option>

                <option value="Confirmed">
                  Confirmed
                </option>

                <option value="On Going">
                  On Going
                </option>

                <option value="Visiting">
                  Visiting
                </option>

                <option value="Visiting + Service">
                  Visiting + Service
                </option>

                <option value="Completed">
                  Completed
                </option>

                <option value="Cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>


      <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* TABLE HEADER */}

        <div className="hidden lg:grid grid-cols-7 gap-4 bg-gray-100 px-6 py-4 text-sm font-bold text-gray-600 border-b border-gray-200">
          <p>Booking ID</p>

          <p>Customer</p>

          <p>Service</p>

          <p>Service Man</p>

          <p>Amount</p>

          <p>Status</p>

          <p>Booking</p>
        </div>


        {currentBookings.map((booking) => (
          <div
            key={booking.id}
            onClick={() =>
              setSelectedBooking(booking)
            }
            className="grid grid-cols-1 lg:grid-cols-7 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-all cursor-pointer"
          >

            <div>
              <h3 className="font-bold text-blue-600">
                {booking.bookingId}
              </h3>
            </div>

            {/* CUSTOMER */}

            <div>
              <h3 className="font-semibold text-gray-800">
                {booking.customer}
              </h3>

              <p className="text-xs text-gray-400 mt-1">
                {booking.phone}
              </p>
            </div>

            {/* SERVICE */}

            <div>
              <h3 className="font-semibold text-gray-700">
                {booking.service}
              </h3>
            </div>

            {/* SERVICE MAN */}

            <div>
              <h3 className="font-semibold text-gray-700">
                {booking.serviceMan}
              </h3>
            </div>

            {/* AMOUNT */}

            <div>
              <h3 className="font-bold text-green-600">
                {booking.amount}
              </h3>
            </div>

            {/* STATUS */}

            <div>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold ${getStatusStyle(
                  booking.status
                )}`}
              >
                {booking.status}
              </span>
            </div>

            {/* CURRENT BOOKING */}

            <div>
              <span className="text-sm text-gray-500 font-medium">
                {booking.bookingTime}
              </span>
            </div>
          </div>
        ))}

        {/* EMPTY */}

        {currentBookings.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-lg">
              No bookings found
            </p>
          </div>
        )}
      </div>


      {filteredBookings.length > 0 && (
        <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <p className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold">
              {Math.min(
                startIndex +
                  bookingsPerPage,
                filteredBookings.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-bold">
              {filteredBookings.length}
            </span>{" "}
            bookings
          </p>


          <div className="flex items-center gap-2 flex-wrap">
            {/* PREVIOUS */}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
              disabled={currentPage === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              <ChevronLeft size={18} />
              Previous
            </button>

            {/* PAGE BUTTONS */}

            {Array.from(
              { length: totalPages },
              (_, index) => (
                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(index + 1)
                  }
                  className={`w-10 h-10 rounded-xl font-bold transition-all ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {index + 1}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
              disabled={
                currentPage === totalPages
              }
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white"
            >
              Next
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL ================= */}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5">
          <div className="bg-white w-full max-w-3xl rounded-3xl p-8 relative">
            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedBooking(null)
              }
              className="absolute top-5 right-5 bg-gray-100 hover:bg-gray-200 w-10 h-10 rounded-xl transition-all"
            >
              ✕
            </button>

            {/* TITLE */}

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                Booking Details
              </h2>

              <p className="text-gray-500 mt-1">
                Complete booking information
              </p>
            </div>

            {/* DETAILS */}

            <div className="grid md:grid-cols-2 gap-5">
              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-400">
                  Customer
                </p>

                <h3 className="font-bold text-lg mt-1">
                  {
                    selectedBooking.customer
                  }
                </h3>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-400">
                  Service
                </p>

                <h3 className="font-bold text-lg mt-1">
                  {
                    selectedBooking.service
                  }
                </h3>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-400">
                  Service Man
                </p>

                <h3 className="font-bold text-lg mt-1">
                  {
                    selectedBooking.serviceMan
                  }
                </h3>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5">
                <p className="text-sm text-gray-400">
                  Amount
                </p>

                <h3 className="font-bold text-green-600 text-lg mt-1">
                  {
                    selectedBooking.amount
                  }
                </h3>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 md:col-span-2">
                <p className="text-sm text-gray-400">
                  Address
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <MapPin
                    size={18}
                    className="text-gray-500"
                  />

                  <h3 className="font-semibold text-gray-700">
                    {
                      selectedBooking.address
                    }
                  </h3>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 md:col-span-2">
                <p className="text-sm text-gray-400">
                  Contact
                </p>

                <div className="flex items-center gap-2 mt-2">
                  <Phone
                    size={18}
                    className="text-gray-500"
                  />

                  <h3 className="font-semibold text-gray-700">
                    {
                      selectedBooking.phone
                    }
                  </h3>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-5 md:col-span-2">
                <p className="text-sm text-gray-400">
                  Booking Status
                </p>

                <div className="mt-3">
                  <span
                    className={`px-4 py-2 rounded-xl text-sm font-bold ${getStatusStyle(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentBookings;