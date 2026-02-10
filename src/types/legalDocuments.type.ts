export interface ILegalDocument {
  _id: string;
  slug: string;
  title: string;
  content: string;
  pageCount: number;
  lastUpdatedAt: string;
}

export interface IGetLegalDocumentsResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: ILegalDocument[];
}
