import { AxiosError } from "axios";

import type { ApiErrorBody } from "../api/api.types";

/** The message to show a user when a request fails. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!(error instanceof AxiosError)) return fallback;
  if (!error.response) return "Can't reach the server. Check your connection.";

  const data = error.response.data as ApiErrorBody | undefined;

  // A 400 carries per-field detail. Showing the bare "Validation error" the
  // API pairs it with tells the user nothing they can act on.
  const fieldError = data?.errors && Object.values(data.errors).flat()[0];
  if (fieldError) return fieldError;

  return data?.message ?? fallback;
}
