"use client";
import Script from "next/script";
import { useState } from "react";
import { useRouter } from "next/navigation";
// import type { RazorpayResponse } from "@/types";


export default function UpgradeButton() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
      description: "Upgrade to Pro Tier",
      order_id: order.id,
      handler: async function (response :RazorpayResponse ) {
        const verifyRes = await fetch("/api/verifyPayment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(response), 
        });

        const result = await verifyRes.json();

        if (result.success) {
          alert("Payment successful! Upgrading your account...");
          await fetch("/api/upgrade", { method: "POST" });
          router.push("/");
        } else {
          alert("Payment verification failed. Please contact support.");
        }
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
        {loading ? "Processing..." : "Upgrade to Pro ₹100"}
      </button>
    </>
  );
}
