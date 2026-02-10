// Shared, cross-referenced dummy data for the design-only phase (no backend
// yet — see AGENTS.md §2.8). Categories/products/orders/reviews all point at
// each other's real ids so pages built against this data stay consistent
// instead of each page inventing its own disconnected fixtures.
import type {
  ICategory, IProduct, IProductVariant, TProductStatus, ICoupon,
  IPermission, IRole, IStaffListItem, INewsletterSubscriber,
} from "@/types";
import type { LegacyOrder } from "@/store/orderStore";

/** The old fictional customer shape — `ICustomer` from `@/types` is now the
 *  real `IUser` (Part 10), so this stays file-local for Overview.tsx's
 *  `DUMMY_CUSTOMERS.length` stat card only (Part 13's problem to migrate). */
interface LegacyCustomer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  orders: number;
  spent: number;
  type: "Registered" | "Guest" | "Offline";
  status: "Active" | "Blocked";
  joinedAt: string;
}

export const DUMMY_CATEGORIES: ICategory[] = [
  { _id: "cat-honey", name: "Honey", slug: "honey", parentId: null, status: "active", order: 1, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-spices", name: "Spices", slug: "spices", parentId: null, status: "active", order: 2, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-spices-whole", name: "Whole Spices", slug: "whole-spices", parentId: "cat-spices", status: "active", order: 1, createdAt: "2026-08-02T00:00:00Z" },
  { _id: "cat-spices-ground", name: "Ground Spices", slug: "ground-spices", parentId: "cat-spices", status: "active", order: 2, createdAt: "2026-08-02T00:00:00Z" },
  { _id: "cat-oil-ghee", name: "Oil & Ghee", slug: "oil-ghee", parentId: null, status: "active", order: 3, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-dates", name: "Dates & Dry Fruits", slug: "dates-dry-fruits", parentId: null, status: "active", order: 4, createdAt: "2026-08-01T00:00:00Z" },
  { _id: "cat-dates-ajwa", name: "Ajwa & Premium Dates", slug: "ajwa-premium-dates", parentId: "cat-dates", status: "active", order: 1, createdAt: "2026-08-03T00:00:00Z" },
  { _id: "cat-dates-nuts", name: "Nuts & Dry Fruits", slug: "nuts-dry-fruits", parentId: "cat-dates", status: "active", order: 2, createdAt: "2026-08-03T00:00:00Z" },
  { _id: "cat-tea", name: "Tea & Beverages", slug: "tea-beverages", parentId: null, status: "inactive", order: 5, createdAt: "2026-08-05T00:00:00Z" },
];

/**
 * Compact source rows for the still-dummy pages (Combo, Featured/New Arrival
 * placement, Manual Orders, the product picker) that aren't wired to the
 * real `/products` API yet — that's Part 05/10's job. `IProduct` itself now
 * matches the real backend shape (poisha, per-variant pricing/stock) since
 * Part 04 wired `ProductsPage`/`ProductFormModal` to it, so this factory
 * derives the full shape from a handful of taka-priced fields instead of
 * repeating ~20 fields per entry by hand.
 */
interface DummyProductSeed {
  _id: string;
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  image: string;
  priceInTaka: number;
  comparePriceInTaka?: number;
  stock: number;
  unit: string;
  status: TProductStatus;
  createdAt: string;
}

const buildDummyProduct = (seed: DummyProductSeed): IProduct => {
  const category = DUMMY_CATEGORIES.find((c) => c._id === seed.categoryId);
  const priceInPoisha = seed.priceInTaka * 100;
  const comparePriceInPoisha = seed.comparePriceInTaka ? seed.comparePriceInTaka * 100 : undefined;
  const variant: IProductVariant = {
    _id: `${seed._id}-default`,
    productId: seed._id,
    name: "Default",
    sku: seed.sku,
    priceInPoisha,
    comparePriceInPoisha,
    stock: seed.stock,
    unit: seed.unit,
    attributes: {},
    isDefault: true,
    status: "active",
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
  };

  return {
    _id: seed._id,
    name: seed.name,
    slug: seed.slug,
    description: "",
    categoryId: seed.categoryId,
    category: category ? { _id: category._id, name: category.name, slug: category.slug } : { _id: seed.categoryId, name: "", slug: "" },
    categorySlug: category?.slug ?? "",
    images: [seed.image],
    image: seed.image,
    status: seed.status,
    minPriceInPoisha: priceInPoisha,
    maxPriceInPoisha: priceInPoisha,
    totalStock: seed.stock,
    avgRating: 0,
    reviewCount: 0,
    isFeatured: false,
    featuredOrder: 0,
    isNewArrival: false,
    newArrivalOrder: 0,
    priceInPoisha,
    comparePriceInPoisha,
    stock: seed.stock,
    sku: seed.sku,
    unit: seed.unit,
    variants: [variant],
    createdAt: seed.createdAt,
    updatedAt: seed.createdAt,
  };
};

const DUMMY_PRODUCT_SEEDS: DummyProductSeed[] = [
  { _id: "prod-honey-sundarban", name: "Premium Sundarbans Honey", slug: "premium-sundarbans-honey", sku: "HONEY-01", categoryId: "cat-honey", image: "https://placehold.co/80x80/FEF3C7/92400E.png?text=Honey", priceInTaka: 850, comparePriceInTaka: 950, stock: 120, unit: "500g", status: "published", createdAt: "2026-08-05T00:00:00Z" },
  { _id: "prod-honey-litchi", name: "Litchi Flower Honey", slug: "litchi-flower-honey", sku: "HONEY-02", categoryId: "cat-honey", image: "https://placehold.co/80x80/FEF3C7/92400E.png?text=Honey", priceInTaka: 780, stock: 60, unit: "500g", status: "published", createdAt: "2026-08-06T00:00:00Z" },
  { _id: "prod-spice-cinnamon", name: "Cinnamon Stick", slug: "cinnamon-stick", sku: "SPICE-W01", categoryId: "cat-spices-whole", image: "https://placehold.co/80x80/FDE68A/78350F.png?text=Spice", priceInTaka: 220, stock: 80, unit: "100g", status: "published", createdAt: "2026-08-07T00:00:00Z" },
  { _id: "prod-spice-cardamom", name: "Black Cardamom", slug: "black-cardamom", sku: "SPICE-W02", categoryId: "cat-spices-whole", image: "https://placehold.co/80x80/FDE68A/78350F.png?text=Spice", priceInTaka: 340, stock: 8, unit: "100g", status: "published", createdAt: "2026-08-07T00:00:00Z" },
  { _id: "prod-spice-turmeric", name: "Turmeric Powder", slug: "turmeric-powder", sku: "SPICE-G01", categoryId: "cat-spices-ground", image: "https://placehold.co/80x80/FCD34D/78350F.png?text=Spice", priceInTaka: 180, stock: 250, unit: "200g", status: "published", createdAt: "2026-08-08T00:00:00Z" },
  { _id: "prod-spice-chili", name: "Red Chili Powder", slug: "red-chili-powder", sku: "SPICE-G02", categoryId: "cat-spices-ground", image: "https://placehold.co/80x80/FCA5A5/7F1D1D.png?text=Spice", priceInTaka: 160, stock: 0, unit: "200g", status: "published", createdAt: "2026-08-08T00:00:00Z" },
  { _id: "prod-oil-mustard", name: "Organic Mustard Oil", slug: "organic-mustard-oil", sku: "OIL-01", categoryId: "cat-oil-ghee", image: "https://placehold.co/80x80/FDE047/713F12.png?text=Oil", priceInTaka: 350, stock: 45, unit: "1L", status: "published", createdAt: "2026-08-09T00:00:00Z" },
  { _id: "prod-ghee-cow", name: "Deshi Ghee (Cow)", slug: "deshi-ghee-cow", sku: "GHEE-01", categoryId: "cat-oil-ghee", image: "https://placehold.co/80x80/FEF9C3/854D0E.png?text=Ghee", priceInTaka: 1200, stock: 15, unit: "500g", status: "published", createdAt: "2026-08-09T00:00:00Z" },
  { _id: "prod-dates-ajwa", name: "Premium Ajwa Dates", slug: "premium-ajwa-dates", sku: "DATE-01", categoryId: "cat-dates-ajwa", image: "https://placehold.co/80x80/451A03/FDE68A.png?text=Dates", priceInTaka: 2200, stock: 15, unit: "1kg", status: "published", createdAt: "2026-08-10T00:00:00Z" },
  { _id: "prod-dates-medjool", name: "Medjool Dates", slug: "medjool-dates", sku: "DATE-02", categoryId: "cat-dates-ajwa", image: "https://placehold.co/80x80/451A03/FDE68A.png?text=Dates", priceInTaka: 1650, stock: 22, unit: "1kg", status: "published", createdAt: "2026-08-10T00:00:00Z" },
  { _id: "prod-nuts-cashew", name: "Cashew Nuts", slug: "cashew-nuts", sku: "NUT-01", categoryId: "cat-dates-nuts", image: "https://placehold.co/80x80/FEF3C7/78350F.png?text=Nuts", priceInTaka: 980, stock: 40, unit: "500g", status: "published", createdAt: "2026-08-11T00:00:00Z" },
  { _id: "prod-nuts-almond", name: "Almonds", slug: "almonds", sku: "NUT-02", categoryId: "cat-dates-nuts", image: "https://placehold.co/80x80/FEF3C7/78350F.png?text=Nuts", priceInTaka: 890, stock: 3, unit: "500g", status: "draft", createdAt: "2026-08-11T00:00:00Z" },
];

export const DUMMY_PRODUCTS: IProduct[] = DUMMY_PRODUCT_SEEDS.map(buildDummyProduct);

export const DUMMY_CUSTOMERS: LegacyCustomer[] = [
  { _id: "CUST-001", name: "Rahim Uddin", phone: "01711223344", email: "rahim@example.com", address: "House 12, Road 4, Dhanmondi, Dhaka", orders: 2, spent: 3960, type: "Registered", status: "Active", joinedAt: "2026-05-02T00:00:00Z" },
  { _id: "CUST-002", name: "Karim Hassan", phone: "01822334455", email: "karim@example.com", address: "Flat 3B, Agrabad, Chattogram", orders: 2, spent: 350, type: "Guest", status: "Active", joinedAt: "2026-06-14T00:00:00Z" },
  { _id: "CUST-003", name: "Salma Begum", phone: "01933445566", email: "salma@example.com", address: "45 Zindabazar, Sylhet", orders: 2, spent: 4400, type: "Registered", status: "Active", joinedAt: "2026-04-20T00:00:00Z" },
  { _id: "CUST-004", name: "Jamal Bhuiyan", phone: "01644556677", email: "", address: "Village Rd, Bogura Sadar, Bogura", orders: 1, spent: 2200, type: "Offline", status: "Active", joinedAt: "2026-07-01T00:00:00Z" },
  { _id: "CUST-005", name: "Farzana Yasmin", phone: "01555667788", email: "farzana@example.com", address: "House 8, Uttara Sector 7, Dhaka", orders: 1, spent: 0, type: "Registered", status: "Active", joinedAt: "2026-07-22T00:00:00Z" },
];

const p = (id: string) => DUMMY_PRODUCTS.find((x) => x._id === id)!;

export const DUMMY_ORDERS: LegacyOrder[] = [
  {
    _id: "1", orderId: "ORD-10052", customerName: "Rahim Uddin", customerPhone: "01711223344",
    customerAddress: "House 12, Road 4, Dhanmondi, Dhaka", source: "Website",
    items: [
      { productId: p("prod-honey-sundarban")._id, name: p("prod-honey-sundarban").name, image: p("prod-honey-sundarban").images[0], unit: "500g", price: 850, quantity: 2 },
      { productId: p("prod-spice-cinnamon")._id, name: p("prod-spice-cinnamon").name, image: p("prod-spice-cinnamon").images[0], unit: "100g", price: 220, quantity: 1 },
    ],
    subtotal: 1920, deliveryFee: 60, discount: 0, total: 1980,
    paymentMethod: "bKash", paymentStatus: "Pending Verification", transactionId: "8N7K2X4PQ1",
    status: "Pending",
    statusHistory: [{ status: "Pending", note: "Order placed, awaiting bKash verification", at: "2026-09-04T10:30:00Z" }],
    placedAt: "2026-09-04T10:30:00Z",
  },
  {
    _id: "2", orderId: "ORD-10051", customerName: "Karim Hassan", customerPhone: "01822334455",
    customerAddress: "Flat 3B, Agrabad, Chattogram", source: "Facebook",
    items: [{ productId: p("prod-oil-mustard")._id, name: p("prod-oil-mustard").name, image: p("prod-oil-mustard").images[0], unit: "1L", price: 350, quantity: 1 }],
    subtotal: 350, deliveryFee: 100, discount: 0, total: 450,
    paymentMethod: "COD", paymentStatus: "Pending",
    status: "Processing",
    statusHistory: [
      { status: "Pending", at: "2026-09-03T16:15:00Z" },
      { status: "Confirmed", note: "Confirmed by phone call", at: "2026-09-03T17:00:00Z" },
      { status: "Processing", note: "Packing at Main Warehouse", at: "2026-09-04T09:00:00Z" },
    ],
    placedAt: "2026-09-03T16:15:00Z",
  },
  {
    _id: "3", orderId: "ORD-10050", customerName: "Salma Begum", customerPhone: "01933445566",
    customerAddress: "45 Zindabazar, Sylhet", source: "WhatsApp",
    items: [
      { productId: p("prod-spice-turmeric")._id, name: p("prod-spice-turmeric").name, image: p("prod-spice-turmeric").images[0], unit: "200g", price: 180, quantity: 3 },
      { productId: p("prod-spice-chili")._id, name: p("prod-spice-chili").name, image: p("prod-spice-chili").images[0], unit: "200g", price: 160, quantity: 2 },
    ],
    subtotal: 860, deliveryFee: 120, discount: 0, total: 980,
    paymentMethod: "Nagad", paymentStatus: "Verified", transactionId: "9XJ4M1Z7QT",
    status: "Shipped", courierName: "Pathao Courier", courierTrackingId: "PTH-88213",
    statusHistory: [
      { status: "Pending", at: "2026-09-02T11:20:00Z" },
      { status: "Confirmed", at: "2026-09-02T12:10:00Z" },
      { status: "Processing", at: "2026-09-02T15:00:00Z" },
      { status: "Packed", at: "2026-09-03T09:30:00Z" },
      { status: "Shipped", note: "Handed to Pathao Courier — PTH-88213", at: "2026-09-03T14:45:00Z" },
    ],
    placedAt: "2026-09-02T11:20:00Z",
  },
  {
    _id: "4", orderId: "ORD-10049", customerName: "Jamal Bhuiyan", customerPhone: "01644556677",
    customerAddress: "Village Rd, Bogura Sadar, Bogura", source: "Website",
    items: [{ productId: p("prod-dates-ajwa")._id, name: p("prod-dates-ajwa").name, image: p("prod-dates-ajwa").images[0], unit: "1kg", price: 2200, quantity: 1 }],
    subtotal: 2200, deliveryFee: 100, discount: 100, total: 2200,
    paymentMethod: "COD", paymentStatus: "Verified",
    status: "Delivered", courierName: "Sundarban Courier", courierTrackingId: "SC-44210",
    statusHistory: [
      { status: "Pending", at: "2026-08-28T09:00:00Z" },
      { status: "Confirmed", at: "2026-08-28T09:30:00Z" },
      { status: "Processing", at: "2026-08-28T13:00:00Z" },
      { status: "Packed", at: "2026-08-29T10:00:00Z" },
      { status: "Shipped", note: "Handed to Sundarban Courier — SC-44210", at: "2026-08-29T16:00:00Z" },
      { status: "Delivered", note: "COD collected on delivery", at: "2026-08-31T13:20:00Z" },
    ],
    placedAt: "2026-08-28T09:00:00Z",
  },
  {
    _id: "5", orderId: "ORD-10048", customerName: "Farzana Yasmin", customerPhone: "01555667788",
    customerAddress: "House 8, Uttara Sector 7, Dhaka", source: "Phone",
    items: [{ productId: p("prod-ghee-cow")._id, name: p("prod-ghee-cow").name, image: p("prod-ghee-cow").images[0], unit: "500g", price: 1200, quantity: 1 }],
    subtotal: 1200, deliveryFee: 60, discount: 0, total: 1260,
    paymentMethod: "COD", paymentStatus: "Failed",
    status: "Cancelled",
    statusHistory: [
      { status: "Pending", at: "2026-08-27T08:10:00Z" },
      { status: "Cancelled", note: "Customer unreachable after 3 call attempts", at: "2026-08-27T18:00:00Z" },
    ],
    placedAt: "2026-08-27T08:10:00Z",
  },
  {
    _id: "6", orderId: "ORD-10047", customerName: "Salma Begum", customerPhone: "01933445566",
    customerAddress: "45 Zindabazar, Sylhet", source: "Website",
    items: [
      { productId: p("prod-nuts-cashew")._id, name: p("prod-nuts-cashew").name, image: p("prod-nuts-cashew").images[0], unit: "500g", price: 980, quantity: 2 },
      { productId: p("prod-nuts-almond")._id, name: p("prod-nuts-almond").name, image: p("prod-nuts-almond").images[0], unit: "500g", price: 890, quantity: 1 },
    ],
    subtotal: 2850, deliveryFee: 100, discount: 150, total: 2800,
    paymentMethod: "bKash", paymentStatus: "Verified", transactionId: "7QW3N9K2LP",
    status: "Delivered", courierName: "RedX", courierTrackingId: "RDX-99120",
    statusHistory: [
      { status: "Pending", at: "2026-08-20T10:00:00Z" },
      { status: "Confirmed", at: "2026-08-20T10:40:00Z" },
      { status: "Processing", at: "2026-08-20T14:00:00Z" },
      { status: "Packed", at: "2026-08-21T09:00:00Z" },
      { status: "Shipped", note: "Handed to RedX — RDX-99120", at: "2026-08-21T15:00:00Z" },
      { status: "Delivered", at: "2026-08-23T12:00:00Z" },
    ],
    placedAt: "2026-08-20T10:00:00Z",
  },
  {
    _id: "7", orderId: "ORD-10046", customerName: "Rahim Uddin", customerPhone: "01711223344",
    customerAddress: "House 12, Road 4, Dhanmondi, Dhaka", source: "Website",
    items: [
      { productId: p("prod-dates-medjool")._id, name: p("prod-dates-medjool").name, image: p("prod-dates-medjool").images[0], unit: "1kg", price: 1650, quantity: 1 },
      { productId: p("prod-spice-cardamom")._id, name: p("prod-spice-cardamom").name, image: p("prod-spice-cardamom").images[0], unit: "100g", price: 340, quantity: 1 },
    ],
    subtotal: 1990, deliveryFee: 0, discount: 30, total: 1960,
    paymentMethod: "COD", paymentStatus: "Verified",
    status: "Delivered", courierName: "Pathao Courier", courierTrackingId: "PTH-77004",
    statusHistory: [
      { status: "Pending", at: "2026-08-15T09:00:00Z" },
      { status: "Confirmed", at: "2026-08-15T09:20:00Z" },
      { status: "Processing", at: "2026-08-15T13:00:00Z" },
      { status: "Packed", at: "2026-08-16T09:00:00Z" },
      { status: "Shipped", note: "Handed to Pathao Courier — PTH-77004", at: "2026-08-16T14:00:00Z" },
      { status: "Delivered", note: "COD collected on delivery", at: "2026-08-18T11:00:00Z" },
    ],
    placedAt: "2026-08-15T09:00:00Z",
  },
  {
    _id: "8", orderId: "ORD-10045", customerName: "Karim Hassan", customerPhone: "01822334455",
    customerAddress: "Flat 3B, Agrabad, Chattogram", source: "Website",
    items: [{ productId: p("prod-oil-mustard")._id, name: p("prod-oil-mustard").name, image: p("prod-oil-mustard").images[0], unit: "1L", price: 350, quantity: 1 }],
    subtotal: 350, deliveryFee: 100, discount: 0, total: 450,
    paymentMethod: "COD", paymentStatus: "Verified",
    status: "Returned", refundStatus: "pending", courierName: "Pathao Courier", courierTrackingId: "PTH-66210",
    statusHistory: [
      { status: "Pending", at: "2026-08-10T09:00:00Z" },
      { status: "Confirmed", at: "2026-08-10T09:30:00Z" },
      { status: "Processing", at: "2026-08-10T13:00:00Z" },
      { status: "Packed", at: "2026-08-11T09:00:00Z" },
      { status: "Shipped", note: "Handed to Pathao Courier — PTH-66210", at: "2026-08-11T15:00:00Z" },
      { status: "Delivered", note: "COD collected on delivery", at: "2026-08-13T12:00:00Z" },
      { status: "Returned", note: "Bottle arrived leaking; customer requested a return.", at: "2026-08-15T10:00:00Z" },
    ],
    placedAt: "2026-08-10T09:00:00Z",
  },
];

/** Poisha on the wire, matching the real backend — see Part 07's plan note
 *  that `value` itself is only in poisha for "fixed" coupons, never for
 *  "percentage" ones (stored as a raw 1-100 number there). */
export const DUMMY_COUPONS: ICoupon[] = [
  { _id: "cpn-1", code: "WELCOME10", name: "Welcome Discount", description: "10% off, capped at ৳200.", type: "percentage", value: 10, minOrderInPoisha: 50000, maxDiscountInPoisha: 20000, usageLimit: 500, usedCount: 128, remainingUses: 372, perUserLimit: 1, firstOrderOnly: false, isPublic: true, startsAt: "2026-08-01T00:00:00Z", expiresAt: "2026-12-31T00:00:00Z", status: "active", createdBy: "owner-1", createdAt: "2026-08-01T00:00:00Z", updatedAt: "2026-08-01T00:00:00Z" },
  { _id: "cpn-2", code: "FREESHIP", name: "Free Shipping Credit", description: "৳100 off orders over ৳1000.", type: "fixed", value: 10000, minOrderInPoisha: 100000, maxDiscountInPoisha: null, usageLimit: 1000, usedCount: 340, remainingUses: 660, perUserLimit: null, firstOrderOnly: false, isPublic: true, startsAt: "2026-08-01T00:00:00Z", expiresAt: "2026-10-31T00:00:00Z", status: "active", createdBy: "owner-1", createdAt: "2026-08-01T00:00:00Z", updatedAt: "2026-08-01T00:00:00Z" },
  { _id: "cpn-3", code: "BULK15", name: "Bulk Order Discount", description: "15% off orders over ৳2000.", type: "percentage", value: 15, minOrderInPoisha: 200000, maxDiscountInPoisha: 50000, usageLimit: 200, usedCount: 12, remainingUses: 188, perUserLimit: 1, firstOrderOnly: false, isPublic: false, startsAt: "2026-09-01T00:00:00Z", expiresAt: "2026-11-30T00:00:00Z", status: "inactive", createdBy: "owner-1", createdAt: "2026-08-28T00:00:00Z", updatedAt: "2026-08-28T00:00:00Z" },
  { _id: "cpn-4", code: "EID50", name: "Eid Special", description: "৳50 off, one-time Eid promotion.", type: "fixed", value: 5000, minOrderInPoisha: 30000, maxDiscountInPoisha: null, usageLimit: 2000, usedCount: 1876, remainingUses: 124, perUserLimit: 1, firstOrderOnly: false, isPublic: true, startsAt: "2026-06-01T00:00:00Z", expiresAt: "2026-06-20T00:00:00Z", status: "active", createdBy: "owner-1", createdAt: "2026-05-25T00:00:00Z", updatedAt: "2026-05-25T00:00:00Z" },
];

// Permission strings match the `permission` values used on admin.route.tsx
// nav entries one-to-one, so every checkbox here genuinely gates a real page.
const PERM: Record<string, IPermission> = {
  bannerManage: { _id: "perm-banner-manage", name: "Manage banners", action: "banner.manage" },
  categoryView: { _id: "perm-category-view", name: "View categories", action: "category.view" },
  productView: { _id: "perm-product-view", name: "View products", action: "product.view" },
  comboManage: { _id: "perm-combo-manage", name: "Manage combos", action: "combo.manage" },
  orderView: { _id: "perm-order-view", name: "View orders", action: "order.view" },
  inventoryView: { _id: "perm-inventory-view", name: "View inventory", action: "inventory.view" },
  customerView: { _id: "perm-customer-view", name: "View customers", action: "customer.view" },
  couponView: { _id: "perm-coupon-view", name: "View coupons", action: "coupon.view" },
  newsletterManage: { _id: "perm-newsletter-manage", name: "Manage newsletter", action: "newsletter.manage" },
  reportView: { _id: "perm-report-view", name: "View reports", action: "report.view" },
  settingsView: { _id: "perm-settings-view", name: "Manage settings", action: "settings.view" },
  staffManage: { _id: "perm-staff-manage", name: "Manage admins & roles", action: "staff.manage" },
};

export const DUMMY_PERMISSION_CATALOG: Record<string, IPermission[]> = {
  banner: [PERM.bannerManage],
  category: [PERM.categoryView],
  product: [PERM.productView],
  combo: [PERM.comboManage],
  order: [PERM.orderView],
  inventory: [PERM.inventoryView],
  customer: [PERM.customerView],
  coupon: [PERM.couponView],
  newsletter: [PERM.newsletterManage],
  report: [PERM.reportView],
  settings: [PERM.settingsView],
  staff: [PERM.staffManage],
};

export const DUMMY_ROLES: IRole[] = [
  { _id: "role-super-admin", name: "Super Admin", slug: "super_admin", description: "Implicitly holds every permission.", permissions: [], isSystem: true, createdAt: "2026-08-01T00:00:00Z" },
  {
    _id: "role-store-manager", name: "Store Manager", slug: "store_manager", description: "Runs day-to-day store operations.",
    permissions: [PERM.bannerManage, PERM.categoryView, PERM.productView, PERM.comboManage, PERM.orderView, PERM.inventoryView, PERM.customerView, PERM.couponView, PERM.reportView, PERM.settingsView],
    isSystem: false, createdAt: "2026-08-02T00:00:00Z",
  },
  {
    _id: "role-order-fulfillment", name: "Order Fulfillment", slug: "order_fulfillment", description: "Handles order processing and stock.",
    permissions: [PERM.orderView, PERM.inventoryView], isSystem: false, createdAt: "2026-08-02T00:00:00Z",
  },
  {
    _id: "role-marketing", name: "Marketing Staff", slug: "marketing_staff", description: "Manages banners, combos, coupons and the newsletter.",
    permissions: [PERM.bannerManage, PERM.comboManage, PERM.couponView, PERM.newsletterManage], isSystem: false, createdAt: "2026-08-03T00:00:00Z",
  },
  {
    _id: "role-support", name: "Customer Support", slug: "customer_support", description: "Looks up orders and customer accounts.",
    permissions: [PERM.orderView, PERM.customerView], isSystem: false, createdAt: "2026-08-03T00:00:00Z",
  },
];

const roleBySlug = (slug: string) => DUMMY_ROLES.find((r) => r.slug === slug)!;

export const DUMMY_STAFF: IStaffListItem[] = [
  { _id: "staff-1", name: "Rezaul Karim", email: "rezaul@example.com", phone: "01711000001", role: roleBySlug("super_admin"), status: "active", emailVerified: true, phoneVerified: true, isDeleted: false, lastLoginAt: "2026-09-06T09:00:00Z", createdAt: "2026-08-01T00:00:00Z" },
  { _id: "staff-2", name: "Nasrin Akter", email: "nasrin@example.com", phone: "01711000002", role: roleBySlug("store_manager"), status: "active", emailVerified: true, phoneVerified: true, isDeleted: false, lastLoginAt: "2026-09-05T14:30:00Z", createdAt: "2026-08-02T00:00:00Z" },
  { _id: "staff-3", name: "Kamal Hossain", email: "kamal@example.com", phone: "01711000003", role: roleBySlug("order_fulfillment"), status: "active", emailVerified: true, phoneVerified: false, isDeleted: false, lastLoginAt: "2026-09-06T08:15:00Z", createdAt: "2026-08-05T00:00:00Z" },
  { _id: "staff-4", name: "Sadia Islam", email: "sadia@example.com", phone: "01711000004", role: roleBySlug("marketing_staff"), status: "active", emailVerified: true, phoneVerified: true, isDeleted: false, lastLoginAt: "2026-09-04T11:00:00Z", createdAt: "2026-08-10T00:00:00Z" },
  { _id: "staff-5", name: "Tanvir Ahmed", email: "tanvir@example.com", phone: "01711000005", role: roleBySlug("customer_support"), status: "blocked", emailVerified: true, phoneVerified: true, isDeleted: false, lastLoginAt: "2026-08-20T16:45:00Z", createdAt: "2026-08-12T00:00:00Z" },
];

export const DUMMY_NEWSLETTER_SUBSCRIBERS: INewsletterSubscriber[] = [
  { _id: "sub-1", email: "rahim@example.com", status: "subscribed", subscribedAt: "2026-08-02T10:00:00Z" },
  { _id: "sub-2", email: "karim@example.com", status: "subscribed", subscribedAt: "2026-08-05T12:30:00Z" },
  { _id: "sub-3", email: "salma@example.com", status: "subscribed", subscribedAt: "2026-08-10T09:15:00Z" },
  { _id: "sub-4", email: "jamal@example.com", status: "unsubscribed", subscribedAt: "2026-07-20T08:00:00Z" },
  { _id: "sub-5", email: "farzana@example.com", status: "subscribed", subscribedAt: "2026-08-18T15:40:00Z" },
  { _id: "sub-6", email: "hasan.mahmud@example.com", status: "subscribed", subscribedAt: "2026-08-22T11:20:00Z" },
  { _id: "sub-7", email: "nusrat.jahan@example.com", status: "subscribed", subscribedAt: "2026-08-28T13:05:00Z" },
  { _id: "sub-8", email: "arif.chowdhury@example.com", status: "unsubscribed", subscribedAt: "2026-08-14T09:50:00Z" },
];
