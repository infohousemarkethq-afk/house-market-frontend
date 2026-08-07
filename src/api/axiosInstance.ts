import axios, { AxiosError } from "axios";

import { ME_QUERY_KEY, queryClient } from "./queryClient";

export const api = axios.create({
  // Must include /v1 — the API mounts every module under /api/v1.
  baseURL: import.meta.env.VITE_API_URL,
  // The session cookie is httpOnly; without this the browser never sends it.
  withCredentials: true,
});

/**
 * Endpoints where a 401 is a normal answer, not an expired session:
 * /auth/me answers 401 for "nobody is signed in", and /auth/login answers 401
 * for a wrong password. Treating either as an expiry would sign people out of
 * a session they never had, or blank the screen on a typo.
 */
const EXPECTED_401 = ["/auth/me", "/auth/login"];

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    const expected = EXPECTED_401.some((path) => url.startsWith(path));

    if (error.response?.status === 401 && !expected) {
      // Drop the session and let the route guards react. Redirecting from here
      // would mean navigating from outside the router; this way the guard
      // does it declaratively, and any open screen re-renders as signed-out.
      queryClient.setQueryData(ME_QUERY_KEY, null);
    }

    return Promise.reject(error);
  },
);
