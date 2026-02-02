import { useState } from 'react';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Eye } from "lucide-react";
import OrderDetailSheet from "@/Components/Dashboard/Orders/OrderDetailSheet";
import { formatDateTime } from "@/utils/dateFormet";
import { formatMoney } from "@/utils/money";
import { useGetOrdersQuery, useGetOrderByIdQuery } from "@/redux/features/order/orderApi";
import type { IOrder } from "@/types";

// This backend has no post-delivery customer-return/refund flow — the only
// real "order came back" event is RTO (courier failed delivery, staff mark it
// returned-to-origin from the order detail sheet). This page is a read-only
// list of those orders; there's no "Add Return" affordance because no
// endpoint lets staff retroactively mark an arbitrary delivered order returned.
const ReturnsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [viewingId, setViewingId] = useState<string | null>(null);

  const { data, isFetching } = useGetOrdersQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, status: "RETURNED_TO_ORIGIN" },
    { refetchOnMountOrArgChange: true },
  );
  const orders = data?.data.data ?? [];
  const meta = data?.data.meta;

  const { data: viewingRes, isFetching: viewingLoading } = useGetOrderByIdQuery(viewingId!, { skip: !viewingId });
  const viewing = viewingRes?.data ?? null;

  const columns: Column<IOrder>[] = [
    { header: "Order ID", accessorKey: "orderNumber", render: (val) => <span className="font-bold text-base-color">{val}</span> },
    {
      header: "Customer", accessorKey: "customerSnapshot", render: (_val, row) => (
        <div className="flex flex-col">
          <span>{row.customerSnapshot.name}</span>
          <span className="text-xs text-secondbase-color">{row.customerSnapshot.phone}</span>
        </div>
      ),
    },
    { header: "Returned", accessorKey: "updatedAt", render: (val) => formatDateTime(val) },
    { header: "Amount", accessorKey: "grandTotalInPoisha", render: (val) => formatMoney(val) },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 bg-blue-50" onClick={() => setViewingId(row._id)}>
          <Eye className="size-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageWraper
      title="Returns"
      description="Orders returned to origin after a failed delivery attempt."
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search by Order ID or Customer..." className="flex-1 max-w-md" />
        {isFetching ? (
          <SpinLoader />
        ) : (
          <ReusableTable
            data={orders}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <OrderDetailSheet open={!!viewingId} onOpenChange={(o) => !o && setViewingId(null)} order={viewing} isLoading={viewingLoading} />
    </PageWraper>
  );
};

export default ReturnsPage;
