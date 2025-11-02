"use client";

import { Sparkles, ShieldCheck, Upload, Crown } from "lucide-react";
import UpgradeButton from "../components/UpgradeButton";

export default function UpgradePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f8fafc] via-[#eef2ff] to-[#e0e7ff] text-gray-800 p-6">
      <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl p-10 max-w-md w-full text-center border border-indigo-100">
        <div className="flex justify-center mb-6">
          <Crown className="w-16 h-16 text-yellow-500 drop-shadow-md animate-bounce" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-indigo-700 mb-3">
          Upgrade to Pro
        </h1>
        <p className="text-gray-600 mb-8">
          Unlock premium features and upload unlimited files for just{" "}
          <span className="font-semibold text-indigo-600">₹100</span> — one-time
          payment, lifetime access.
        </p>

        <div className="space-y-4 text-left mb-8">
          <FeatureItem icon={<ShieldCheck className="text-green-500" />} text="Unlimited uploads" />
          <FeatureItem icon={<Upload className="text-blue-500" />} text="Faster upload speeds" />
          <FeatureItem icon={<Sparkles className="text-purple-500" />} text="Priority support" />
          <FeatureItem icon={<Crown className="text-yellow-500" />} text="Pro badge on your profile" />
        </div>

        <UpgradeButton />

        <p className="text-sm text-gray-500 mt-5">
          100% secure payment • Instant upgrade
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-indigo-50 transition-all duration-200">
      <div className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm">
        {icon}
      </div>
      <p className="text-gray-700 font-medium">{text}</p>
    </div>
  );
}
