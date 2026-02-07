import { useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import ReusableTable, { Column } from "@/Components/ui/CustomUi/ReuseableTable";
import ConfirmModal from "@/Components/ui/CustomUi/Modal/ConfirmModal";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Switch } from "@/Components/ui/switch";
import { Plus, Edit, Trash2, ImagePlus, ImageIcon, ArrowUp, ArrowDown, ArrowUpRight } from "lucide-react";
import BannerFormModal from "@/Components/Dashboard/Website/BannerFormModal";
import { usePermission } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import {
  useGetBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useToggleBannerActiveMutation,
  useReorderBannerMutation,
  useDeleteBannerMutation,
} from "@/redux/features/banner/bannerApi";
import type { IBanner, IBannerFormValues, IBannerPlacement } from "@/types";

type MarketingPlacement = Exclude<IBannerPlacement, "hero">;

const slotDetails: Record<MarketingPlacement, { title: string; location: string; shape: string; previewClassName: string }> = {
  hero_side: {
    title: "Hero right image",
    location: "Beside the homepage hero slider",
    shape: "Square image recommended",
    previewClassName: "aspect-square",
  },
  marketing_left: {
    title: "Marketing banner 1",
    location: "Left image in the row below the hero",
    shape: "Wide image recommended",
    previewClassName: "aspect-[2.3/1]",
  },
  marketing_right: {
    title: "Marketing banner 2",
    location: "Right image in the row below the hero",
    shape: "Wide image recommended",
    previewClassName: "aspect-[2.3/1]",
  },
};

interface MarketingSlotCardProps {
  placement: MarketingPlacement;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onAdd: (placement: IBannerPlacement) => void;
  onEdit: (banner: IBanner) => void;
  onToggle: (banner: IBanner) => void;
  onDelete: (banner: IBanner) => void;
}

const MarketingSlotCard = ({ placement, canCreate, canUpdate, canDelete, onAdd, onEdit, onToggle, onDelete }: MarketingSlotCardProps) => {
  const slot = slotDetails[placement];
  const { data, isLoading, isError } = useGetBannersQuery(
    { page: 1, limit: 1, placement },
    { refetchOnMountOrArgChange: true }
  );
  const banner = data?.data.data[0];

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#e9e7df] bg-white p-3 shadow-[0_18px_50px_-30px_rgba(10,20,18,0.65)] transition-transform duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3 px-2 py-2">
        <div>
          <h3 className="font-semibold text-foreground">{slot.title}</h3>
          <p className="mt-1 text-xs text-secondbase-color">{slot.location}</p>
        </div>
        {banner && <Switch checked={banner.isActive} disabled={!canUpdate} onCheckedChange={() => onToggle(banner)} aria-label={`Show ${slot.title} on storefront`} />}
      </div>

      <div className={`relative flex w-full items-center justify-center overflow-hidden rounded-[1.15rem] border border-[#e7e5df] bg-[#f5f3ed] ${slot.previewClassName}`}>
        {isLoading ? (
          <SpinLoader />
        ) : isError ? (
          <p className="px-4 text-center text-sm text-red-600">Could not load this banner.</p>
        ) : banner ? (
          <img src={banner.image} alt={banner.title} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" />
        ) : (
          <div className="flex flex-col items-center gap-3 px-4 text-center text-secondbase-color">
            <div className="rounded-full border border-[#dedbd2] bg-white p-4 shadow-sm"><ImageIcon className="size-6" aria-hidden="true" /></div>
            <span className="text-sm font-medium">Image ready to upload</span>
          </div>
        )}
        <span className="absolute bottom-3 left-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#253b31] shadow-sm">{slot.shape}</span>
      </div>

      <div className="mt-3 min-h-8 px-2">
        {banner && <p className="flex items-center gap-1 truncate text-xs text-secondbase-color"><ArrowUpRight className="size-3 shrink-0" /> {banner.destinationUrl}</p>}
      </div>

      {!isError && !isLoading && (
        <div className="mt-auto flex items-center gap-2 px-2 pb-2 pt-3">
          {banner ? (
            <>
              {canUpdate && <Button variant="outline" size="sm" className="border-[#d9ded8] bg-white text-[#1b3327] hover:bg-[#f2f5ef] hover:text-[#1b3327]" onClick={() => onEdit(banner)}><Edit className="mr-2 size-4" /> Update banner</Button>}
              {canDelete && <Button variant="ghost" size="icon" className="text-red-500" aria-label={`Delete ${slot.title}`} onClick={() => onDelete(banner)}><Trash2 className="size-4" /></Button>}
            </>
          ) : canCreate ? (
            <Button variant="outline" size="sm" className="border-[#d9ded8] bg-white text-[#1b3327] hover:bg-[#f2f5ef] hover:text-[#1b3327]" onClick={() => onAdd(placement)}><ImagePlus className="mr-2 size-4" /> Upload image</Button>
          ) : null}
        </div>
      )}
    </article>
  );
};

const BannersPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reorderingId, setReorderingId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<IBanner | null>(null);
  const [deleting, setDeleting] = useState<IBanner | null>(null);
  const [placement, setPlacement] = useState<IBannerPlacement>("hero");

  const canCreate = usePermission("banner.create");
  const canUpdate = usePermission("banner.update");
  const canDelete = usePermission("banner.delete");

  const { data, isFetching } = useGetBannersQuery(
    { page: currentPage, limit: 10, placement: "hero" },
    { refetchOnMountOrArgChange: true }
  );
  const banners = data?.data.data ?? [];
  const meta = data?.data.meta;

  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [toggleBannerActive] = useToggleBannerActiveMutation();
  const [reorderBanner] = useReorderBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();

  const openAddModal = (nextPlacement: IBannerPlacement) => {
    setPlacement(nextPlacement);
    setEditing(null);
    setModalOpen(true);
  };

  const openEditModal = (banner: IBanner) => {
    setPlacement(banner.placement);
    setEditing(banner);
    setModalOpen(true);
  };

  const handleSave = async (values: IBannerFormValues, image?: File) => {
    const formData = new FormData();
    formData.append("data", JSON.stringify(values));
    if (image) formData.append("image", image);
    const result = editing
      ? await tryCatchWrapper(updateBanner, { body: formData, params: { id: editing._id } }, { toastLoadingMessage: "Saving banner..." })
      : await tryCatchWrapper(createBanner, { body: formData }, { toastLoadingMessage: "Creating banner..." });
    if (result?.success) setModalOpen(false);
  };

  const handleToggleActive = (banner: IBanner) => {
    tryCatchWrapper(
      toggleBannerActive,
      { params: { id: banner._id }, body: { isActive: !banner.isActive } },
      { toastLoadingMessage: banner.isActive ? "Hiding banner..." : "Showing banner..." }
    );
  };

  const handleDelete = async () => {
    if (!deleting) return;
    const res = await tryCatchWrapper(deleteBanner, { params: { id: deleting._id } }, { toastLoadingMessage: "Deleting banner..." });
    if (res?.success) setDeleting(null);
  };

  const handleReorder = async (banner: IBanner, direction: "up" | "down") => {
    setReorderingId(banner._id);
    await tryCatchWrapper(reorderBanner, { params: { id: banner._id }, body: { direction } }, { toastLoadingMessage: "Updating banner order..." });
    setReorderingId(null);
  };

  const columns: Column<IBanner>[] = [
    {
      header: "Position",
      accessorKey: "order",
      width: 80,
      render: (_, row, index) => (
        <div className="flex items-center gap-2">
          <span className="w-7 text-sm font-semibold tabular-nums text-foreground">{String((currentPage - 1) * 10 + index + 1).padStart(2, "0")}</span>
          {canUpdate && <div className="flex flex-col">
            <button type="button" aria-label={`Move banner ${index + 1} up`} disabled={reorderingId !== null || (currentPage === 1 && index === 0)} onClick={() => handleReorder(row, "up")} className="rounded p-0.5 text-secondbase-color hover:bg-[#f1f3ee] hover:text-foreground disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
            <button type="button" aria-label={`Move banner ${index + 1} down`} disabled={reorderingId !== null || (currentPage - 1) * 10 + index + 1 >= (meta?.total ?? 0)} onClick={() => handleReorder(row, "down")} className="rounded p-0.5 text-secondbase-color hover:bg-[#f1f3ee] hover:text-foreground disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
          </div>}
        </div>
      ),
    },
    {
      header: "Banner",
      accessorKey: "image",
      render: (val, row) => <img src={val} alt={row.title} className="w-24 h-12 object-cover rounded-md border border-border" />,
    },
    {
      header: "Destination",
      accessorKey: "title",
      render: (_, row) => (
        <div>
          <p className="font-semibold">Hero banner {String((currentPage - 1) * 10 + banners.indexOf(row) + 1).padStart(2, "0")}</p>
          <p className="text-xs text-secondbase-color">{row.destinationUrl}</p>
        </div>
      ),
    },
    {
      header: "Active",
      accessorKey: "isActive",
      render: (val, row) => <Switch checked={val} disabled={!canUpdate} onCheckedChange={() => handleToggleActive(row)} />,
    },
    {
      header: "Actions",
      accessorKey: "_id",
      render: (_, row) => (
        <div className="flex gap-2">
          {canUpdate && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50" onClick={() => openEditModal(row)}>
              <Edit className="size-4" />
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 bg-red-50" onClick={() => setDeleting(row)}>
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <PageWraper
      title="Banner Management"
      description="Manage the homepage hero slider and promotional banners."
      actions={
        canCreate ? (
          <Button onClick={() => openAddModal("hero")}>
            <Plus className="mr-2 size-4" /> Add Hero Banner
          </Button>
        ) : undefined
      }
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Hero slider banners</h2>
        <p className="text-sm text-secondbase-color">These banners rotate in the main homepage hero area. Use the arrows to set their order.</p>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        {isFetching ? (
          <div className="py-20 flex justify-center">
            <SpinLoader />
          </div>
        ) : (
          <ReusableTable
            data={banners}
            columns={columns}
            pagination
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            limit={10}
            total={meta?.total ?? 0}
          />
        )}
      </div>

      <section className="rounded-[2rem] border border-[#e7e8de] bg-[#f4f5ed] p-5 shadow-sm md:p-8" aria-labelledby="hero-side-heading">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#54735c]">Hero composition</p>
          <h2 id="hero-side-heading" className="text-2xl font-semibold tracking-tight text-[#182c23]">Hero right image</h2>
          <p className="mt-2 text-sm text-[#5f7063]">The square image displayed beside the homepage slider.</p>
        </div>
        <div className="max-w-md">
          <MarketingSlotCard placement="hero_side" canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} onAdd={openAddModal} onEdit={openEditModal} onToggle={handleToggleActive} onDelete={setDeleting} />
        </div>
      </section>

      <section className="rounded-[2rem] bg-[#182c23] p-5 text-white shadow-[0_24px_60px_-32px_rgba(10,35,24,0.8)] md:p-8" aria-labelledby="marketing-images-heading">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#b7d4b8]">Below the hero</p>
          <h2 id="marketing-images-heading" className="text-2xl font-semibold tracking-tight">Marketing banners</h2>
          <p className="mt-2 text-sm text-[#d0dbd0]">Two wide images shown side by side below the hero.</p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {(["marketing_left", "marketing_right"] as const).map((slotPlacement) => (
            <MarketingSlotCard key={slotPlacement} placement={slotPlacement} canCreate={canCreate} canUpdate={canUpdate} canDelete={canDelete} onAdd={openAddModal} onEdit={openEditModal} onToggle={handleToggleActive} onDelete={setDeleting} />
          ))}
        </div>
      </section>

      <BannerFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        editing={editing}
        placement={placement}
        slotLabel={placement === "hero" ? "Hero Banner" : slotDetails[placement].title}
        onSave={handleSave}
      />

      <ConfirmModal
        open={!!deleting}
        onCancel={() => setDeleting(null)}
        currentRecord={deleting}
        onConfirm={handleDelete}
        title="Delete this banner?"
        description="It will be removed from the storefront."
        confirmText="Delete"
        variant="danger"
        iconPreset="delete"
      />
    </PageWraper>
  );
};

export default BannersPage;
