import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import type {
  MaintenanceDetail,
  MaintenanceStatus,
  MaintenanceSummary,
  PhotoSummary,
} from "../maintenance.types";

export const maintenanceKeys = {
  all: ["maintenance"] as const,
  lists: () => [...maintenanceKeys.all, "list"] as const,
  unit: (unitId: string) => [...maintenanceKeys.lists(), unitId] as const,
  details: () => [...maintenanceKeys.all, "detail"] as const,
  detail: (id: string) => [...maintenanceKeys.details(), id] as const,
};

/** Every record on a unit — managers see each other's, not just their own. */
export function useUnitMaintenance(unitId: string | undefined) {
  return useQuery({
    queryKey: maintenanceKeys.unit(unitId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<
        ApiEnvelope<Paginated<MaintenanceSummary>>
      >("/maintenance", { params: { unitId, page: 1 } });
      return data.data;
    },
    enabled: Boolean(unitId),
    placeholderData: keepPreviousData,
  });
}

export function useMaintenanceLog(id: string | undefined) {
  return useQuery({
    queryKey: maintenanceKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<MaintenanceDetail>>(
        `/maintenance/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export interface CreateMaintenancePayload {
  unitId: string;
  type: string;
  category: string;
  title: string;
  description: string;
  status?: MaintenanceStatus;
  /** Kobo. */
  cost?: number;
  performedAt?: string;
  bookingId?: string;
}

function useInvalidateMaintenance() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: maintenanceKeys.lists() });
  };
}

export function useCreateMaintenance() {
  const invalidate = useInvalidateMaintenance();

  return useMutation({
    mutationFn: async (payload: CreateMaintenancePayload) => {
      const { data } = await api.post<ApiEnvelope<MaintenanceDetail>>(
        "/maintenance",
        payload,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
}

/**
 * Photos are their own endpoint, so logging work with pictures is two calls:
 * create, then upload against the id that comes back. Content-Type is left
 * unset so axios can derive the multipart boundary from the FormData.
 */
export function useUploadMaintenancePhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, files }: { id: string; files: File[] }) => {
      const body = new FormData();
      files.forEach((file) => body.append("photos", file));

      const { data } = await api.post<ApiEnvelope<PhotoSummary[]>>(
        `/maintenance/${id}/photos`,
        body,
      );
      return data.data;
    },
    onSuccess: (_photos, { id }) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.detail(id) });
    },
  });
}
