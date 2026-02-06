export interface IBlockedContact {
  _id: string;
  phone: string;
  reason: string;
  active: boolean;
  createdBy?: { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface IBlockedContactFormValues {
  phone: string;
  reason: string;
}
