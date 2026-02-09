export type TLedgerEntryType =
  | "SALE" | "COGS" | "PURCHASE" | "EXPENSE" | "REFUND"
  | "COD_FEE" | "DELIVERY_COST" | "RTO_COST" | "MARKETING_COST" | "ADJUSTMENT";

export type TLedgerDirection = "CREDIT" | "DEBIT";

export type TLedgerSource =
  | "PAYMENT_COLLECTED" | "PAYMENT_VERIFIED" | "PAYMENT_FAILED" | "ORDER_RTO";

export type TRemittanceStatus = "PENDING" | "RECONCILED";

export interface IFinanceUserRef {
  _id: string;
  name: string;
  email: string;
}

/**
 * The full, populated ledger view for the Finance module — NOT the same as
 * order.type.ts's ILedgerEntry, which is a narrower embed on order-detail
 * (unpopulated createdBy, no `source`) fed by a different, unpopulated query.
 */
export interface IFinanceLedgerEntry {
  _id: string;
  order: string;
  orderNumber: string;
  type: TLedgerEntryType;
  direction: TLedgerDirection;
  amountInPoisha: number;
  currency: "BDT";
  source: TLedgerSource;
  note: string;
  createdBy: IFinanceUserRef;
  createdAt: string;
  updatedAt: string;
}

export interface ILedgerSummaryByType {
  type: TLedgerEntryType;
  direction: TLedgerDirection;
  amountInPoisha: number;
  count: number;
}

export interface ILedgerSummary {
  range: { from: string | null; to: string | null };
  entryCount: number;
  creditsInPoisha: number;
  debitsInPoisha: number;
  balanceInPoisha: number;
  byType: ILedgerSummaryByType[];
}

export interface IRemittanceOrderSnapshot {
  order: string;
  orderNumber: string;
  amountInPoisha: number;
}

export interface IRemittanceBatch {
  _id: string;
  batchNumber: string;
  status: TRemittanceStatus;
  orders: IRemittanceOrderSnapshot[];
  orderCount: number;
  totalAmountInPoisha: number;
  note?: string;
  reconciliationNote?: string;
  createdBy: IFinanceUserRef;
  reconciledAt?: string;
  reconciledBy?: IFinanceUserRef;
  createdAt: string;
  updatedAt: string;
}

/**
 * Narrow order shape for the Remittance batch-creation picker only — NOT the
 * full IOrder. Part 09's orderApi.ts/order.type.ts are the real order surface;
 * this stays self-contained so this part never has to depend on their state.
 */
export interface IRemittanceEligibleOrder {
  _id: string;
  orderNumber: string;
  paymentMethod: "COD";
  paymentStatus: "COLLECTED";
  codAmountInPoisha: number;
  remittanceBatch?: string;
}
