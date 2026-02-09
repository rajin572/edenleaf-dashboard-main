export interface ISalesRangeFigure {
  from: string;
  to: string;
  amountInPoisha: number;
  orderCount: number;
}

export interface ISalesReport {
  timezone: "Asia/Dhaka";
  weekStartsOn: "MONDAY";
  today: ISalesRangeFigure;
  thisWeek: ISalesRangeFigure;
  thisMonth: ISalesRangeFigure;
  custom?: ISalesRangeFigure;
}

export interface IOrderCountReport {
  total: number;
  pending: number;
  delivered: number;
  cancelled: number;
  /** Real backend keys, e.g. "OUT_FOR_DELIVERY" — not the dummy OrderStatusV1 set. */
  byStatus: Record<string, number>;
}

export interface IProductSalesReport {
  productId: string;
  productName: string;
  unitsSold: number;
  salesInPoisha: number;
}

export interface IInventoryReportRow {
  variantId: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantName: string;
  sku: string;
  stock: number;
  unit: string;
}

export interface IInventoryReport {
  lowStockThreshold: number;
  lowStock: IInventoryReportRow[];
  outOfStock: IInventoryReportRow[];
}
