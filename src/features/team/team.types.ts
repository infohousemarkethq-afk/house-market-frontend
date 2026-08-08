/**
 * Company staff — admins and managers.
 *
 * Owners never appear here: they have no `companyId`, because the units they
 * own may span several companies (see listMembers in company.service.ts).
 */
export type MemberRole = "COMPANY_ADMIN" | "MANAGER";

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  COMPANY_ADMIN: "Admin",
  MANAGER: "Manager",
};

export interface Member {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string | null;
  role: MemberRole;
  emailVerifiedAt: string | null;
  deactivatedAt: string | null;
  createdAt: string;
  /** How many units this manager operates; always 0 for admins. */
  _count: { assignments: number };
}

export const INVITE_ROLES = ["MANAGER", "OWNER"] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];

export const INVITE_ROLE_LABEL: Record<InviteRole, string> = {
  MANAGER: "Manager",
  OWNER: "Owner",
};

export const INVITE_ROLE_HINT: Record<InviteRole, string> = {
  MANAGER: "Operates the units day to day",
  OWNER: "Owns the units, sees payouts",
};

export type InviteStatus = "PENDING" | "ACCEPTED" | "REVOKED";

export const INVITE_STATUS_LABEL: Record<InviteStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REVOKED: "Revoked",
};

/** The token hash is never selected server-side, so it isn't here either. */
export interface Invitation {
  id: string;
  email: string;
  fullName: string;
  role: InviteRole;
  status: InviteStatus;
  /** Ids, not names — the screen resolves them against the units list. */
  unitIds: string[];
  expiresAt: string;
  createdAt: string;
  acceptedAt: string | null;
}

/* ------------------------------------------------------------------------ *
 * Legacy fixture shapes.
 *
 * The dashboard's "Team" tile still counts team.fixtures.ts rather than
 * calling the API. These describe that flat fixture row — new code wants
 * Member / Invitation above.
 * ------------------------------------------------------------------------ */

export interface MemberFixture {
  id: string;
  fullName: string;
  email: string;
  role: MemberRole;
  assignments: number;
  deactivatedAt: string | null;
}

export interface InvitationFixture {
  id: string;
  fullName: string;
  email: string;
  role: InviteRole;
  status: InviteStatus;
  units: string;
  meta: string;
}
