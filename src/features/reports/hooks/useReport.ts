import { useQuery } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope } from "../../../api/api.types";
import type { PerformanceReport, UnitReport } from "../report.types";

export const reportKeys = {
  all: ["reports"] as const,
  performance: (month: string) =>
    [...reportKeys.all, "performance", month] as const,
  unit: (unitId: string, month: string) =>
    [...reportKeys.all, "unit", unitId, month] as const,
};

/**
 * Portfolio-level occupancy and revenue for a given month.
 * Omit month to get the current month (the API defaults to it).
 */
export function useReportPerformance(month: string) {
  return useQuery({
    queryKey: reportKeys.performance(month),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<PerformanceReport>>(
        "/report/performance",
        { params: month ? { month } : {} },
      );
      return data.data;
    },
  });
}

/**
 * Detailed single-unit report for a given month.
 * Only runs when unitId is provided — used by the drill-down view.
 */
export function useUnitReport(unitId: string | undefined, month: string) {
  return useQuery({
    queryKey: reportKeys.unit(unitId ?? "", month),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<UnitReport>>(
        `/report/unit/${unitId}`,
        { params: month ? { month } : {} },
      );
      return data.data;
    },
    enabled: Boolean(unitId),
  });
}