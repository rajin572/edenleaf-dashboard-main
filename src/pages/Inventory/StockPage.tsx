import { useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { ArrowRightLeft, FileDown } from "lucide-react";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import StockAdjustModal from "@/Components/Dashboard/Inventory/StockAdjustModal";
import { usePermission } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetStockLevelsQuery,
  useAdjustStockMutation,
  type IStockLevelRow,
} from "@/redux/features/inventory/inventoryApi";

const StockPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [adjusting, setAdjusting] = useState<IStockLevelRow | null>(null);

  const canUpdate = usePermission("inventory.update");

  const { data, isFetching } = useGetStockLevelsQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const rows = data?.data.data ?? [];
  const meta = data?.data.meta;

  const [adjustStock] = useAdjustStockMutation();

  const handleAdjust = async (variantId: string, quantityChange: number, reason: string) => {
    const res = await tryCatchWrapper(
      adjustStock,
      { body: { variantId, quantityChange, reason } },
      { toastLoadingMessage: "Adjusting stock..." }
    );
    if (res?.success) setAdjusting(null);
  };

  const columns: Column<IStockLevelRow>[] = [
    {
      header: "Product / SKU", accessorKey: "sku", render: (_val, row) => (
        <div className="flex flex-col">
          <span className="font-bold">{row.product?.name ?? "—"}{row.name && row.name !== "Default" ? ` — ${row.name}` : ""}</span>
          <span className="text-xs text-gray-500">{row.sku}</span>
        </div>
      ),
    },
    {
      header: "Available Qty", accessorKey: "stock", render: (val, row) => (
        <span className={val > 0 ? (val < 20 ? "text-warning font-bold" : "text-success font-bold") : "text-error font-bold"}>
          {val} {row.unit}
        </span>
      ),
    },
    {
      header: "Status", accessorKey: "stock", render: (val) => {
        const theme = val === 0 ? "error" : val < 20 ? "warning" : "success";
        const label = val === 0 ? "Out of Stock" : val < 20 ? "Low Stock" : "In Stock";
        return <Tag theme={theme}>{label}</Tag>;
      },
    },
    {
      header: "Action", accessorKey: "_id", render: (_, row) => (
        canUpdate ? (
          <Button variant="outline" size="sm" className="text-primary border-primary" onClick={() => setAdjusting(row)}>
            <ArrowRightLeft className="mr-2 size-3" /> Adjust
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <PageWraper
      title="Inventory Stock"
      description="Monitor real-time inventory levels and record manual stock adjustments."
      actions={<Button variant="outline" onClick={() => toast.info("Export will be available once reporting is wired to the API.")}><FileDown className="mr-2 size-4" /> Export Report</Button>}
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex justify-between items-center">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by SKU or Product Name..." className="max-w-md" />
        </div>
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={rows}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <StockAdjustModal open={!!adjusting} onOpenChange={(o) => !o && setAdjusting(null)} variant={adjusting} onAdjust={handleAdjust} />
    </PageWraper>
  );
};

export default StockPage;
