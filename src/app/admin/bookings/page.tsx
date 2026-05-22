"use client";

import React, {
  useMemo,
  useState,
  useEffect,
} from "react";

import axios from "axios";

import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Phone,
  MapPin,
  Calendar,
  IndianRupee,
  User,
  Wrench,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://home-fixer-production.up.railway.app/api";

interface BookingType {
  id: number;

  bookingId: string;

  customer: string;

  serviceMan: string;

  service: string;

  amount: string;

  bookingTime: string;

  status: string;

  address: string;

  phone: string;

  createdAt?: string;
}

const BookingsPage: React.FC = () => {

  const router = useRouter();

  const [loading, setLoading] =
    useState(true);

  const [bookings, setBookings] =
    useState<BookingType[]>([]);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [selectedBooking, setSelectedBooking] =
    useState<BookingType | null>(
      null
    );

  const bookingsPerPage = 10;

  /*
    =====================================
    AUTH CHECK
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

    fetchBookings();

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
    FETCH BOOKINGS
    =====================================
  */

  const fetchBookings =
    async () => {

      try {

        setLoading(true);

        const response =
          await axios.get(

            `${API_BASE}/admin/bookings/all/`,

            {
              headers:
                getHeaders(),
            }
          );

        /*
          =========================
          MAP REAL API DATA
          =========================
        */

        const mapped =
          response.data.map(
            (booking: any) => ({

              id: booking.id,

              bookingId:
                `#HF${booking.id}`,

              customer:
                booking.customer_name ||
                booking.customer
                  ?.name ||
                "Unknown Customer",

              serviceMan:
                booking
                  .serviceman_name ||
                booking
                  .serviceman
                  ?.name ||
                "Not Assigned",

              service:
                booking.service_name ||
                booking.service ||
                "Service",

              amount:
                `₹${
                  booking.total_amount ||
                  booking.amount ||
                  0
                }`,

              bookingTime:
                booking.created_at
                  ? new Date(
                      booking.created_at
                    ).toLocaleDateString()
                  : "N/A",

              status: booking.status
                ? booking.status
                    .toString()
                    .trim()
                    .toLowerCase()
                : "pending",

              address:
                booking.address ||
                "No address provided",

              phone:
                booking.phone ||
                booking.customer
                  ?.phone ||
                "No phone",

              createdAt:
                booking.created_at,
            })
          );

        /*
          =========================
          SORT NEWEST FIRST
          =========================
        */

        mapped.sort(
          (
            a: BookingType,
            b: BookingType
          ) =>
            new Date(
              b.createdAt || ""
            ).getTime() -
            new Date(
              a.createdAt || ""
            ).getTime()
        );

        setBookings(mapped);

      } catch (err) {

        console.error(
          "BOOKINGS FETCH ERROR:",
          err
        );

      } finally {

        setLoading(false);
      }
    };

  /*
    =====================================
    FILTERED BOOKINGS
    =====================================
  */

  const filteredBookings =
    useMemo(() => {

      return bookings.filter(
        (booking) => {

          const searchText = `
            ${booking.customer}
            ${booking.service}
            ${booking.bookingId}
            ${booking.serviceMan}
          `.toLowerCase();

          const matchesSearch =
            searchText.includes(
              search.toLowerCase()
            );

          const matchesStatus =
            statusFilter === "All"

              ? true

              : booking.status
                  .toLowerCase()
                  .trim() ===
                statusFilter
                  .toLowerCase()
                  .trim();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );

    }, [
      bookings,
      search,
      statusFilter,
    ]);

  /*
    =====================================
    PAGINATION
    =====================================
  */

  const totalPages =
    Math.ceil(
      filteredBookings.length /
        bookingsPerPage
    );

  const startIndex =
    (currentPage - 1) *
    bookingsPerPage;

  const currentBookings =
    filteredBookings.slice(
      startIndex,
      startIndex +
        bookingsPerPage
    );

  /*
    =====================================
    STATUS COLORS
    =====================================
  */

  const getStatusStyle = (
    status: string
  ) => {

    switch (
      status
        .toLowerCase()
        .trim()
    ) {

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "confirmed":
        return "bg-blue-100 text-blue-700";

      case "on going":
        return "bg-orange-100 text-orange-700";

      case "completed":
        return "bg-green-100 text-green-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  /*
    =====================================
    FORMAT STATUS
    =====================================
  */

  const formatStatus = (
    status: string
  ) => {

    return status
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
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

          <p className="text-slate-600 font-medium">
            Loading bookings...
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

          <div>

            <h1 className="text-4xl font-bold text-slate-900">
              Bookings
            </h1>

            <p className="text-slate-500 mt-2">
              Manage all customer
              service bookings
            </p>
          </div>

          {/* SEARCH + FILTER */}

          <div className="flex flex-col lg:flex-row gap-3">

            {/* SEARCH */}

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3 min-w-[280px]">

              <Search
                size={18}
                className="text-slate-400"
              />

              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                className="ml-3 w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
              />
            </div>

            {/* FILTER */}

            <div className="flex items-center bg-white border border-slate-200 rounded-2xl px-4 py-3">

              <Filter
                size={18}
                className="text-slate-400 mr-2"
              />

              <select
                value={
                  statusFilter
                }
                onChange={(e) => {

                  setStatusFilter(
                    e.target.value
                  );

                  setCurrentPage(1);
                }}
                className="bg-transparent outline-none text-slate-700 font-medium"
              >

                <option value="All">
                  All Status
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="on going">
                  On Going
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TABLE ================= */}

      <div className="mt-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">

        {/* TABLE HEADER */}

        <div className="hidden lg:grid grid-cols-7 gap-4 bg-slate-50 px-6 py-4 text-sm font-bold text-slate-600 border-b border-slate-200">

          <p>Booking ID</p>

          <p>Customer</p>

          <p>Service</p>

          <p>Serviceman</p>

          <p>Amount</p>

          <p>Status</p>

          <p>Date</p>
        </div>

        {/* BOOKINGS */}

        {currentBookings.map(
          (booking) => (

            <div
              key={booking.id}
              onClick={() =>
                setSelectedBooking(
                  booking
                )
              }
              className="grid grid-cols-1 lg:grid-cols-7 gap-4 px-6 py-5 border-b border-slate-100 hover:bg-slate-50 transition-all cursor-pointer"
            >

              {/* BOOKING ID */}

              <div>

                <h3 className="font-bold text-blue-600">
                  {
                    booking.bookingId
                  }
                </h3>
              </div>

              {/* CUSTOMER */}

              <div>

                <h3 className="font-semibold text-slate-800">
                  {
                    booking.customer
                  }
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  {booking.phone}
                </p>
              </div>

              {/* SERVICE */}

              <div>

                <h3 className="font-semibold text-slate-700">
                  {
                    booking.service
                  }
                </h3>
              </div>

              {/* SERVICEMAN */}

              <div>

                <h3 className="font-semibold text-slate-700">
                  {
                    booking.serviceMan
                  }
                </h3>
              </div>

              {/* AMOUNT */}

              <div>

                <h3 className="font-bold text-green-600">
                  {
                    booking.amount
                  }
                </h3>
              </div>

              {/* STATUS */}

              <div>

                <span
                  className={`px-3 py-1 rounded-xl text-xs font-bold ${getStatusStyle(
                    booking.status
                  )}`}
                >

                  {formatStatus(
                    booking.status
                  )}
                </span>
              </div>

              {/* DATE */}

              <div>

                <span className="text-sm text-slate-500 font-medium">
                  {
                    booking.bookingTime
                  }
                </span>
              </div>
            </div>
          )
        )}

        {/* EMPTY */}

        {currentBookings.length ===
          0 && (

          <div className="py-20 text-center">

            <p className="text-slate-400 text-lg">
              No bookings found
            </p>
          </div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}

      {filteredBookings.length >
        0 && (

        <div className="mt-6 bg-white border border-slate-200 rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

          <p className="text-sm text-slate-500">

            Showing{" "}

            <span className="font-bold">
              {startIndex + 1}
            </span>

            {" "}to{" "}

            <span className="font-bold">

              {Math.min(
                startIndex +
                  bookingsPerPage,

                filteredBookings.length
              )}
            </span>

            {" "}of{" "}

            <span className="font-bold">
              {
                filteredBookings.length
              }
            </span>

            {" "}bookings
          </p>

          {/* PAGINATION */}

          <div className="flex items-center gap-2 flex-wrap">

            {/* PREVIOUS */}

            <button
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.max(
                      prev - 1,
                      1
                    )
                )
              }
              disabled={
                currentPage === 1
              }
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50"
            >

              <ChevronLeft size={18} />

              Previous
            </button>

            {/* PAGE NUMBERS */}

            {Array.from(
              {
                length: totalPages,
              },

              (_, index) => (

                <button
                  key={index}
                  onClick={() =>
                    setCurrentPage(
                      index + 1
                    )
                  }
                  className={`w-10 h-10 rounded-2xl font-bold transition-all ${
                    currentPage ===
                    index + 1
                      ? "bg-blue-600 text-white"

                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >

                  {index + 1}
                </button>
              )
            )}

            {/* NEXT */}

            <button
              onClick={() =>
                setCurrentPage(
                  (prev) =>
                    Math.min(
                      prev + 1,
                      totalPages
                    )
                )
              }
              disabled={
                currentPage ===
                totalPages
              }
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white disabled:opacity-50"
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

          <div className="bg-white w-full max-w-4xl rounded-3xl p-8 relative shadow-2xl">

            {/* CLOSE */}

            <button
              onClick={() =>
                setSelectedBooking(
                  null
                )
              }
              className="absolute top-5 right-5 bg-slate-100 hover:bg-slate-200 w-10 h-10 rounded-xl transition-all"
            >
              ✕
            </button>

            {/* TITLE */}

            <div className="mb-8">

              <h2 className="text-3xl font-bold text-slate-900">
                Booking Details
              </h2>

              <p className="text-slate-500 mt-2">
                Complete booking information
              </p>
            </div>

            {/* DETAILS */}

            <div className="grid md:grid-cols-2 gap-5">

              {/* CUSTOMER */}

              <div className="bg-slate-50 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-slate-400 text-sm">

                  <User size={16} />

                  Customer
                </div>

                <h3 className="font-bold text-lg mt-3 text-slate-900">
                  {
                    selectedBooking.customer
                  }
                </h3>
              </div>

              {/* SERVICE */}

              <div className="bg-slate-50 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-slate-400 text-sm">

                  <Wrench size={16} />

                  Service
                </div>

                <h3 className="font-bold text-lg mt-3 text-slate-900">
                  {
                    selectedBooking.service
                  }
                </h3>
              </div>

              {/* SERVICEMAN */}

              <div className="bg-slate-50 rounded-3xl p-5">

                <p className="text-sm text-slate-400">
                  Serviceman
                </p>

                <h3 className="font-bold text-lg mt-3 text-slate-900">
                  {
                    selectedBooking.serviceMan
                  }
                </h3>
              </div>

              {/* AMOUNT */}

              <div className="bg-slate-50 rounded-3xl p-5">

                <div className="flex items-center gap-2 text-slate-400 text-sm">

                  <Calendar size={16} />

                  Amount
                </div>

                <h3 className="font-bold text-green-600 text-xl mt-3">
                  {
                    selectedBooking.amount
                  }
                </h3>
              </div>

              {/* ADDRESS */}

              <div className="bg-slate-50 rounded-3xl p-5 md:col-span-2">

                <p className="text-sm text-slate-400">
                  Address
                </p>

                <div className="flex items-center gap-2 mt-3">

                  <MapPin
                    size={18}
                    className="text-slate-500"
                  />

                  <h3 className="font-semibold text-slate-700">
                    {
                      selectedBooking.address
                    }
                  </h3>
                </div>
              </div>

              {/* CONTACT */}

              <div className="bg-slate-50 rounded-3xl p-5 md:col-span-2">

                <p className="text-sm text-slate-400">
                  Contact
                </p>

                <div className="flex items-center gap-2 mt-3">

                  <Phone
                    size={18}
                    className="text-slate-500"
                  />

                  <h3 className="font-semibold text-slate-700">
                    {
                      selectedBooking.phone
                    }
                  </h3>
                </div>
              </div>

              {/* STATUS */}

              <div className="bg-slate-50 rounded-3xl p-5 md:col-span-2">

                <p className="text-sm text-slate-400">
                  Booking Status
                </p>

                <div className="mt-4">

                  <span
                    className={`px-4 py-2 rounded-2xl text-sm font-bold ${getStatusStyle(
                      selectedBooking.status
                    )}`}
                  >

                    {formatStatus(
                      selectedBooking.status
                    )}
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

export default BookingsPage;