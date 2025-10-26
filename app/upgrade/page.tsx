import UpgradeButton from "../components/UpgradeButton";

export default function UpgradePage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h2 className="text-3xl font-semibold mb-4">Upgrade to Paid Tier</h2>
      <p className="mb-6 text-gray-600">
        Pay a one-time fee of ₹100 to unlock unlimited uploads.
      </p>
      <UpgradeButton />
    </div>
  );
}
