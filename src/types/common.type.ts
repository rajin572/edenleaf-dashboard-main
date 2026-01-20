export type IMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type IApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  meta?: IMeta;
  data: T;
};

export type IListResponse<T> = IApiResponse<T[]>;

export type IQueryArgs = Record<string, unknown>;

export type IErrorResponse = {
  success: boolean;
  message: string;
  errorMessages: {
    path: string | number;
    message: string;
  }[];
  stack?: string;
};

export type TransportCategory = string;


