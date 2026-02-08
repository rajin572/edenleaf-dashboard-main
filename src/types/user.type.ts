import { IMeta } from "./common.type";

export type UserStatus = "active" | "suspended" | "banned";

export interface IPlatformUser {
  _id: string;
  userCode: string;
  fullName: string;
  email: string;
  phone: string;
  country: string;
  status: UserStatus;
  isVerified: boolean;
  totalBookings: number;
  totalSpent: number;
  lastActiveLabel: string;
  joinedAt: string;
}

export interface IGetUsersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IPlatformUser[];
    meta: IMeta;
  };
}

export interface IGetUserDetailResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: IPlatformUser;
}
