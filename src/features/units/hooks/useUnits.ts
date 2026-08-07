import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import { unitQueryParamsFromFilters, type toUnitPayload } from "../units.utils";
import type {
  UnitDetail,
  UnitFilters,
  UnitImageSummary,
  UnitSummary,
} from "../units.types";

export const unitKeys = {
  all: ["units"] as const,
  lists: () => [...unitKeys.all, "list"] as const,
  list: (filters: UnitFilters) => [...unitKeys.lists(), filters] as const,
  byProperty: (propertyId: string) =>
    [...unitKeys.lists(), { propertyId }] as const,
  details: () => [...unitKeys.all, "detail"] as const,
  detail: (id: string) => [...unitKeys.details(), id] as const,
};

/** Whatever `toUnitPayload` produces — create and update take the same body. */
type UnitPayload = ReturnType<typeof toUnitPayload>;

export interface UnitPricePayload {
  id: string;
  /** Kobo, as the API stores it. Omit a field to leave it untouched. */
  pricePerNight?: number;
  ownerRatePerNight?: number | null;
}

export function useUnits(filters: UnitFilters) {
  return useQuery({
    queryKey: unitKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<UnitSummary>>>(
        "/unit",
        { params: unitQueryParamsFromFilters(filters) },
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useUnit(id: string | undefined) {
  return useQuery({
    queryKey: unitKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<UnitDetail>>(`/unit/${id}`);
      return data.data;
    },
    enabled: Boolean(id),
  });
}

/**
 * The active units inside one building.
 *
 * Archived ones are left out on purpose: this backs the property detail list
 * and the "can't archive yet" dialog, and both are about what is still live.
 */
export function usePropertyUnits(propertyId: string | undefined) {
  return useQuery({
    queryKey: unitKeys.byProperty(propertyId ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<UnitSummary>>>(
        "/unit",
        { params: { propertyId, limit: 100 } },
      );
      return data.data;
    },
    enabled: Boolean(propertyId),
  });
}

/**
 * Every list is invalidated on write — filters mean many cached pages. The
 * property lists go too, since a unit's archive state changes the counts the
 * property screens show.
 */
function useInvalidateUnits() {
  const queryClient = useQueryClient();

  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: unitKeys.lists() });
    queryClient.invalidateQueries({ queryKey: ["properties"] });
    if (id) queryClient.invalidateQueries({ queryKey: unitKeys.detail(id) });
  };
}

export function useCreateUnit() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async (payload: UnitPayload) => {
      const { data } = await api.post<ApiEnvelope<UnitDetail>>("/unit", payload);
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdateUnit(id: string) {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async (payload: UnitPayload) => {
      // propertyId isn't updatable — the API's updateUnitSchema has no such
      // field, and sending it would fail validation rather than move the unit.
      const { propertyId, ...rest } = payload;
      void propertyId;

      const { data } = await api.patch<ApiEnvelope<UnitDetail>>(
        `/unit/${id}`,
        rest,
      );
      return data.data;
    },
    onSuccess: () => invalidate(id),
  });
}

/** Its own endpoint, so pricing can be widened later without touching edit. */
export function useUpdateUnitPrice() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async ({ id, ...prices }: UnitPricePayload) => {
      const { data } = await api.patch<ApiEnvelope<UnitDetail>>(
        `/unit/${id}/price`,
        prices,
      );
      return data.data;
    },
    onSuccess: (unit) => invalidate(unit.id),
  });
}

export function useArchiveUnit() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiEnvelope<UnitDetail>>(`/unit/${id}`);
      return data.data;
    },
    onSuccess: (unit) => invalidate(unit.id),
  });
}

export function useRestoreUnit() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiEnvelope<UnitDetail>>(
        `/unit/${id}/restore`,
      );
      return data.data;
    },
    onSuccess: (unit) => invalidate(unit.id),
  });
}

/** Up to UNIT_IMAGES_PER_REQUEST files, all under the "images" field. */
export function useUploadUnitImages() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async ({ id, files }: { id: string; files: File[] }) => {
      const body = new FormData();
      files.forEach((file) => body.append("images", file));

      // Content-Type is left unset: axios derives the multipart boundary from
      // the FormData, and setting it by hand drops that boundary.
      const { data } = await api.post<ApiEnvelope<UnitImageSummary[]>>(
        `/unit/${id}/images`,
        body,
      );
      return data.data;
    },
    onSuccess: (_images, { id }) => invalidate(id),
  });
}

export function useDeleteUnitImage() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async ({ id, imageId }: { id: string; imageId: string }) => {
      await api.delete(`/unit/${id}/images/${imageId}`);
    },
    onSuccess: (_result, { id }) => invalidate(id),
  });
}

/**
 * Reorder takes the complete list of image ids in their new order — the API
 * rejects a partial list (REORDER_MUST_LIST_ALL) so a stale client can't
 * silently drop an image's position.
 */
export function useReorderUnitImages() {
  const invalidate = useInvalidateUnits();

  return useMutation({
    mutationFn: async ({
      id,
      imageIds,
    }: {
      id: string;
      imageIds: string[];
    }) => {
      const { data } = await api.patch<ApiEnvelope<UnitImageSummary[]>>(
        `/unit/${id}/images/reorder`,
        { imageIds },
      );
      return data.data;
    },
    onSuccess: (_images, { id }) => invalidate(id),
  });
}
