"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "../../../../lib/api";


/* ================= TYPES ================= */
interface BookingDetail {
  id: number;
  status: string;
  scheduled_date: string;
  scheduled_time: string;
  problem_title: string;
  problem_description: string;
  customer_address: string | { address?: string } | null;
  service_charge: string;
  platform_fee: string;
  total_amount: string;
  image_urls: string[];
  serviceman_name: string;
  // Payment / completion flags
  serviceman_marked_done: boolean;
  advance_payment_status: string;
  final_payment_status: string;
  final_amount: string | null;
}

interface Category {
  id: number;
  name: string;
}

interface Vendor {
  vendor_id: number;       // ← serializer uses vendor_id not id
  business_name: string;
  full_address: string;    // ← serializer uses full_address not store_address
  distance_km?: number;
}

interface Product {
  id: number;
  name: string;
  price: string;
  stock_quantity: number;
  description: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

type Step = "detail" | "service" | "vendors" | "products" | "cart";

function formatAddress(addr: BookingDetail["customer_address"]): string {
  if (!addr) return "Not available";
  if (typeof addr === "string") return addr;
  return addr.address || "Not available";
}

/* ================= PAGE ================= */
export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [step, setStep]         = useState<Step>("detail");
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState<BookingDetail | null>(null);

  // Service step
  const [categories, setCategories]         = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [serviceCharge, setServiceCharge]   = useState("");
  const [savingCharge, setSavingCharge]     = useState(false);

  // Vendors step
  const [vendors, setVendors]       = useState<Vendor[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  // Products step
  const [products, setProducts]     = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [cart, setCart]             = useState<CartItem[]>([]);

  // Order
  const [ordering, setOrdering]         = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [completing, setCompleting]     = useState(false);
  const [confirmingDone, setConfirmingDone] = useState(false);
  // Local flag — set immediately on success so UI reacts even if backend
  // doesn't return serviceman_marked_done in the details response
  const [markedDoneLocally, setMarkedDoneLocally] = useState(false);

  /* ===== FETCH BOOKING ===== */
  useEffect(() => {
    fetchBooking();
    fetchCategories();
  }, []);

  // Auto-poll every 8s when waiting for customer's final payment
  // Use stable primitives in deps — never optional chaining in dep arrays
  const finalPayStatus = booking?.final_payment_status ?? "";
  const backendMarkedDone = booking?.serviceman_marked_done ?? false;
  useEffect(() => {
    const shouldPoll = (markedDoneLocally || backendMarkedDone) && finalPayStatus !== "paid";
    if (!shouldPoll) return;
    const interval = setInterval(fetchBooking, 8000);
    return () => clearInterval(interval);
  }, [markedDoneLocally, backendMarkedDone, finalPayStatus]);

  const fetchBooking = async () => {
    try {
      const res = await api.get(`/booking/${bookingId}/details/`);
      setBooking(res.data);
    } catch {
      router.replace("/service-man/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/product-categories/");
      setCategories(Array.isArray(res.data) ? res.data : []);
    } catch { console.error("Categories fetch failed"); }
  };

  /* ===== SERVICE CHARGE ===== */
  const handleSaveServiceCharge = async () => {
    if (!serviceCharge) return;
    setSavingCharge(true);
    try {
      await api.patch(`/booking/${bookingId}/service-charge/`, {
        service_charge: serviceCharge,
      });
      await fetchBooking();
      setStep("vendors");
    } catch {
      alert("Failed to update service charge");
    } finally {
      setSavingCharge(false);
    }
  };

  /* ===== FETCH VENDORS ===== */
  const fetchVendors = async (categoryId: number) => {
    setVendorsLoading(true);
    try {
      const res = await api.get(
        `/booking/${bookingId}/vendors/nearby/?category_id=${categoryId}`
      );
      setVendors(res.data.vendors ?? []);
    } catch {
      alert("Failed to fetch nearby vendors");
    } finally {
      setVendorsLoading(false);
    }
  };

  const handleSelectCategory = (cat: Category) => {
    setSelectedCategory(cat);
    setStep("vendors");
    fetchVendors(cat.id);
  };

  /* ===== FETCH PRODUCTS ===== */
  const fetchProducts = async (vendor: Vendor) => {
  if (!selectedCategory) return;
  setSelectedVendor(vendor);
  setProductsLoading(true);
  try {
    const res = await api.get(
      `/booking/${bookingId}/vendors/${vendor.vendor_id}/products/?category_id=${selectedCategory.id}`
    );
    setProducts(res.data.products ?? []);
    setStep("products");
  } catch (err: any) {
    const msg = err?.response?.data?.detail || err?.response?.data?.error || "Failed to fetch vendor products";
    alert(msg);
  } finally {
    setProductsLoading(false);
  }
};

  /* ===== CART ===== */
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i =>
        i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
      );
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === productId);
      if (existing?.quantity === 1) return prev.filter(i => i.product.id !== productId);
      return prev.map(i =>
        i.product.id === productId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.product.price) * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  /* ===== PLACE ORDER ===== */
  const handlePlaceOrder = async () => {
    if (!selectedVendor || !selectedCategory || cart.length === 0) return;
    setOrdering(true);
    try {
      await api.post("/material-orders/create/", {
        booking_id: parseInt(bookingId),
        vendor_id: selectedVendor.vendor_id,   // ✅ fixed
        category_id: selectedCategory.id,
        urgency: "MEDIUM",
        items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity })),
      });
      setOrderSuccess(true);
      setCart([]);
      setStep("detail");
      await fetchBooking();
    } catch (err: any) {
      alert(err?.response?.data?.detail || "Failed to place order");
    } finally {
      setOrdering(false);
    }
  };

  /* ===== COMPLETE BOOKING ===== */
  const handleComplete = async () => {
    setCompleting(true);
    setConfirmingDone(false);
    try {
      await api.patch(`/booking/${bookingId}/complete/`);
      // Set local flag immediately so UI reacts even if backend
      // doesn't return serviceman_marked_done in the details response
      setMarkedDoneLocally(true);
      await fetchBooking();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string; detail?: string } } };
      alert(e?.response?.data?.error || e?.response?.data?.detail || "Failed to mark service as done");
    } finally {
      setCompleting(false);
    }
  };

  /* ===== LOADING ===== */
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!booking) return null;

  // Use local flag OR backend field — whichever is true
  const markedDone   = markedDoneLocally || !!booking.serviceman_marked_done;
  const isOngoing    = booking.status === "ONGOING" && !markedDone;
  const awaitingPay  = markedDone && booking.final_payment_status !== "paid";
  const isCompleted  = booking.status === "COMPLETED" || booking.final_payment_status === "paid";

  // Derive a clean stage label + style for the header badge
  const stageLabel = isCompleted  ? "Completed"
                   : awaitingPay  ? "Awaiting Payment"
                   : booking.status === "ONGOING"  ? "In Progress"
                   : booking.status === "ACCEPTED" ? "Accepted"
                   : booking.status;

  const stageBadge = isCompleted  ? "bg-green-100 text-green-800"
                   : awaitingPay  ? "bg-orange-100 text-orange-800"
                   : booking.status === "ONGOING"  ? "bg-yellow-100 text-yellow-800"
                   : booking.status === "ACCEPTED" ? "bg-blue-100 text-blue-800"
                   : "bg-gray-100 text-gray-700";

  /* ================= STEP: DETAIL ================= */
  if (step === "detail") return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.push("/service-man/bookings")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">
            ←
          </button>
          <h1 className="text-xl font-bold text-gray-900">Booking #{booking.id}</h1>
          <span className={`ml-auto px-3 py-1 rounded-full text-xs font-bold ${stageBadge}`}>
            {stageLabel}
          </span>
        </div>

        {/* ── Progress stepper ── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between relative">
            {/* Connecting line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 z-0" />
            <div
              className="absolute top-5 left-0 h-0.5 bg-green-500 z-0 transition-all duration-700"
              style={{
                width: isCompleted ? "100%" : awaitingPay ? "66%" : isOngoing ? "33%" : "0%",
              }}
            />

            {/* Step 1 — In Progress */}
            {[
              {
                label: "In Progress",
                icon: "🔧",
                done: awaitingPay || isCompleted,
                active: isOngoing,
              },
              {
                label: "Awaiting Payment",
                icon: "💳",
                done: isCompleted,
                active: awaitingPay,
              },
              {
                label: "Completed",
                icon: "✅",
                done: isCompleted,
                active: false,
              },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center z-10 flex-1">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-base transition-all ${
                  s.done
                    ? "bg-green-500 border-green-500 text-white"
                    : s.active
                    ? "bg-white border-blue-600 shadow-md scale-110"
                    : "bg-white border-gray-300"
                }`}>
                  {s.done ? "✓" : s.icon}
                </div>
                <p className={`text-xs mt-2 font-semibold text-center leading-tight ${
                  s.done ? "text-green-600" : s.active ? "text-blue-700" : "text-gray-400"
                }`}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Banner */}
        {orderSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4 flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-green-800">Material order sent!</p>
              <p className="text-green-700 text-sm">Waiting for customer approval, then vendor will confirm.</p>
            </div>
          </div>
        )}

        {/* Awaiting final payment banner */}
        {awaitingPay && (
          <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                💳
              </div>
              <div className="flex-1">
                <p className="font-bold text-orange-900">Waiting for customer's final payment</p>
                <p className="text-orange-700 text-sm mt-1">
                  You've marked this service as done.
                  {booking.final_amount ? <> Final amount: <strong>₹{booking.final_amount}</strong>.</> : ""}
                  {" "}This page will update automatically when the customer pays.
                </p>
              </div>
            </div>
            {/* Pulse indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs text-orange-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse inline-block" />
              Checking for payment every 8 seconds…
            </div>
          </div>
        )}

        {/* Completed banner */}
        {isCompleted && (
          <div className="bg-green-50 border-2 border-green-400 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 text-xl">
                🎉
              </div>
              <div>
                <p className="font-bold text-green-900">Service Completed!</p>
                <p className="text-green-700 text-sm mt-1">
                  Final payment received. This booking is fully closed.
                  {booking.final_amount ? <> Total earned: <strong>₹{booking.final_amount}</strong>.</> : ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h2 className="font-bold text-gray-900 text-lg capitalize mb-3">{booking.problem_title}</h2>
          <p className="text-gray-700 text-sm mb-4">{booking.problem_description}</p>

          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">📍 Address</span>
              <span className="text-gray-900 font-medium">{formatAddress(booking.customer_address)}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">📅 Scheduled</span>
              <span className="text-gray-900 font-medium">{booking.scheduled_date} at {booking.scheduled_time}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">💰 Service fee</span>
              <span className="text-gray-900 font-medium">₹{booking.service_charge}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-500 w-28 shrink-0">🏷 Platform fee</span>
              <span className="text-gray-900 font-medium">₹{booking.platform_fee}</span>
            </div>
          </div>

          {/* Images */}
          {booking.image_urls?.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Problem Photos</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {booking.image_urls.map((url, i) => (
                  <img key={i} src={url} alt="issue"
                    className="w-24 h-24 rounded-xl object-cover border border-gray-200 shrink-0" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Live Tracking — only while job is active */}
          {!isCompleted && (
            <button
              onClick={() => router.push(`/service-man/tracking/${bookingId}`)}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200"
            >
              📍 Open Live Tracking Map
            </button>
          )}

          {/* Order materials — only while ongoing and not yet marked done */}
          {isOngoing && (
            <button
              onClick={() => setStep("service")}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              🔧 Order Materials from Vendor
            </button>
          )}

          {/* Mark done — only while ongoing and not yet marked done */}
          {isOngoing && (
            <>
              {confirmingDone ? (
                /* Inline confirmation — no browser dialog */
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
                  <p className="font-bold text-green-900 text-sm mb-1">Confirm completion</p>
                  <p className="text-green-700 text-xs mb-4">
                    The customer will receive a final payment request. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleComplete}
                      disabled={completing}
                      className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      {completing
                        ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Marking…</>
                        : "Yes, Mark as Done"
                      }
                    </button>
                    <button
                      onClick={() => setConfirmingDone(false)}
                      disabled={completing}
                      className="flex-1 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl text-sm transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingDone(true)}
                  className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  ✓ Mark Service as Done
                </button>
              )}
            </>
          )}

          <button
            onClick={() => router.push("/service-man/bookings")}
            className="w-full py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-colors"
          >
            ← Back to Bookings
          </button>
        </div>
      </div>
    </main>
  );

  /* ================= STEP: SERVICE (select category + set charge) ================= */
  {/* ================= STEP: SERVICE ================= */}
  if (step === "service") return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("detail")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">←</button>
          <h1 className="text-xl font-bold text-gray-900">Select Service & Material</h1>
        </div>

        {/* Service Charge */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-1">Your Service Charge</h3>
          <p className="text-gray-500 text-sm mb-3">Set your charge for this service visit</p>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₹</span>
            <input
              type="number"
              value={serviceCharge}
              onChange={e => setServiceCharge(e.target.value)}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Category selection — just highlight, don't navigate */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-1">Material Category Needed</h3>
          <p className="text-gray-500 text-sm mb-3">Select what type of materials you need</p>
          <div className="grid grid-cols-2 gap-2">
            {categories.length === 0 && (
              <p className="col-span-2 text-gray-400 text-sm text-center py-4">Loading categories...</p>
            )}
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat)}
                className={`p-3 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                  selectedCategory?.id === cat.id
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-blue-300 text-gray-900"
                }`}
              >
                🔩 {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* ✅ Next button handles save + navigate */}
        <button
          disabled={savingCharge}
          onClick={async () => {
            if (!serviceCharge) { alert("Please enter your service charge"); return; }
            if (!selectedCategory) { alert("Please select a material category"); return; }
            
            setSavingCharge(true);
            try {
              await api.patch(`/booking/${bookingId}/service-charge/`, {
                service_charge: serviceCharge,
              });
              await fetchBooking();
              // ✅ Now fetch vendors and navigate
              setStep("vendors");
              fetchVendors(selectedCategory.id);
            } catch {
              alert("Failed to update service charge");
            } finally {
              setSavingCharge(false);
            }
          }}
          className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl transition-colors"
        >
          {savingCharge ? "Saving..." : "Next: Find Vendors →"}
        </button>
      </div>
    </main>
  );

  /* ================= STEP: VENDORS ================= */
  if (step === "vendors") return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("service")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">←</button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Nearby Vendors</h1>
            <p className="text-sm text-gray-500">Category: {selectedCategory?.name}</p>
          </div>
        </div>

        {vendorsLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : vendors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-4xl mb-3">🏪</p>
            <p className="font-bold text-gray-900">No vendors found nearby</p>
            <p className="text-gray-500 text-sm mt-1">No vendors within 10 km with this category in stock</p>
            <button onClick={() => setStep("service")}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
              Try Another Category
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {vendors.map(vendor => (
              <div key={vendor.vendor_id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {vendor.business_name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-0.5">
                      📍 {vendor.full_address || "Nearby"}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {vendor.distance_km && (
                      <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded-full">
                        {vendor.distance_km} km
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => fetchProducts(vendor)}
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    View Products →
                  </button>
                  <button
                    onClick={() => router.push(`/service-man/tracking/${bookingId}?stage=TO_VENDOR`)}
                    className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-sm font-semibold rounded-lg border border-amber-200 transition-colors"
                    title="Navigate to this vendor"
                  >
                    📍 Navigate
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );

  /* ================= STEP: PRODUCTS ================= */
  if (step === "products") return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("vendors")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">←</button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{selectedVendor?.business_name}</h1>
            <p className="text-sm text-gray-500">{selectedCategory?.name} products</p>
          </div>
          {cartCount > 0 && (
            <button onClick={() => setStep("cart")}
              className="relative px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl">
              🛒 Cart
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </button>
          )}
        </div>

        {productsLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-bold text-gray-900">No products in stock</p>
            <button onClick={() => setStep("vendors")}
              className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold">
              ← Back to Vendors
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {products.map(product => {
                const inCart = cart.find(i => i.product.id === product.id);
                return (
                  <div key={product.id}
                    className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{product.name}</h3>
                      {product.description && (
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">{product.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-blue-700 font-bold">₹{product.price}</span>
                        <span className="text-gray-400 text-xs">{product.stock_quantity} in stock</span>
                      </div>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(product.id)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold rounded-lg transition-colors">
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-gray-900">{inCart.quantity}</span>
                        <button onClick={() => addToCart(product)}
                          className="w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                          +
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(product)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {cartCount > 0 && (
              <div className="fixed bottom-6 left-0 right-0 px-4">
                <button onClick={() => setStep("cart")}
                  className="w-full max-w-2xl mx-auto flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-2xl transition-colors">
                  <span>🛒 {cartCount} items</span>
                  <span>View Cart → ₹{cartTotal.toFixed(2)}</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );

  /* ================= STEP: CART ================= */
  if (step === "cart") return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8 pb-32">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => setStep("products")}
            className="p-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 font-bold">←</button>
          <h1 className="text-xl font-bold text-gray-900">Confirm Order</h1>
        </div>

        {/* Vendor info */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <p className="text-sm text-blue-700">
            <span className="font-bold">Vendor:</span> {selectedVendor?.business_name}
          </p>
          <p className="text-sm text-blue-700">
            <span className="font-bold">Category:</span> {selectedCategory?.name}
          </p>
        </div>

        {/* Cart items */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Selected Products</h3>
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.product.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="font-semibold text-gray-900">{item.product.name}</p>
                  <p className="text-sm text-gray-500">₹{item.product.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900">
                    ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                  </span>
                  <button onClick={() => removeFromCart(item.product.id)}
                    className="w-7 h-7 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-lg text-sm">
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <h3 className="font-bold text-gray-900 mb-3">Pricing Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-700">
              <span>Service Charge</span>
              <span>₹{booking.service_charge}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Platform Fee</span>
              <span>₹{booking.platform_fee}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Total Materials</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-900 text-base">
              <span>Total</span>
              <span>₹{(parseFloat(booking.service_charge) + parseFloat(booking.platform_fee) + cartTotal).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handlePlaceOrder}
            disabled={ordering || cart.length === 0}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-2xl text-base transition-colors shadow-lg"
          >
            {ordering ? "Placing Order..." : "📦 Send Order Request to Vendor"}
          </button>
          <p className="text-center text-xs text-gray-500">
            Customer will approve this order before vendor receives it
          </p>
          <button onClick={() => setStep("products")}
            className="w-full py-3 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl">
            ← Edit Cart
          </button>
        </div>
      </div>
    </main>
  );

  return null;
}