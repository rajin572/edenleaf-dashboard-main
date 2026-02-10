import { IMeta } from "./common.type";

export type TransactionType = "payment" | "payout" | "refund";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface ITransaction {
  _id: string;
  transactionCode: string;
  type: TransactionType;
  amount: number;
  customerName: string;
  ownerName: string;
  bookingCode: string;
  paymentMethod: string;
  date: string;
  status: TransactionStatus;
}

export interface IGetTransactionsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: ITransaction[];
    meta: IMeta;
  };
}
