"use client";

import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

import { useState } from "react";

export default function StripePaymentForm({
  clientSecret,
  onSuccess,
}: {
  clientSecret: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handlePay = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    const result =
      await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

    if (result.error) {
      setError(result.error.message || "Payment failed");
      setLoading(false);
      return;
    }

    onSuccess();
  };

  return (
    <div className="space-y-4">
      <PaymentElement />

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-3 rounded-xl"
      >
        {loading
          ? "Processing..."
          : "Pay Now"}
      </button>
    </div>
  );
}