import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";

import { api } from "../../../api/axiosInstance";
import { ME_QUERY_KEY } from "../../../api/queryClient";
import type { ApiEnvelope } from "../../../api/api.types";
import type { ApiUser } from "../auth.types";

export { ME_QUERY_KEY };

/**
 * The session, straight from the server. This is the only source of truth for
 * "who is signed in" — the cookie is httpOnly, so the client genuinely cannot
 * know without asking, and any local flag would be a guess that outlives the
 * logouts and expiries it should be following.
 *
 * A 401 is a normal answer here ("nobody"), so it resolves to null rather than
 * erroring. That keeps the guards reading `user === null` instead of having to
 * distinguish "signed out" from "the request blew up".
 */
export function useMe() {
  return useQuery<ApiUser | null>({
    queryKey: ME_QUERY_KEY,
    queryFn: async () => {
      try {
        const { data } = await api.get<ApiEnvelope<ApiUser>>("/auth/me");
        return data.data;
      } catch (error) {
        if (error instanceof AxiosError && error.response?.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: false,
    staleTime: Infinity,
  });
}
