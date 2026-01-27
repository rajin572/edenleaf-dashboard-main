import type { IApiResponse, IMeta } from "./common.type";

export type ICategoryStatus = "active" | "inactive" | "archived";

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  parentId: string | null;
  seoTitle?: string;
  seoDescription?: string;
  status: ICategoryStatus;
  order: number;
  createdAt: string;
}

export type IGetCategoryListResponse = IApiResponse<{ data: ICategory[]; meta: IMeta }>;

export interface ICategoryFormValues {
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  seoTitle?: string;
  seoDescription?: string;
  status: ICategoryStatus;
  order: number;
}
