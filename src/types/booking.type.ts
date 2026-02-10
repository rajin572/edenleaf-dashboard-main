import { IMeta } from "./common.type";

export type BookingStatus = "confirmed" | "pending" | "completed" | "disputed" | "cancelled";

export interface IBooking {
  _id: string;
  bookingCode: string;
  customerName: string;
  listingTitle: string;
  ownerName: string;
  dateLabel: string;
  amount: number;
  status: BookingStatus;
  createdAt: string;
}

export type DisputePriority = "high" | "medium" | "low";
export type DisputeStatus = "open" | "investigating" | "resolved";

export interface IDisputeMessage {
  _id: string;
  authorName: string;
  timeLabel: string;
  message: string;
}

export interface IDispute {
  _id: string;
  disputeCode: string;
  bookingCode: string;
  listingTitle: string;
  customerName: string;
  ownerName: string;
  reason: string;
  amount: number;
  priority: DisputePriority;
  status: DisputeStatus;
  openedAt: string;
  conversation: IDisputeMessage[];
}

export type CancelledBy = "customer" | "owner" | "admin";
export type RefundStatus = "issued" | "pending" | "denied";

export interface ICancellation {
  _id: string;
  cancellationCode: string;
  bookingCode: string;
  customerName: string;
  listingTitle: string;
  ownerName: string;
  cancelledBy: CancelledBy;
  cancellationDate: string;
  scheduledDate: string;
  reason: string;
  bookingAmount: number;
  refundAmount: number;
  refundStatus: RefundStatus;
}

export interface IGetBookingsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IBooking[];
    meta: IMeta;
  };
}

export interface IGetBookingDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IBooking;
}

export interface IGetDisputesResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IDispute[];
    meta: IMeta;
  };
}

export interface IGetCancellationsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: ICancellation[];
    meta: IMeta;
  };
}
