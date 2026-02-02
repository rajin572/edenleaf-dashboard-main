import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";
import { useGetProductsQuery } from "@/redux/features/product/productApi";
import { useGetVariantsQuery } from "@/redux/features/product/productVariantApi";
import { useCreateManualOrderMutation } from "@/redux/features/order/orderApi";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { formatMoney } from "@/utils/money";
import type { IManualOrderCreatePayload, TOrderSource, TPaymentMethod } from "@/types";

/** A locally-picked order line — not the wire shape (that's just
 *  {variantId, quantity}); the extra fields are display-only. */
interface PickedItem {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPriceInPoisha: number;
  quantity: number;
  stock: number;
}

const SOURCE_OPTIONS: { value: Exclude<TOrderSource, "WEBSITE">; label: string }[] = [
  { value: "PHONE", label: "Phone Call" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "FACEBOOK", label: "Facebook" },
  { value: "OFFLINE", label: "Offline / Walk-in" },
];

const ManualOrdersPage = () => {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [district, setDistrict] = useState("");
  const [thana, setThana] = useState("");
  const [area, setArea] = useState("");
  const [postcode, setPostcode] = useState("");
  const [source, setSource] = useState<Exclude<TOrderSource, "WEBSITE">>("PHONE");
  const [paymentMethod, setPaymentMethod] = useState<TPaymentMethod>("COD");
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [items, setItems] = useState<PickedItem[]>([]);

  const [pickerProductId, setPickerProductId] = useState("");
  const [pickerVariantId, setPickerVariantId] = useState("");
  const [pickerQuantity, setPickerQuantity] = useState(1);

  const idempotencyKey = useRef(crypto.randomUUID());
  const [createManualOrder, { isLoading }] = useCreateManualOrderMutation();

  const { data: productsRes } = useGetProductsQuery({ limit: 100, status: "published" });
  const products = productsRes?.data.data ?? [];

  const { data: variantsRes } = useGetVariantsQuery(pickerProductId, { skip: !pickerProductId });
  const pickerVariants = variantsRes?.data ?? [];
  const pickedVariantIds = items.map((i) => i.variantId);

  const handleAddItem = () => {
    const variant = pickerVariants.find((v) => v._id === pickerVariantId);
    const product = products.find((p) => p._id === pickerProductId);
    if (!variant || !product || pickedVariantIds.includes(variant._id)) return;
    setItems((prev) => [...prev, {
      variantId: variant._id,
      productName: product.name,
      variantName: variant.name,
      sku: variant.sku,
      unitPriceInPoisha: variant.priceInPoisha,
      quantity: pickerQuantity,
      stock: variant.stock,
    }]);
    setPickerVariantId("");
    setPickerQuantity(1);
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setItems((prev) => prev.map((i) => (i.variantId === variantId ? { ...i, quantity: Math.max(1, Math.min(i.stock, i.quantity + delta)) } : i)));
  };

  const removeItem = (variantId: string) => setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const estimatedSubtotalInPoisha = useMemo(
    () => items.reduce((sum, i) => sum + i.unitPriceInPoisha * i.quantity, 0),
    [items],
  );

  const resetForm = () => {
    setCustomerName(""); setPhone(""); setEmail("");
    setStreet(""); setDistrict(""); setThana(""); setArea(""); setPostcode("");
    setSenderNumber(""); setTrxId(""); setCouponCode(""); setItems([]);
    setPickerProductId(""); setPickerVariantId(""); setPickerQuantity(1);
  };

  const handlePlaceOrder = async () => {
    if (!customerName.trim() || !phone.trim()) { toast.error("Customer name and phone are required"); return; }
    if (!street.trim() || !district.trim() || !thana.trim()) { toast.error("Full shipping address is required"); return; }
    if (items.length === 0) { toast.error("Add at least one product to the order"); return; }

    const body: IManualOrderCreatePayload & { idempotencyKey: string } = {
      customer: { name: customerName, phone, ...(email ? { email } : {}) },
      shippingAddress: { name: customerName, phone, district, thana, street, ...(area ? { area } : {}), ...(postcode ? { postcode } : {}) },
      items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      paymentMethod,
      ...(paymentMethod !== "COD" ? { manualPaymentSenderNumber: senderNumber, manualPaymentTrxId: trxId } : {}),
      ...(couponCode ? { couponCode } : {}),
      source,
      idempotencyKey: idempotencyKey.current,
    };

    const res = await tryCatchWrapper(
      createManualOrder,
      { body },
      { toastLoadingMessage: "Placing order..." },
    );
    if (res?.success) {
      idempotencyKey.current = crypto.randomUUID();
      resetForm();
    }
  };

  return (
    <PageWraper
      title="Create Manual Order"
      description="Create orders manually for offline, phone, or WhatsApp customers."
      actions={
        <Button className="bg-primary hover:bg-primary-dark text-white" disabled={isLoading} onClick={handlePlaceOrder}>
          <ShoppingCart className="mr-2 size-4" /> Place Order
        </Button>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Customer Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                <Input placeholder="01XXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <Input placeholder="Full Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (optional)</label>
                <Input placeholder="customer@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Products</h2>
            </div>
            {items.length === 0 ? (
              <div className="border border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 mb-4">
                No products added yet. Pick a product and variant below to add it to this order.
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName} — {item.variantName}</p>
                      <p className="text-xs text-secondbase-color">{item.sku} · {formatMoney(item.unitPriceInPoisha)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="size-7" onClick={() => updateQuantity(item.variantId, -1)}><Minus className="size-3" /></Button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <Button variant="outline" size="icon" className="size-7" onClick={() => updateQuantity(item.variantId, 1)}><Plus className="size-3" /></Button>
                    </div>
                    <span className="w-20 text-right text-sm font-bold">{formatMoney(item.unitPriceInPoisha * item.quantity)}</span>
                    <Button variant="ghost" size="icon" className="size-7 text-red-500" onClick={() => removeItem(item.variantId)}><X className="size-4" /></Button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-[1fr_1fr_80px_auto] gap-2 items-end border-t border-border pt-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Product</label>
                <select
                  value={pickerProductId}
                  onChange={(e) => { setPickerProductId(e.target.value); setPickerVariantId(""); }}
                  className="w-full h-9 px-2 border border-input rounded-md text-sm"
                >
                  <option value="">Select product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Variant</label>
                <select
                  value={pickerVariantId}
                  onChange={(e) => setPickerVariantId(e.target.value)}
                  disabled={!pickerProductId}
                  className="w-full h-9 px-2 border border-input rounded-md text-sm disabled:opacity-50"
                >
                  <option value="">Select variant</option>
                  {pickerVariants.filter((v) => !pickedVariantIds.includes(v._id)).map((v) => (
                    <option key={v._id} value={v._id}>{v.name} — {formatMoney(v.priceInPoisha)} (stock {v.stock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={pickerQuantity}
                  onChange={(e) => setPickerQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full h-9 px-2 border border-input rounded-md text-sm"
                />
              </div>
              <Button type="button" size="sm" disabled={!pickerVariantId} onClick={handleAddItem}>Add</Button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4">Shipping Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                <Input placeholder="House/Road/Area" value={street} onChange={(e) => setStreet(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                <Input placeholder="Dhaka" value={district} onChange={(e) => setDistrict(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thana</label>
                <Input placeholder="Dhanmondi" value={thana} onChange={(e) => setThana(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (optional)</label>
                <Input placeholder="Road 4" value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Postcode (optional)</label>
                <Input placeholder="1205" value={postcode} onChange={(e) => setPostcode(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Source</label>
                <select value={source} onChange={(e) => setSource(e.target.value as Exclude<TOrderSource, "WEBSITE">)} className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {SOURCE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Estimated Subtotal</span>
                <span className="font-medium">{formatMoney(estimatedSubtotalInPoisha)}</span>
              </div>
              <p className="text-xs text-gray-400">
                Discount and delivery fee are calculated by the server from the coupon code and shipping district when the order is placed.
              </p>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code (optional)</label>
              <Input placeholder="e.g. WELCOME10" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
            </div>

            <h3 className="text-sm font-bold mt-6 mb-2">Payment Method</h3>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as TPaymentMethod)} className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring mb-4">
              <option value="COD">Cash on Delivery (COD)</option>
              <option value="BKASH_MANUAL">bKash (Manual)</option>
              <option value="NAGAD_MANUAL">Nagad (Manual)</option>
            </select>

            {paymentMethod !== "COD" && (
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sender Number</label>
                  <Input placeholder="01XXXXXXXXX" value={senderNumber} onChange={(e) => setSenderNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                  <Input placeholder="e.g. 8N7K2X4PQ1" value={trxId} onChange={(e) => setTrxId(e.target.value)} />
                </div>
              </div>
            )}

            <Button className="w-full bg-primary hover:bg-primary-dark text-white h-12 text-base" disabled={isLoading} onClick={handlePlaceOrder}>
              Place Order
            </Button>
          </div>
        </div>
      </div>
    </PageWraper>
  );
};

export default ManualOrdersPage;
