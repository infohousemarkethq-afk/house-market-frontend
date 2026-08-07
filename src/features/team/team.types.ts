/** Company staff. Owners are not staff and never appear on the Team screen. */
export type MemberRole = "COMPANY_ADMIN" | "MANAGER";

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  COMPANY_ADMIN: "Admin",
  MANAGER: "Manager",
};

export interface Member {
  id: string;
  fullName: string;
  email: string;
  role: MemberRole;
  /** Units assigned to them. Admins see everything, so this reads "—". */
  assignments: number;
  deactivatedAt: string | null;
}

export type InviteRole = "MANAGER" | "OWNER";
export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED";

export const INVITE_ROLE_LABEL: Record<InviteRole, string> = {
  MANAGER: "Manager",
  OWNER: "Owner",
};

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REVOKED: "Revoked",
};

export interface Invitation {
  id: string;
  fullName: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  units: string;
  meta: string;
}

export interface InviteDraft {
  fullName: string;
  email: string;
  role: InviteRole;
  unitIds: string[];
}
