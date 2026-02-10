import { IMeta, TransportCategory } from "./common.type";

export type OwnerDocStatus = "pending" | "under_review";
export type OwnerStatus = "active" | "suspended";
export type VehicleStatus = "active" | "maintenance";
export type OwnerBookingStatus = "completed" | "upcoming";

export interface IVerificationDocument {
  _id: string;
  verificationCode: string;
  ownerName: string;
  businessName: string;
  documentType: string;
  category: TransportCategory;
  submittedAt: string;
  status: OwnerDocStatus;
}

export interface IFleetVehicle {
  _id: string;
  name: string;
  bookingsCompleted: number;
  status: VehicleStatus;
}

export interface IOwnerBooking {
  _id: string;
  bookingCode: string;
  vehicleName: string;
  customerName: string;
  date: string;
  amount: number;
  status: OwnerBookingStatus;
}

export interface IOwner {
  _id: string;
  ownerCode: string;
  fullName: string;
  businessName: string;
  email: string;
  phone: string;
  category: TransportCategory;
  rating: number;
  vehicleCount: number;
  totalBookings: number;
  revenue: number;
  memberSince: string;
  status: OwnerStatus;
  fleet: IFleetVehicle[];
  bookings: IOwnerBooking[];
}

export interface IGetVerificationQueueResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IVerificationDocument[];
    meta: IMeta;
  };
}

export interface IGetOwnersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IOwner[];
    meta: IMeta;
  };
}

export interface IGetOwnerDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IOwner;
}
