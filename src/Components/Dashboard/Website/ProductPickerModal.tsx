import { useState } from "react";
import ReusableModal from "@/Components/ui/CustomUi/ReuseableModal";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Search } from "lucide-react";
import type { IProduct } from "@/types";
import { formatMoney } from "@/utils/money";

interface ProductPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** Products already placed elsewhere are excluded by the caller before passing this in. */
  availableProducts: IProduct[];
  onAdd: (productIds: string[]) => void;
}

export default function ProductPickerModal({ open, onOpenChange, title, description, availableProducts, onAdd }: ProductPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = availableProducts.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleClose = (next: boolean) => {
    if (!next) { setSearch(""); setSelected([]); }
    onOpenChange(next);
  };

  const handleAdd = () => {
    onAdd(selected);
    handleClose(false);
  };

  return (
    <ReusableModal
      open={open}
      onOpenChange={handleClose}
      title={title}
      description={description}
      footer={
        <Button onClick={handleAdd} disabled={selected.length === 0}>
          Add {selected.length > 0 ? selected.length : ""} Product{selected.length === 1 ? "" : "s"}
        </Button>
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 size-4" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="pl-10 border-[#E5E5E5] bg-[#F5F5F5]" />
        </div>

        <div className="max-h-80 overflow-y-auto space-y-1 -mx-1 px-1">
          {filtered.length === 0 && <p className="text-sm text-secondbase-color text-center py-6">No matching products.</p>}
          {filtered.map((product) => {
            const isSelected = selected.includes(product._id);
            return (
              <label
                key={product._id}
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-secondary-color/5" : ""}`}
              >
                <input type="checkbox" checked={isSelected} onChange={() => toggle(product._id)} className="size-4 accent-secondary-color" />
                <img src={product.images[0]} alt={product.name} className="size-9 rounded-md border border-border object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.name}</p>
                  <p className="text-xs text-secondbase-color">{formatMoney(product.priceInPoisha)} · {product.unit}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>
    </ReusableModal>
  );
}
