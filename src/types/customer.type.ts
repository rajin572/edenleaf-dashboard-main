import type { IApiResponse, IMeta } from "./common.type";
import type { IAddress, IUser } from "./auth.type";

/** A customer is just a `User` whose role slug is `"user"` — same pattern as
 *  `IStaffListItem extends IUser`. No `type`/`orders`/`spent` fields exist on
 *  the wire; guest orders never produce a `User` document at all. */
export type ICustomer = IUser;

export interface ICustomerOrderSummaryRow {
  _id: string;
  orderNumber: string;
  status: string;
  grandTotalInPoisha: number;
  createdAt: string;
}

export interface ICustomerDetail extends ICustomer {
  addresses: IAddress[];
  orderSummary: {
    /** Every order ever placed, any status — not scoped to delivered. */
    orderCount: number;
    /** Scoped to `status: "DELIVERED"` only. */
    deliveredSpendInPoisha: number;
  };
}

export type IGetCustomerListResponse = IApiResponse<{ data: ICustomer[]; meta: IMeta }>;
export type IGetCustomerDetailResponse = IApiResponse<ICustomerDetail>;
