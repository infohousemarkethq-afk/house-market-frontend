import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope } from "../../../api/api.types";
import type { Company } from "../company.types";

export const companyKeys = {
  all: ["company"] as const,
  profile: () => [...companyKeys.all, "profile"] as const,
};

/** Managers may read the company they work for; owners belong to none. */
export function useCompany(enabled = true) {
  return useQuery({
    queryKey: companyKeys.profile(),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Company>>("/company/me");
      return data.data;
    },
    enabled,
  });
}

/** Admin only. A partial body — the API rejects an empty one. */
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Record<string, string | null>) => {
      const { data } = await api.patch<ApiEnvelope<Company>>(
        "/company/me",
        payload,
      );
      return data.data;
    },
    onSuccess: (company) => {
      queryClient.setQueryData(companyKeys.profile(), company);
    },
  });
}
