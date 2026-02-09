import { useEffect, useState } from "react";
import PageWraper from "@/Components/ui/CustomUi/PageWraper";
import SpinLoader from "@/Components/ui/CustomUi/SpinLoader";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Switch } from "@/Components/ui/switch";
import { Save, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toPoisha, fromPoisha } from "@/utils/money";
import { usePermission } from "@/hooks/usePermission";
import tryCatchWrapper from "@/utils/tryCatchWrapper";
import { BD_PHONE_REGEX, BD_PHONE_ERROR } from "@/utils/phoneValidation";
import {
  useGetSettingsQuery,
  useUpdateSettingsMutation,
  useUpdateShippingSettingsMutation,
} from "@/redux/features/settings/settingsApi";
import type { IShippingZone } from "@/types";

const TABS = ["General", "Payment Gateways", "Shipping & Delivery", "SEO Settings"] as const;
type Tab = typeof TABS[number];

type ShippingZoneDraft = { code: string; name: string; districtsText: string; feeInTaka: number };

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState<Tab>("General");

  const { data, isFetching } = useGetSettingsQuery();
  const settings = data?.data;

  const [updateSettings] = useUpdateSettingsMutation();
  const [updateShippingSettings] = useUpdateShippingSettingsMutation();

  const canUpdate = usePermission("settings.update");
  const canShip = usePermission("settings.shipping");

  const [general, setGeneral] = useState({ storeName: "", tagline: "", email: "", phone: "", address: "", lowStockThreshold: 5 });
  const [payment, setPayment] = useState({ codEnabled: true, bkashEnabled: false, nagadEnabled: false, bkashNumber: "", nagadNumber: "" });
  const [shipping, setShipping] = useState<{ zones: ShippingZoneDraft[]; defaultFeeInTaka: number; freeShippingEnabled: boolean; freeShippingThresholdInTaka: number }>({
    zones: [], defaultFeeInTaka: 0, freeShippingEnabled: false, freeShippingThresholdInTaka: 0,
  });
  const [seo, setSeo] = useState({ metaTitle: "", metaDescription: "" });
  const [phoneErrors, setPhoneErrors] = useState<{ phone?: string; bkashNumber?: string; nagadNumber?: string }>({});

  const isValidPhone = (value: string) => value.trim() === "" || BD_PHONE_REGEX.test(value.trim());

  useEffect(() => {
    if (!settings) return;
    setGeneral({
      storeName: settings.storeName, tagline: settings.tagline, email: settings.email,
      phone: settings.phone, address: settings.address, lowStockThreshold: settings.lowStockThreshold,
    });
    setPayment({
      codEnabled: settings.codEnabled, bkashEnabled: settings.bkashEnabled, nagadEnabled: settings.nagadEnabled,
      bkashNumber: settings.bkashNumber, nagadNumber: settings.nagadNumber,
    });
    setShipping({
      zones: settings.shipping.zones.map((z) => ({ code: z.code, name: z.name, districtsText: z.districts.join(", "), feeInTaka: fromPoisha(z.feeInPoisha) })),
      defaultFeeInTaka: fromPoisha(settings.shipping.defaultFeeInPoisha),
      freeShippingEnabled: settings.shipping.freeShippingThresholdInPoisha !== null,
      freeShippingThresholdInTaka: settings.shipping.freeShippingThresholdInPoisha !== null ? fromPoisha(settings.shipping.freeShippingThresholdInPoisha) : 0,
    });
    setSeo({ metaTitle: settings.seo.metaTitle, metaDescription: settings.seo.metaDescription });
  }, [settings]);

  const addZone = () => setShipping((s) => ({ ...s, zones: [...s.zones, { code: "", name: "", districtsText: "", feeInTaka: 0 }] }));
  const removeZone = (index: number) => setShipping((s) => ({ ...s, zones: s.zones.filter((_, i) => i !== index) }));
  const updateZone = (index: number, patch: Partial<ShippingZoneDraft>) =>
    setShipping((s) => ({ ...s, zones: s.zones.map((z, i) => (i === index ? { ...z, ...patch } : z)) }));

  const handleSaveGeneral = () => {
    if (!isValidPhone(general.phone)) {
      setPhoneErrors((e) => ({ ...e, phone: BD_PHONE_ERROR }));
      return;
    }
    setPhoneErrors((e) => ({ ...e, phone: undefined }));

    return tryCatchWrapper(updateSettings, {
      body: {
        storeName: general.storeName, tagline: general.tagline, email: general.email,
        phone: general.phone, address: general.address, lowStockThreshold: general.lowStockThreshold,
      },
    }, { toastLoadingMessage: "Saving store info..." });
  };

  const handleSavePayment = () => {
    const bkashValid = isValidPhone(payment.bkashNumber);
    const nagadValid = isValidPhone(payment.nagadNumber);
    if (!bkashValid || !nagadValid) {
      setPhoneErrors((e) => ({
        ...e,
        bkashNumber: bkashValid ? undefined : BD_PHONE_ERROR,
        nagadNumber: nagadValid ? undefined : BD_PHONE_ERROR,
      }));
      return;
    }
    setPhoneErrors((e) => ({ ...e, bkashNumber: undefined, nagadNumber: undefined }));

    return tryCatchWrapper(updateSettings, {
      body: {
        codEnabled: payment.codEnabled, bkashEnabled: payment.bkashEnabled, nagadEnabled: payment.nagadEnabled,
        bkashNumber: payment.bkashNumber, nagadNumber: payment.nagadNumber,
      },
    }, { toastLoadingMessage: "Saving payment settings..." });
  };

  const handleSaveSeo = () =>
    tryCatchWrapper(updateSettings, {
      body: { seo: { metaTitle: seo.metaTitle, metaDescription: seo.metaDescription } },
    }, { toastLoadingMessage: "Saving SEO settings..." });

  const handleSaveShipping = () => {
    const zones: IShippingZone[] = shipping.zones.map((z) => ({
      code: z.code, name: z.name,
      districts: z.districtsText.split(",").map((d) => d.trim()).filter(Boolean),
      feeInPoisha: toPoisha(z.feeInTaka),
    }));
    return tryCatchWrapper(updateShippingSettings, {
      body: {
        shipping: {
          zones,
          defaultFeeInPoisha: toPoisha(shipping.defaultFeeInTaka),
          freeShippingThresholdInPoisha: shipping.freeShippingEnabled ? toPoisha(shipping.freeShippingThresholdInTaka) : null,
        },
      },
    }, { toastLoadingMessage: "Saving shipping settings..." });
  };

  const handleSave = () => {
    if (activeTab === "Shipping & Delivery") return handleSaveShipping();
    if (activeTab === "Payment Gateways") return handleSavePayment();
    if (activeTab === "SEO Settings") return handleSaveSeo();
    return handleSaveGeneral();
  };

  const saveDisabled = activeTab === "Shipping & Delivery" ? !canShip : !canUpdate;

  return (
    <PageWraper
      title="Store Settings"
      description="Manage your global store configuration, currency, and branding."
      actions={
        <Button className="bg-primary hover:bg-primary-dark text-white" onClick={handleSave} disabled={saveDisabled}>
          <Save className="mr-2 size-4" /> Save Changes
        </Button>
      }
    >
      {isFetching && !settings ? (
        <div className="py-20 flex justify-center">
          <SpinLoader />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "w-full text-left font-medium px-4 py-3 rounded-lg cursor-pointer transition-colors",
                  activeTab === tab ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="md:col-span-2 space-y-6">
            {activeTab === "General" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold">General Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name</label>
                    <Input value={general.storeName} onChange={(e) => setGeneral((s) => ({ ...s, storeName: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Tagline</label>
                    <Input value={general.tagline} onChange={(e) => setGeneral((s) => ({ ...s, tagline: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                    <Input value={general.email} onChange={(e) => setGeneral((s) => ({ ...s, email: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                    <Input
                      value={general.phone}
                      placeholder="017XXXXXXXX"
                      onChange={(e) => {
                        setGeneral((s) => ({ ...s, phone: e.target.value }));
                        if (phoneErrors.phone) setPhoneErrors((err) => ({ ...err, phone: undefined }));
                      }}
                      onBlur={() => {
                        if (!isValidPhone(general.phone)) setPhoneErrors((err) => ({ ...err, phone: BD_PHONE_ERROR }));
                      }}
                    />
                    {phoneErrors.phone && <p className="text-xs text-red-500 mt-1">{phoneErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <Input value={general.address} onChange={(e) => setGeneral((s) => ({ ...s, address: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Low Stock Threshold</label>
                    <Input type="number" value={general.lowStockThreshold} onChange={(e) => setGeneral((s) => ({ ...s, lowStockThreshold: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value="BDT"
                      disabled
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm text-gray-500"
                    >
                      <option value="BDT">BDT (৳) - Bangladeshi Taka</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select
                      value="Asia/Dhaka"
                      disabled
                      className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-gray-50 px-3 py-2 text-sm shadow-sm text-gray-500"
                    >
                      <option>Asia/Dhaka</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Payment Gateways" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold">Payment Methods</h2>
                <p className="text-sm text-secondbase-color -mt-2">This store accepts Cash on Delivery by default, plus manual bKash/Nagad transfer verified against a transaction ID. There is no automated payment gateway.</p>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-medium text-sm">Cash on Delivery (COD)</p>
                    <p className="text-xs text-secondbase-color">Always available at checkout</p>
                  </div>
                  <Switch checked={payment.codEnabled} onCheckedChange={(v) => setPayment((s) => ({ ...s, codEnabled: v }))} />
                </div>
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <p className="font-medium text-sm">Enable bKash</p>
                  <Switch checked={payment.bkashEnabled} onCheckedChange={(v) => setPayment((s) => ({ ...s, bkashEnabled: v }))} />
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">Enable Nagad</p>
                  <Switch checked={payment.nagadEnabled} onCheckedChange={(v) => setPayment((s) => ({ ...s, nagadEnabled: v }))} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">bKash Merchant/Personal Number</label>
                    <Input
                      value={payment.bkashNumber}
                      placeholder="017XXXXXXXX"
                      onChange={(e) => {
                        setPayment((s) => ({ ...s, bkashNumber: e.target.value }));
                        if (phoneErrors.bkashNumber) setPhoneErrors((err) => ({ ...err, bkashNumber: undefined }));
                      }}
                      onBlur={() => {
                        if (!isValidPhone(payment.bkashNumber)) setPhoneErrors((err) => ({ ...err, bkashNumber: BD_PHONE_ERROR }));
                      }}
                    />
                    {phoneErrors.bkashNumber && <p className="text-xs text-red-500 mt-1">{phoneErrors.bkashNumber}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nagad Merchant/Personal Number</label>
                    <Input
                      value={payment.nagadNumber}
                      placeholder="017XXXXXXXX"
                      onChange={(e) => {
                        setPayment((s) => ({ ...s, nagadNumber: e.target.value }));
                        if (phoneErrors.nagadNumber) setPhoneErrors((err) => ({ ...err, nagadNumber: undefined }));
                      }}
                      onBlur={() => {
                        if (!isValidPhone(payment.nagadNumber)) setPhoneErrors((err) => ({ ...err, nagadNumber: BD_PHONE_ERROR }));
                      }}
                    />
                    {phoneErrors.nagadNumber && <p className="text-xs text-red-500 mt-1">{phoneErrors.nagadNumber}</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "Shipping & Delivery" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">Shipping Zones</h2>
                  <Button type="button" variant="outline" size="sm" onClick={addZone}>
                    <Plus className="mr-1.5 size-4" /> Add Zone
                  </Button>
                </div>
                <div className="space-y-3">
                  {shipping.zones.map((zone, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_1fr_auto] gap-3 items-end border border-border rounded-lg p-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Code</label>
                        <Input value={zone.code} onChange={(e) => updateZone(index, { code: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                        <Input value={zone.name} onChange={(e) => updateZone(index, { name: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Districts (comma-separated)</label>
                        <Input value={zone.districtsText} onChange={(e) => updateZone(index, { districtsText: e.target.value })} />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Fee (৳)</label>
                        <Input type="number" value={zone.feeInTaka} onChange={(e) => updateZone(index, { feeInTaka: Number(e.target.value) })} />
                      </div>
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500 bg-red-50" onClick={() => removeZone(index)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                  {shipping.zones.length === 0 && (
                    <div className="py-6 text-center text-secondbase-color text-sm">No zones yet — orders outside every zone use the default fee below.</div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Fee (৳, for districts not in any zone)</label>
                    <Input type="number" value={shipping.defaultFeeInTaka} onChange={(e) => setShipping((s) => ({ ...s, defaultFeeInTaka: Number(e.target.value) }))} />
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">Enable Free Shipping Threshold</p>
                    <Switch checked={shipping.freeShippingEnabled} onCheckedChange={(v) => setShipping((s) => ({ ...s, freeShippingEnabled: v }))} />
                  </div>
                  {shipping.freeShippingEnabled && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Free Shipping Threshold (৳)</label>
                      <Input type="number" value={shipping.freeShippingThresholdInTaka} onChange={(e) => setShipping((s) => ({ ...s, freeShippingThresholdInTaka: Number(e.target.value) }))} />
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === "SEO Settings" && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-bold">Homepage SEO</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
                  <Input value={seo.metaTitle} onChange={(e) => setSeo((s) => ({ ...s, metaTitle: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    value={seo.metaDescription}
                    onChange={(e) => setSeo((s) => ({ ...s, metaDescription: e.target.value }))}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm min-h-24 focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWraper>
  );
};

export default SettingsPage;
