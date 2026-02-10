import { Wallet, Clock, ShieldAlert, PackageX } from "lucide-react";
import { formatMoney } from "@/utils/money";
import { IDashboardStats } from "@/types";

interface DashboardStatCardsProps {
  stats: IDashboardStats;
}

const DashboardStatCards = ({ stats }: DashboardStatCardsProps) => {
  const cards = [
    {
      label: "Sales Today",
      value: formatMoney(stats.salesToday),
      icon: Wallet,
      iconColor: "text-emerald-500",
    },
    {
      label: "Pending Orders",
      value: stats.pendingOrders.toLocaleString(),
      icon: Clock,
      iconColor: "text-blue-500",
    },
    {
      label: "Pending Payment Verification",
      value: stats.pendingPaymentVerification.toLocaleString(),
      icon: ShieldAlert,
      iconColor: "text-amber-500",
    },
    {
      label: "Low / Out of Stock",
      value: stats.lowStockItems.toLocaleString(),
      icon: PackageX,
      iconColor: "text-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, icon: Icon, iconColor }) => (
        <div key={label} className="bg-white rounded-xl border border-border p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-secondbase-color">{label}</p>
            <p className="text-2xl font-bold text-base-color mt-2">{value}</p>
          </div>
          <Icon className={`size-6 shrink-0 ${iconColor}`} />
        </div>
      ))}
    </div>
  );
};

export default DashboardStatCards;
