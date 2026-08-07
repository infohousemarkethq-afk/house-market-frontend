export type ApiRole = "COMPANY_ADMIN" | "MANAGER" | "OWNER" | "SUPER_ADMIN";
export type ViewRole = "admin" | "manager" | "owner";

export interface ApiCompany {
  id: string;
  companyName: string;
  companyLogo: string | null;
  status: string;
}

export interface ApiUser {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  role: ApiRole;
  companyId: string | null;
  emailVerifiedAt: string | null;
  createdAt: string;
  company?: ApiCompany | null;
}

export interface InviteUnit {
  id: string;
  unitName: string;
  propertyName: string;
}

export interface InvitePreview {
  email: string;
  fullName: string;
  role: Exclude<ApiRole, "COMPANY_ADMIN" | "SUPER_ADMIN">;
  companyName: string;
  expiresAt: string;
  requiresPassword: boolean;
  units: InviteUnit[];
}
