import { IMeta } from "./common.type";

export type AdminRole = "Super Admin" | "Admin" | "Moderator" | "Support";
export type AdminMemberStatus = "active" | "inactive";

export interface IAdminTeamMember {
  _id: string;
  adminCode: string;
  fullName: string;
  email: string;
  role: AdminRole;
  status: AdminMemberStatus;
  twoFactorEnabled: boolean;
  lastActiveLabel: string;
}

export interface IGetAdminTeamMembersResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    data: IAdminTeamMember[];
    meta: IMeta;
  };
}
