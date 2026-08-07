import { AxiosError } from "axios";

import type { ApiErrorBody } from "../../api/api.types";
import type { ApiRole, ViewRole } from "./auth.types";

/**
 * The single point where the API's role vocabulary becomes the UI's. Mapping
 * inline anywhere else means four places to fix when a role is added.
 *
 * SUPER_ADMIN maps to null on purpose — it isn't a view this app renders.
 */
const VIEW_ROLES: Record<ApiRole, ViewRole | null> = {
  COMPANY_ADMIN: "admin",
  MANAGER: "manager",
  OWNER: "owner",
  SUPER_ADMIN: null,
};

export function toViewRole(role: ApiRole): ViewRole | null {
  return VIEW_ROLES[role] ?? null;
}

function errorBody(error: unknown): ApiErrorBody | undefined {
  if (!(error instanceof AxiosError)) return undefined;
  return error.response?.data as ApiErrorBody | undefined;
}

/**
 * A sign-in attempt on an account that never confirmed its email. Login shows
 * this inline with a resend action instead of a generic failure toast.
 *
 * Matched on `code`, not on the 403 status: a deactivated account and a
 * suspended company also answer 403, and offering either of them a "resend
 * code" button sends them chasing an email that will never help.
 */
export function isEmailNotVerified(error: unknown): boolean {
  return errorBody(error)?.code === "EMAIL_NOT_VERIFIED";
}
