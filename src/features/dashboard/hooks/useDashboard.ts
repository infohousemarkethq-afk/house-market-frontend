import { useQuery } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope } from "../../../api/api.types";
import type { Dashboard } from "../dashboard.types";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  month: (month?: string) => [...dashboardKeys.all, month ?? "current"] as const,
};

/**
 * The whole screen in one request — scope strip, cards, occupancy chart,
 * today's movements and the activity feed. The server shapes it per role, so
 * there's nothing to filter here.
 *
 * @param month "YYYY-MM". Omitted means the current month.
 */
export function useDashboard(month?: string) {
  return useQuery({
    queryKey: dashboardKeys.month(month),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Dashboard>>("/dashboard", {
        params: month ? { month } : undefined,
      });
      return data.data;
    },
  });
}
