"use client";
import Script from "next/script";
import { useState } from "react";

export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const res = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100 * 100 }),
    });
    const order = await res.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RZ_KEY!,
      amount: order.amount,
      currency: order.currency,
      name: "ImageKit App",
      description: "Upgrade to Paid Tier",
      order_id: order.id,
      handler: async () => {
        alert("Payment successful! Upgrading your account...");
        await fetch("/api/upgrade", { method: "POST" });
        window.location.reload();
      },
      theme: { color: "#2A4494" },
    };

const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(false);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <button
        onClick={handleUpgrade}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        disabled={loading}
      >
        {loading ? "Processing..." : "Upgrade to Paid ₹100"}
      </button>
    </>
  );
}
