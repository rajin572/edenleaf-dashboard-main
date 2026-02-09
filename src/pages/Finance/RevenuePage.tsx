import { useState } from "react";
import dayjs from "dayjs";
import { AlertTriangle } from "lucide-react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseFilterSelect from "@/Components/ui/CustomUi/ReuseForm/ReuseFilterSelect";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import { DatePicker } from "@/Components/ui/CustomUi/ReuseForm/ReuseDatePicker";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { formatMoney } from "@/utils/money";
import { formatDate } from "@/utils/dateFormet";
import { useGetLedgerQuery, useGetLedgerSummaryQuery } from "@/redux/features/finance/financeApi";
import type { IFinanceLedgerEntry, TLedgerDirection, TLedgerEntryType } from "@/types";

const queryErrorMessage = (error: unknown): string => {
  const data = (error as { data?: { message?: string } } | undefined)?.data;
  return data?.message || "Couldn't load this data — the filters above may be invalid.";
};

const TYPE_OPTIONS: { value: TLedgerEntryType; label: string }[] = [
  { value: "SALE", label: "Sale" },
  { value: "COGS", label: "COGS" },
  { value: "PURCHASE", label: "Purchase" },
  { value: "EXPENSE", label: "Expense" },
  { value: "REFUND", label: "Refund" },
  { value: "COD_FEE", label: "COD Fee" },
  { value: "DELIVERY_COST", label: "Delivery Cost" },
  { value: "RTO_COST", label: "RTO Cost" },
  { value: "MARKETING_COST", label: "Marketing Cost" },
  { value: "ADJUSTMENT", label: "Adjustment" },
];

const DIRECTION_OPTIONS: { value: TLedgerDirection; label: string }[] = [
  { value: "CREDIT", label: "Credit" },
  { value: "DEBIT", label: "Debit" },
];

const RevenuePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TLedgerEntryType | "">("");
  const [direction, setDirection] = useState<TLedgerDirection | "">("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  // A bare .toISOString() on a midnight-local Date would silently exclude
  // almost all of the "to" day — anchor from/to to the actual day bounds.
  const from = fromDate ? dayjs(fromDate).startOf("day").toISOString() : undefined;
  const to = toDate ? dayjs(toDate).endOf("day").toISOString() : undefined;

  const { data: ledgerRes, isFetching, isError: ledgerErrored, error: ledgerError } = useGetLedgerQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined, type: type || undefined, direction: direction || undefined, from, to },
    { refetchOnMountOrArgChange: true }
  );
  const { data: summaryRes, isError: summaryErrored, error: summaryError } = useGetLedgerSummaryQuery({ from, to });

  // Both queries share the same from/to, so an invalid range (from > to,
  // rejected by the backend's own validRange check) fails both at once —
  // without this, the page falls back to `?? 0`/`?? []` everywhere and looks
  // like a legitimate "no activity" result instead of an invalid filter.
  const hasError = ledgerErrored || summaryErrored;
  const errorMessage = queryErrorMessage(ledgerError ?? summaryError);

  const ledger = ledgerRes?.data?.data ?? [];
  const meta = ledgerRes?.data?.meta;
  const summary = summaryRes?.data;

  const columns: Column<IFinanceLedgerEntry>[] = [
    { header: "Order #", accessorKey: "orderNumber" },
    { header: "Type", accessorKey: "type" },
    {
      header: "Direction",
      accessorKey: "direction",
      render: (v) => <Tag theme={v === "CREDIT" ? "success" : "error"}>{v as string}</Tag>,
    },
    { header: "Amount", accessorKey: "amountInPoisha", render: (v) => formatMoney(v as number) },
    { header: "Source", accessorKey: "source" },
    { header: "Note", accessorKey: "note" },
    { header: "Created By", accessorKey: "createdBy", render: (_v, row) => row.createdBy?.name ?? "—" },
    { header: "Date", accessorKey: "createdAt", render: (v) => formatDate(v as string) },
  ];

  return (
    <PageWraper title="Ledger / Revenue" description="Every SALE, COGS, REFUND and cost posting, append-only.">
      {hasError ? (
        <div className="mb-5 flex gap-3 items-start rounded-md border border-destructive/30 bg-destructive/5 p-4">
          <AlertTriangle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm text-destructive">{errorMessage}</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Credits</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatMoney(summary?.creditsInPoisha ?? 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Debits</p>
            <p className="text-2xl font-bold text-destructive mt-1">{formatMoney(summary?.debitsInPoisha ?? 0)}</p>
          </div>
          <div className="bg-white rounded-xl border border-border p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className="text-2xl font-bold text-foreground mt-1">{formatMoney(summary?.balanceInPoisha ?? 0)}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <ReuseSearchInput setSearch={(v) => { setSearch(v); setCurrentPage(1); }} setPage={setCurrentPage} placeholder="Search by order # or note..." className="max-w-md" />
        <ReuseFilterSelect label="Type" options={TYPE_OPTIONS} value={type} onChange={(v) => { setType(v as TLedgerEntryType); setCurrentPage(1); }} allowClear onClear={() => setType("")} />
        <ReuseFilterSelect label="Direction" options={DIRECTION_OPTIONS} value={direction} onChange={(v) => { setDirection(v as TLedgerDirection); setCurrentPage(1); }} allowClear onClear={() => setDirection("")} />
        <DatePicker value={fromDate} onChange={(d) => { setFromDate(d); setCurrentPage(1); }} placeholder="From date" className="p-0 w-auto" />
        <DatePicker value={toDate} onChange={(d) => { setToDate(d); setCurrentPage(1); }} placeholder="To date" className="p-0 w-auto" />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center"><SpinLoader /></div>
        ) : hasError ? (
          <p className="text-center text-sm text-muted-foreground py-8">Fix the filters above to see ledger entries.</p>
        ) : (
          <ReusableTable data={ledger} columns={columns} pagination currentPage={currentPage} setCurrentPage={setCurrentPage} limit={10} total={meta?.total ?? 0} />
        )}
      </div>
    </PageWraper>
  );
};

export default RevenuePage;
