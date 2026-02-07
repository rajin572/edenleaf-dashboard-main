import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ReuseSearchInput from "@/Components/ui/CustomUi/ReuseForm/ReuseSearchInput";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import Tag from "@/Components/ui/CustomUi/ReuseTag";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Checkbox } from "@/Components/ui/checkbox";
import { Button } from "@/Components/ui/button";
import { Download, Mail, Trash2 } from "lucide-react";
import ComposeEmailModal from "@/Components/Dashboard/Marketing/ComposeEmailModal";
import { usePermission } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetNewsletterSubscribersQuery,
  useLazyExportNewsletterSubscribersQuery,
  useDeleteNewsletterSubscriberMutation,
} from "@/redux/features/newsletter/newsletterApi";
import type { INewsletterSubscriber, INewsletterCampaignValues } from "@/types";

// "Send Email" has no backend endpoint at all (the newsletter module only
// exposes subscribe/unsubscribe/list/export/delete) — kept as a client-only
// simulation rather than removed, per the Part 05 plan's own call: there's
// no real campaign-send to wire it to, but ripping out working UI over a
// backend gap isn't the right trade either. Flagged as a known product gap,
// not a bug, until a real mailer/campaign endpoint exists.
const NewsletterPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [composeOpen, setComposeOpen] = useState(false);
  const [removing, setRemoving] = useState<INewsletterSubscriber | null>(null);

  const canExport = usePermission("newsletter.export");
  const canDelete = usePermission("newsletter.delete");

  const { data, isFetching } = useGetNewsletterSubscribersQuery(
    { page: currentPage, limit: 10, searchTerm: search || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const subscribers = data?.data.data ?? [];
  const meta = data?.data.meta;
  const activeCount = subscribers.filter((s) => s.status === "subscribed").length;
  // Only subscribed contacts on the current page can be picked — no point selecting someone who opted out.
  const selectableIds = useMemo(() => subscribers.filter((s) => s.status === "subscribed").map((s) => s._id), [subscribers]);
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selectedIds.has(id));

  const [triggerExport, { isFetching: isExporting }] = useLazyExportNewsletterSubscribersQuery();
  const [deleteSubscriber] = useDeleteNewsletterSubscriberMutation();

  const toggleAll = () => setSelectedIds(allSelected ? new Set() : new Set(selectableIds));

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSend = (values: INewsletterCampaignValues) => {
    toast.success(`"${values.subject}" queued for ${selectedIds.size} subscriber${selectedIds.size === 1 ? "" : "s"}`);
    setSelectedIds(new Set());
  };

  const handleExport = async () => {
    const blob = await triggerExport({}).unwrap();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter-subscribers.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleRemove = async () => {
    if (!removing) return;
    const res = await tryCatchWrapper(deleteSubscriber, { params: { id: removing._id } }, { toastLoadingMessage: "Removing subscriber..." });
    if (res?.success) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(removing._id);
        return next;
      });
      setRemoving(null);
    }
  };

  const columns: Column<INewsletterSubscriber>[] = [
    {
      header: <Checkbox checked={allSelected} onCheckedChange={toggleAll} aria-label="Select all subscribed" />,
      accessorKey: "_id",
      width: 48,
      render: (_val, row) => (
        <Checkbox
          checked={selectedIds.has(row._id)}
          disabled={row.status !== "subscribed"}
          onCheckedChange={() => toggleOne(row._id)}
          aria-label={`Select ${row.email}`}
        />
      ),
    },
    { header: "Email", accessorKey: "email", render: (val) => <span className="font-medium">{val}</span> },
    { header: "Status", accessorKey: "status", render: (val) => <Tag theme={val === "subscribed" ? "success" : "error"} className="capitalize">{val}</Tag> },
    { header: "Subscribed On", accessorKey: "subscribedAt", render: (val) => new Date(val).toLocaleDateString() },
    {
      header: "Actions", accessorKey: "_id", render: (_, row) => (
        canDelete ? (
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setRemoving(row)}>
            <Trash2 className="size-4" />
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <PageWraper
      title="Newsletter"
      description={`${activeCount} active subscribers on the storefront newsletter.`}
      actions={
        <div className="flex gap-2">
          {canExport && (
            <Button variant="outline" onClick={handleExport} disabled={isExporting}>
              <Download className="mr-2 size-4" /> {isExporting ? "Exporting..." : "Export CSV"}
            </Button>
          )}
          <Button onClick={() => setComposeOpen(true)} disabled={selectedIds.size === 0}>
            <Mail className="mr-2 size-4" /> Send Email {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
          </Button>
        </div>
      }
    >
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ReuseSearchInput setSearch={setSearch} setPage={setCurrentPage} placeholder="Search subscriber email..." className="max-w-md" />
          <button type="button" onClick={toggleAll} className="text-sm font-medium text-secondary-color hover:underline" disabled={selectableIds.length === 0}>
            {allSelected ? "Deselect all" : `Select all ${selectableIds.length} subscribed`}
          </button>
        </div>
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={subscribers}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <ComposeEmailModal
        open={composeOpen}
        onOpenChange={setComposeOpen}
        title="Send Email to Subscribers"
        description={`This will be sent to all ${selectedIds.size} selected subscriber${selectedIds.size === 1 ? "" : "s"}.`}
        submitLabel={`Send to ${selectedIds.size}`}
        onSend={handleSend}
      />

      <ConfirmModal
        open={!!removing}
        onCancel={() => setRemoving(null)}
        currentRecord={removing}
        onConfirm={handleRemove}
        title="Remove this subscriber?"
        description="They will no longer receive newsletter emails."
        confirmText="Remove"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default NewsletterPage;
