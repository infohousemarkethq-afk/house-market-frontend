import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import type {
  DamageDetail,
  DamageSeverity,
  DamageSummary,
  PhotoSummary,
} from "../maintenance.types";

export const damageKeys = {
  all: ["damage"] as const,
  lists: () => [...damageKeys.all, "list"] as const,
  unit: (unitId: string) => [...damageKeys.lists(), unitId] as const,
  detail: (id: string) => [...damageKeys.all, "detail", id] as const,
};

export function useUnitDamage(unitId: string | undefined) {
  return useQuery({
    queryKey: damageKeys.unit(unitId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<DamageSummary>>>(
        "/maintenance/damage",
        { params: { unitId, page: 1 } },
      );
      return data.data;
    },
    enabled: Boolean(unitId),
  });
}

export interface CreateDamagePayload {
  /** Damage belongs to a stay; the server reads the unit off the booking. */
  bookingId: string;
  description: string;
  severity: DamageSeverity;
  /** Kobo. */
  estimatedCost?: number;
}

export function useCreateDamage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateDamagePayload) => {
      const { data } = await api.post<ApiEnvelope<DamageDetail>>(
        "/maintenance/damage",
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: damageKeys.lists() });
    },
  });
}

export function useUploadDamagePhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, files }: { id: string; files: File[] }) => {
      const body = new FormData();
      files.forEach((file) => body.append("photos", file));

      const { data } = await api.post<ApiEnvelope<PhotoSummary[]>>(
        `/maintenance/damage/${id}/photos`,
        body,
      );
      return data.data;
    },
    onSuccess: (_photos, { id }) => {
      queryClient.invalidateQueries({ queryKey: damageKeys.detail(id) });
    },
  });
}

export function useResolveDamage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      resolutionNote,
    }: {
      id: string;
      resolutionNote: string;
    }) => {
      const { data } = await api.post<ApiEnvelope<DamageDetail>>(
        `/maintenance/damage/${id}/resolve`,
        { resolutionNote },
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: damageKeys.lists() });
    },
  });
}
