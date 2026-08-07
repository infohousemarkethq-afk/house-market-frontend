import { useQuery } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope } from "../../../api/api.types";
import type { InvitePreview } from "../auth.types";

/**
 * Public: reads an invitation from its emailed token so the accept screen can
 * show who invited you, which units it covers, and whether you need to set a
 * password (an existing owner joining a second company already has one).
 */
export function useInvitePreview(token: string | null) {
  return useQuery({
    queryKey: ["invite", token],
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<InvitePreview>>(
        "/auth/invites/verify",
        { params: { token } },
      );
      return data.data;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });
}
