"use client";

import React, {
  useState,
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import api from "../../../lib/api";

import {
  FiMapPin,
  FiStar,
  FiCheck,
} from "react-icons/fi";

import { loadStripe } from "@stripe/stripe-js";

import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

/* ───────────────── STRIPE ───────────────── */

const stripePromise = loadStripe(
  "pk_test_51TCmpdHUqRt81EaRWd3N6KR4U7WXUTHle9F4LZqWwQd9C8iLaQi2FeOBzZcaRUxzDM6ZEXbtjjTI8EdTYe9Ahlt900EmkcMxbQ"
);

/* ───────────────── TYPES ───────────────── */

interface ServiceCategory {
  id: number;
  name: string;
  icon?: string;
}

interface Serviceman {
  id: number;
  name: string;
  rating?: number;
  distance?: number;
}

type Gateway =
  | "razorpay"
  | "stripe"
  | "wallet";

type PayMethod =
  | "upi"
  | "card"
  | "netbanking";

/* ───────────────── PAYMENT CONFIG ───────────────── */

const GATEWAY_CONFIG = {
  razorpay: {
    label: "Razorpay",
    icon: "💳",
    desc: "UPI · Cards · Net Banking",

    methods: [
      {
        key: "upi",
        label: "UPI",
        icon: "📱",
      },

      {
        key: "card",
        label: "Card",
        icon: "💳",
      },

      {
        key: "netbanking",
        label: "Net Banking",
        icon: "🏦",
      },
    ],
  },

  stripe: {
    label: "Stripe",
    icon: "🌐",
    desc: "International Cards",
  },

  wallet: {
    label: "Wallet",
    icon: "💰",
    desc: "Use Wallet Balance",
  },
};

/* ───────────────── STRIPE FORM ───────────────── */

function StripeCheckoutForm({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const stripe = useStripe();

  const elements = useElements();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleStripePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);

    setError("");

    const result =
      await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

    if (result.error) {
      setError(
        result.error.message ||
          "Stripe payment failed"
      );

      setLoading(false);

      return;
    }

    onSuccess();
  };

  return (
    <div className="mt-6 border rounded-2xl p-5 bg-gray-50">

      <h2 className="font-bold text-lg mb-4">
        Complete Stripe Payment
      </h2>

      <PaymentElement />

      {error && (
        <div className="mt-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleStripePay}
        disabled={loading}
        className={`mt-5 w-full py-3 rounded-xl text-white ${
          loading
            ? "bg-gray-400"
            : "bg-indigo-600 hover:bg-indigo-700"
        }`}
      >
        {loading
          ? "Processing..."
          : "Pay with Stripe"}
      </button>
    </div>
  );
}

/* ───────────────── RAZORPAY ───────────────── */

async function openRazorpay(options: {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  bookingId: number;
  method?: PayMethod;
}) {
  return new Promise<any>((resolve, reject) => {

    const rzpOptions: any = {
      key: options.key,

      amount: options.amount,

      currency: options.currency,

      order_id: options.order_id,

      name: "HomeFixer",

      description: `Booking #${options.bookingId}`,

      handler: resolve,

      modal: {
        ondismiss: () =>
          reject(
            new Error(
              "Payment cancelled"
            )
          ),
      },

      theme: {
        color: "#2563eb",
      },
    };

    if (options.method === "upi")
      rzpOptions.method = "upi";

    if (options.method === "card")
      rzpOptions.method = "card";

    if (
      options.method === "netbanking"
    )
      rzpOptions.method =
        "netbanking";

    const launch = () => {
      const rzp = new (
        window as any
      ).Razorpay(rzpOptions);

      rzp.open();
    };

    if ((window as any).Razorpay) {
      launch();
      return;
    }

    const s =
      document.createElement("script");

    s.src =
      "https://checkout.razorpay.com/v1/checkout.js";

    s.onload = launch;

    s.onerror = () =>
      reject(
        new Error(
          "Failed to load Razorpay"
        )
      );

    document.body.appendChild(s);
  });
}

/* ───────────────── STEP INDICATOR ───────────────── */

function StepIndicator({
  current,
}: {
  current: number;
}) {
  const steps = [
    "Category",
    "Professional",
    "Details",
  ];

  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((label, i) => {
        const step = i + 1;

        const done = current > step;

        const active =
          current === step;

        return (
          <React.Fragment key={label}>

            <div className="flex flex-col items-center">

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold
                ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? (
                  <FiCheck />
                ) : (
                  step
                )}
              </div>

              <span
                className={`text-xs mt-2 ${
                  active
                    ? "text-blue-600"
                    : done
                    ? "text-green-500"
                    : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>

            {i <
              steps.length - 1 && (
              <div
                className={`h-0.5 w-16 mb-5 mx-2 ${
                  current > step
                    ? "bg-green-400"
                    : "bg-gray-200"
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ───────────────── PAGE ───────────────── */

export default function CustomerBookingPage() {

  const router = useRouter();

  const [categories, setCategories] =
    useState<ServiceCategory[]>([]);

  const [workers, setWorkers] =
    useState<Serviceman[]>([]);

  const [
    selectedWorker,
    setSelectedWorker,
  ] = useState<Serviceman | null>(
    null
  );

  const [loadingCats, setLoadingCats] =
    useState(true);

  const [
    loadingWorkers,
    setLoadingWorkers,
  ] = useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [
    walletBalance,
    setWalletBalance,
  ] = useState<number | null>(null);

  const [step, setStep] =
    useState(1);

  const [error, setError] =
    useState("");

  const [gateway, setGateway] =
    useState<Gateway>("razorpay");

  const [payMethod, setPayMethod] =
    useState<PayMethod>("upi");

  const [images, setImages] =
    useState<File[]>([]);

  const [
    stripeClientSecret,
    setStripeClientSecret,
  ] = useState("");

  const [
    showStripeForm,
    setShowStripeForm,
  ] = useState(false);

  const [form, setForm] = useState({
    category: "",
    category_id: 0,
    scheduled_date: "",
    scheduled_time: "",
    problem_title: "",
    problem_description: "",
  });

  /* ───────────────── FETCH ───────────────── */

  useEffect(() => {
    api
      .get("/categories/")
      .then((res) =>
        setCategories(res.data)
      )
      .finally(() =>
        setLoadingCats(false)
      );
  }, []);

  useEffect(() => {
    api
      .get("/wallet/")
      .then((res) => {
        const raw =
          res.data.wallet ?? res.data;

        setWalletBalance(
          parseFloat(
            String(raw.balance ?? 0)
          )
        );
      })
      .catch(() =>
        setWalletBalance(0)
      );
  }, []);

  useEffect(() => {
    if (
      step !== 2 ||
      !form.category_id
    )
      return;

    setLoadingWorkers(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {

          const {
            latitude,
            longitude,
          } = pos.coords;

          const res =
            await api.get(
              "/servicemen/category-nearby/",
              {
                params: {
                  category: form.category,
                  lat: latitude,
                  lon: longitude,
                },
              }
            );

          setWorkers(res.data);

        } catch {

          setError(
            "Failed to load professionals."
          );

        } finally {

          setLoadingWorkers(false);

        }
      },

      () => {
        setLoadingWorkers(false);

        setError(
          "Please enable location access."
        );
      }
    );
  }, [step, form.category_id]);

  /* ───────────────── HANDLERS ───────────────── */

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setError("");

    setForm({
      ...form,
      [e.target.name]:
        e.target.value,
    });
  };

  const handleImages = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const files = Array.from(
      e.target.files || []
    );

    if (
      files.length + images.length >
      4
    ) {
      setError(
        "Maximum 4 images allowed"
      );
      return;
    }

    setImages((prev) => [
      ...prev,
      ...files,
    ]);
  };

  const goNext = () => {

    if (
      step === 1 &&
      !form.category_id
    ) {
      setError(
        "Please select category"
      );
      return;
    }

    if (
      step === 2 &&
      !selectedWorker
    ) {
      setError(
        "Please select professional"
      );
      return;
    }

    setStep((s) => s + 1);
  };

  const convertTo12hr = (
    time24: string
  ) => {

    const [h, m] = time24
      .split(":")
      .map(Number);

    const ampm =
      h >= 12 ? "PM" : "AM";

    const hour = h % 12 || 12;

    return `${String(hour).padStart(
      2,
      "0"
    )}:${String(m).padStart(
      2,
      "0"
    )} ${ampm}`;
  };

  /* ───────────────── SUBMIT ───────────────── */

  const handleSubmit = async () => {

    if (submitting) return;

    setError("");

    setSubmitting(true);

    try {

      const fd = new FormData();

      fd.append(
        "serviceman",
        String(selectedWorker?.id)
      );

      fd.append(
        "scheduled_date",
        form.scheduled_date
      );

      fd.append(
        "scheduled_time",
        convertTo12hr(
          form.scheduled_time
        )
      );

      fd.append(
        "problem_title",
        form.problem_title
      );

      fd.append(
        "problem_description",
        form.problem_description ||
          ""
      );

      images.forEach((img) => {
        fd.append(
          "image_urls",
          img
        );
      });

      const bookingRes =
        await api.post(
          "/booking/create/",
          fd,
          {
            headers: {
              "Content-Type":
                "multipart/form-data",
            },
          }
        );

      const bookingId =
        bookingRes?.data?.id ||
        bookingRes?.data
          ?.booking_id;

      if (!bookingId) {
        throw new Error(
          "Booking creation failed"
        );
      }

      /* WALLET */

      if (gateway === "wallet") {

        await api.post(
          `/wallet/booking/${bookingId}/pay/`
        );

        router.push(
          "/customer/my-bookings?booked=1"
        );

        return;
      }

      /* PAYMENT */

      const intentRes =
        await api.post(
          `/booking/${bookingId}/payment/create/`,
          {
            payment_type:
              "VISITING",

            gateway:
              gateway ===
              "razorpay"
                ? "RAZORPAY"
                : "STRIPE",

            ...(gateway ===
              "razorpay" && {
              method:
                payMethod ===
                "upi"
                  ? "UPI"
                  : payMethod ===
                    "card"
                  ? "CARD"
                  : "NETBANKING",
            }),
          }
        );

      const intentData =
        intentRes.data;

      /* RAZORPAY */

      if (
        gateway === "razorpay"
      ) {

        const payment =
          await openRazorpay({
            key: intentData.data.key,

            amount:
              intentData.data
                .amount,

            currency:
              intentData.data
                .currency,

            order_id:
              intentData.data
                .order_id,

            bookingId,

            method:
              payMethod,
          });

        await api.post(
          `/payment/${intentData.payment_id}/verify/razorpay/`,
          {
            razorpay_order_id:
              payment.razorpay_order_id,

            razorpay_payment_id:
              payment.razorpay_payment_id,

            razorpay_signature:
              payment.razorpay_signature,
          }
        );

        router.push(
          "/customer/my-bookings?booked=1"
        );

        return;
      }

      /* STRIPE */

      if (
        gateway === "stripe"
      ) {

        setStripeClientSecret(
          intentData.data
            .client_secret
        );

        setShowStripeForm(true);

        setSubmitting(false);

        return;
      }

    } catch (err: any) {

      console.log(err);

      setError(
        err?.response?.data
          ?.detail ||
          err?.message ||
          "Booking failed"
      );

    } finally {

      setSubmitting(false);

    }
  };

  /* ───────────────── UI ───────────────── */

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6 text-black">

      <div className="max-w-2xl mx-auto">

        <div className="mb-6">

          <h1 className="text-2xl font-bold">
            Book a Service
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            {step === 1 &&
              "What service do you need?"}

            {step === 2 &&
              "Choose nearby professional"}

            {step === 3 &&
              "Fill details and payment"}
          </p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">

          {/* STEP 1 */}

          {step === 1 && (
            <div>

              <h2 className="font-semibold mb-4">
                Select category
              </h2>

              {loadingCats ? (
                <div>
                  Loading...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                  {categories.map(
                    (cat) => {

                      const selected =
                        form.category ===
                        cat.name;

                      return (
                        <button
                          key={cat.id}
                          onClick={() =>
                            setForm({
                              ...form,
                              category:
                                cat.name,
                              category_id:
                                cat.id,
                            })
                          }
                          className={`p-5 rounded-xl border-2 transition ${
                            selected
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-100"
                          }`}
                        >
                          <div className="text-3xl mb-2">
                            🏠
                          </div>

                          <p className="font-semibold text-sm">
                            {cat.name}
                          </p>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}

          {step === 2 && (
            <div>

              <h2 className="font-semibold mb-4">
                Select Professional
              </h2>

              {loadingWorkers ? (
                <div>
                  Loading...
                </div>
              ) : (
                <div className="space-y-3">

                  {workers.map(
                    (w) => {

                      const selected =
                        selectedWorker?.id ===
                        w.id;

                      return (
                        <button
                          key={w.id}
                          onClick={() =>
                            setSelectedWorker(
                              w
                            )
                          }
                          className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 text-left ${
                            selected
                              ? "border-blue-600 bg-blue-50"
                              : "border-gray-100"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            {w.name?.[0]}
                          </div>

                          <div className="flex-1">

                            <p className="font-semibold">
                              {w.name}
                            </p>

                            <div className="flex gap-3 text-xs text-gray-500 mt-1">

                              <span className="flex items-center gap-1">
                                <FiMapPin size={11} />

                                {w.distance?.toFixed(
                                  1
                                )}{" "}
                                km
                              </span>

                              {w.rating && (
                                <span className="flex items-center gap-1">
                                  <FiStar size={11} />

                                  {w.rating}
                                </span>
                              )}
                            </div>
                          </div>

                          {selected && (
                            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <FiCheck size={13} />
                            </div>
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3 */}

          {step === 3 && (
            <div className="space-y-4">

              <div className="grid grid-cols-2 gap-3">

                <input
                  type="date"
                  name="scheduled_date"
                  value={
                    form.scheduled_date
                  }
                  onChange={
                    handleChange
                  }
                  className="border rounded-xl px-4 py-3"
                />

                <input
                  type="time"
                  name="scheduled_time"
                  value={
                    form.scheduled_time
                  }
                  onChange={
                    handleChange
                  }
                  className="border rounded-xl px-4 py-3"
                />
              </div>

              <input
                name="problem_title"
                placeholder="Problem title"
                value={
                  form.problem_title
                }
                onChange={
                  handleChange
                }
                className="border rounded-xl px-4 py-3 w-full"
              />

              <textarea
                name="problem_description"
                placeholder="Describe issue"
                value={
                  form.problem_description
                }
                onChange={
                  handleChange
                }
                rows={4}
                className="border rounded-xl px-4 py-3 w-full"
              />

              {/* IMAGE */}

              <div>

                <label className="block font-medium mb-2">
                  Upload Images
                  (Optional)
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    handleImages
                  }
                  className="border rounded-xl px-4 py-3 w-full"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Maximum 4 images
                </p>

                {images.length >
                  0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">

                    {images.map(
                      (
                        img,
                        i
                      ) => (
                        <div
                          key={i}
                          className="relative"
                        >
                          <img
                            src={URL.createObjectURL(
                              img
                            )}
                            alt=""
                            className="w-full h-20 object-cover rounded-lg border"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              setImages(
                                (
                                  prev
                                ) =>
                                  prev.filter(
                                    (
                                      _,
                                      idx
                                    ) =>
                                      idx !==
                                      i
                                  )
                              )
                            }
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                          >
                            ×
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* PAYMENT */}

              <div>

                <h2 className="font-semibold mb-3">
                  Payment Gateway
                </h2>

                <div className="grid grid-cols-2 gap-3">

                  {(
                    Object.keys(
                      GATEWAY_CONFIG
                    ) as Gateway[]
                  ).map((gw) => {

                    const cfg =
                      GATEWAY_CONFIG[
                        gw
                      ];

                    const active =
                      gateway === gw;

                    return (
                      <button
                        key={gw}
                        type="button"
                        onClick={() =>
                          setGateway(
                            gw
                          )
                        }
                        className={`p-4 rounded-xl border-2 text-left ${
                          active
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-100"
                        }`}
                      >
                        <div className="text-2xl">
                          {
                            cfg.icon
                          }
                        </div>

                        <p className="font-bold mt-2">
                          {
                            cfg.label
                          }
                        </p>

                        <p className="text-xs text-gray-500 mt-1">
                          {
                            cfg.desc
                          }
                        </p>
                      </button>
                    );
                  })}
                </div>

                {gateway ===
                  "razorpay" && (
                  <div className="grid grid-cols-3 gap-2 mt-4">

                    {GATEWAY_CONFIG.razorpay.methods.map(
                      (
                        m: any
                      ) => {

                        const active =
                          payMethod ===
                          m.key;

                        return (
                          <button
                            key={m.key}
                            type="button"
                            onClick={() =>
                              setPayMethod(
                                m.key
                              )
                            }
                            className={`border-2 rounded-xl px-3 py-3 text-sm ${
                              active
                                ? "border-blue-600 bg-blue-50"
                                : "border-gray-100"
                            }`}
                          >
                            <div className="text-lg">
                              {
                                m.icon
                              }
                            </div>

                            {
                              m.label
                            }
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* STRIPE */}

              {showStripeForm &&
                stripeClientSecret && (
                  <Elements
                    stripe={
                      stripePromise
                    }
                    options={{
                      clientSecret:
                        stripeClientSecret,
                    }}
                  >
                    <StripeCheckoutForm
                      onSuccess={() => {
                        router.push(
                          "/customer/my-bookings?booked=1"
                        );
                      }}
                    />
                  </Elements>
                )}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* NAVIGATION */}

          <div className="flex justify-between mt-8 pt-6 border-t">

            {step > 1 ? (
              <button
                onClick={() =>
                  setStep(
                    (s) => s - 1
                  )
                }
                className="px-5 py-2.5 border rounded-xl"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={goNext}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={() => {
                  if (submitting)
                    return;

                  handleSubmit();
                }}
                disabled={
                  submitting
                }
                className={`px-6 py-2.5 rounded-xl text-white transition ${
                  submitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {submitting
                  ? "Processing..."
                  : "Confirm Booking"}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}