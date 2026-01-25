export interface IDashboardStats {
  /** Poisha, like every other real money field — format with `formatMoney`. */
  salesToday: number;
  pendingOrders: number;
  pendingPaymentVerification: number;
  lowStockItems: number;
}

export interface ITopSellingProduct {
  _id: string;
  name: string;
  unitsSold: number;
}
