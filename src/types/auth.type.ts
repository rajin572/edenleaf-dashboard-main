/** Mirrors the backend `permission` model (`resource.action`). */
export interface IPermission {
  _id: string;
  name: string;
  action: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /permissions` returns the catalog grouped by resource. */
export type IPermissionCatalog = Record<string, IPermission[]>;

export interface IRole {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  /** Populated by the backend on list/detail reads. */
  permissions: IPermission[];
  isSystem: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type IUserStatus = "active" | "blocked" | "archived";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  /** Populated on staff and /auth/me reads. */
  role: IRole;
  status: IUserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  lastLoginAt?: string;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** `GET /auth/me` — the user plus the flattened permission set. */
export interface IMeResponse extends IUser {
  resolvedPermissions: string[];
}

export interface IAddress {
  _id: string;
  user: string;
  label?: string;
  name: string;
  phone: string;
  district: string;
  thana: string;
  area?: string;
  street?: string;
  postcode?: string;
  isDefault: boolean;
}

/** `POST /auth/login` — the backend returns the role as a slug string here. */
export interface ILoginResponse {
  accessToken: string;
  user: {
    _id: string;
    name: string;
    email: string;
    role: string;
    status: IUserStatus;
  };
}

/** What the access token actually carries — note: no permissions. */
export interface IJwtPayload {
  userId: string;
  role: string;
  email: string;
  iat: number;
  exp: number;
}

export interface IStaffListItem extends IUser {
  role: IRole;
}
