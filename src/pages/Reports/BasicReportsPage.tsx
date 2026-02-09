import { useState } from "react";
import dayjs from "dayjs";
import { AlertTriangle } from "lucide-react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { DatePicker } from "@/Components/ui/CustomUi/ReuseForm/ReuseDatePicker";
import RevenueAreaChart, { RevenueChartDataPoint } from "@/Components/Charts/RevenueAreaChart";
import DonutSplitChart from "@/Components/Charts/DonutSplitChart";
import TopProductsBarChart from "@/Components/Charts/TopProductsBarChart";
import { formatMoney, fromPoisha } from "@/utils/money";
import { REAL_ORDER_STATUS_COLORS } from "@/utils/chartColors";
import {
  useGetSalesReportQuery,
  useGetOrderCountReportQuery,
  useGetProductSalesReportQuery,
  useGetInventoryReportQuery,
} from "@/redux/features/report/reportApi";
import type { IInventoryReportRow, IProductSalesReport, ITopSellingProduct } from "@/types";

/** "OUT_FOR_DELIVERY" -> "Out For Delivery" — no existing label util covers the real 14-value uppercase status enum. */
const humanize = (status: string) =>
  status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

const queryErrorMessage = (error: unknown): string => {
  const data = (error as { data?: { message?: string } } | undefined)?.data;
  return data?.message || "Couldn't load this report.";
};

const productSalesColumns: Column<IProductSalesReport>[] = [
  { header: "Product", accessorKey: "productName", render: (val) => <span className="font-medium">{val}</span> },
  { header: "Units Sold", accessorKey: "unitsSold" },
  { header: "Sales", accessorKey: "salesInPoisha", render: (val) => formatMoney(val as number) },
];

type IInventoryRowWithStatus = IInventoryReportRow & { status: "Low Stock" | "Out of Stock" };

const inventoryColumns: Column<IInventoryRowWithStatus>[] = [
  { header: "Product / Variant", accessorKey: "productName", render: (val, row) => <span className="font-medium">{val} ({row.variantName})</span> },
  { header: "SKU", accessorKey: "sku" },
  { header: "Current Stock", accessorKey: "stock", render: (val, row) => `${val} ${row.unit}` },
  {
    header: "Status",
    accessorKey: "status",
    render: (val) => <Tag theme={val === "Out of Stock" ? "error" : "warning"}>{val as string}</Tag>,
  },
];

const PAGE_SIZE = 10;

const BasicReportsPage = () => {
  const [productSalesPage, setProductSalesPage] = useState(1);
  const [inventoryPage, setInventoryPage] = useState(1);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(undefined);

  // The backend requires from/to together or neither — only send both once
  // both are actually picked, never a lone one mid-selection.
  const customFromIso = customFrom ? dayjs(customFrom).startOf("day").toISOString() : undefined;
  const customToIso = customTo ? dayjs(customTo).endOf("day").toISOString() : undefined;
  const salesArgs = customFromIso && customToIso ? { from: customFromIso, to: customToIso } : undefined;

  const { data: salesRes, isFetching: loadingSales, isError: salesErrored, error: salesError } = useGetSalesReportQuery(salesArgs);
  const { data: orderCountRes, isFetching: loadingOrders } = useGetOrderCountReportQuery();
  const { data: productSalesRes, isFetching: loadingProductSales } = useGetProductSalesReportQuery({ limit: 20 });
  const { data: inventoryRes, isFetching: loadingInventory } = useGetInventoryReportQuery();

  const sales = salesRes?.data;
  const orderCounts = orderCountRes?.data;
  const productSales = productSalesRes?.data ?? [];
  const inventory = inventoryRes?.data;

  // No day-granularity endpoint exists — this is a deliberate 3(-4) point
  // Today/This Week/This Month(/Custom) comparison, not a fabricated daily trend.
  const trendData: RevenueChartDataPoint[] = sales ? [
    { date: "Today", Revenue: fromPoisha(sales.today.amountInPoisha) },
    { date: "This Week", Revenue: fromPoisha(sales.thisWeek.amountInPoisha) },
    { date: "This Month", Revenue: fromPoisha(sales.thisMonth.amountInPoisha) },
    ...(sales.custom ? [{ date: "Custom", Revenue: fromPoisha(sales.custom.amountInPoisha) }] : []),
  ] : [];

  const orderTotal = orderCounts?.total || 1;
  const statusEntries = Object.entries(orderCounts?.byStatus ?? {});
  const statusData = statusEntries.map(([status, count]) => ({
    category: humanize(status),
    percentage: Math.round((count / orderTotal) * 100),
  }));
  const statusColors = Object.fromEntries(
    statusEntries.map(([status]) => [humanize(status), REAL_ORDER_STATUS_COLORS[status]])
  );

  const topProducts: ITopSellingProduct[] = productSales.map((p) => ({ _id: p.productId, name: p.productName, unitsSold: p.unitsSold }));
  const productSalesPageRows = productSales.slice((productSalesPage - 1) * PAGE_SIZE, productSalesPage * PAGE_SIZE);

  const inventoryRows: IInventoryRowWithStatus[] = [
    ...(inventory?.outOfStock ?? []).map((row) => ({ ...row, status: "Out of Stock" as const })),
    ...(inventory?.lowStock ?? []).map((row) => ({ ...row, status: "Low Stock" as const })),
  ];
  const inventoryPageRows = inventoryRows.slice((inventoryPage - 1) * PAGE_SIZE, inventoryPage * PAGE_SIZE);

  return (
    <PageWraper title="Reports" description="Read-only, derived from order and inventory records — no profit/COGS figures in V1.">
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-base-color">Sales</h2>
          <div className="flex items-end gap-3">
            <DatePicker value={customFrom} onChange={setCustomFrom} placeholder="Custom from" className="p-0 w-auto" />
            <DatePicker value={customTo} onChange={setCustomTo} placeholder="Custom to" className="p-0 w-auto" />
          </div>
        </div>

        {salesErrored ? (
          <div className="flex gap-3 items-start rounded-md border border-destructive/30 bg-destructive/5 p-4">
            <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-sm text-destructive">{queryErrorMessage(salesError)}</div>
          </div>
        ) : loadingSales ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">Today</p>
                <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(sales?.today.amountInPoisha ?? 0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">This Week</p>
                <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(sales?.thisWeek.amountInPoisha ?? 0)}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">This Month</p>
                <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(sales?.thisMonth.amountInPoisha ?? 0)}</p>
              </div>
              {sales?.custom && (
                <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                  <p className="text-sm text-secondbase-color">Custom Range</p>
                  <p className="text-2xl font-bold text-base-color mt-1">{formatMoney(sales.custom.amountInPoisha)}</p>
                </div>
              )}
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <RevenueAreaChart data={trendData} />
            </div>
          </>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-base-color">Orders</h2>
        {loadingOrders ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4 content-start">
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">Total</p>
                <p className="text-2xl font-bold text-base-color mt-1">{orderCounts?.total ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">Pending</p>
                <p className="text-2xl font-bold text-base-color mt-1">{orderCounts?.pending ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">Delivered</p>
                <p className="text-2xl font-bold text-base-color mt-1">{orderCounts?.delivered ?? 0}</p>
              </div>
              <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
                <p className="text-sm text-secondbase-color">Cancelled</p>
                <p className="text-2xl font-bold text-base-color mt-1">{orderCounts?.cancelled ?? 0}</p>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <DonutSplitChart data={statusData} colors={statusColors} />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-bold text-base-color">Product Sales</h2>
        {loadingProductSales ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-border shadow-sm p-5">
              <TopProductsBarChart data={topProducts} />
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
              <ReusableTable
                data={productSalesPageRows}
                columns={productSalesColumns}
                pagination
                currentPage={productSalesPage}
                setCurrentPage={setProductSalesPage}
                limit={PAGE_SIZE}
                total={productSales.length}
              />
            </div>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-base-color">Inventory — Low &amp; Out of Stock</h2>
          {inventory && <p className="text-sm text-secondbase-color">Threshold: {inventory.lowStockThreshold} units</p>}
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          {loadingInventory ? (
            <div className="py-20 flex justify-center"><SpinLoader /></div>
          ) : (
            <ReusableTable
              data={inventoryPageRows}
              columns={inventoryColumns}
              pagination
              currentPage={inventoryPage}
              setCurrentPage={setInventoryPage}
              limit={PAGE_SIZE}
              total={inventoryRows.length}
            />
          )}
        </div>
      </section>
    </PageWraper>
  );
};

export default BasicReportsPage;
