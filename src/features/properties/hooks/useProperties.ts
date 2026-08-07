import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import {
  queryParamsFromFilters,
  type toPropertyPayload,
} from "../properties.utils";
import type {
  PropertyDetail,
  PropertyFilters,
  PropertySummary,
} from "../properties.types";

export const propertyKeys = {
  all: ["properties"] as const,
  lists: () => [...propertyKeys.all, "list"] as const,
  list: (filters: PropertyFilters) =>
    [...propertyKeys.lists(), filters] as const,
  details: () => [...propertyKeys.all, "detail"] as const,
  detail: (id: string) => [...propertyKeys.details(), id] as const,
  cities: () => [...propertyKeys.all, "cities"] as const,
};

/** Whatever `toPropertyPayload` produces — create and update take the same body. */
type PropertyPayload = ReturnType<typeof toPropertyPayload>;

export function useProperties(filters: PropertyFilters) {
  return useQuery({
    queryKey: propertyKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<PropertySummary>>>(
        "/property",
        { params: queryParamsFromFilters(filters) },
      );
      return data.data;
    },
    // Keeps the previous page on screen while the next one loads, so typing in
    // the search box doesn't blank the grid on every keystroke.
    placeholderData: keepPreviousData,
  });
}

export function useProperty(id: string | undefined) {
  return useQuery({
    queryKey: propertyKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<PropertyDetail>>(
        `/property/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

/**
 * Distinct cities the company has buildings in, for the list filter.
 * Rarely changes, so it isn't refetched on every visit to the screen.
 */
export function usePropertyCities() {
  return useQuery({
    queryKey: propertyKeys.cities(),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<string[]>>("/property/cities");
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/** Every list is invalidated on write — filters mean many cached pages. */
function useInvalidateProperties() {
  const queryClient = useQueryClient();

  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: propertyKeys.lists() });
    queryClient.invalidateQueries({ queryKey: propertyKeys.cities() });
    if (id) {
      queryClient.invalidateQueries({ queryKey: propertyKeys.detail(id) });
    }
  };
}

export function useCreateProperty() {
  const invalidate = useInvalidateProperties();

  return useMutation({
    mutationFn: async (payload: PropertyPayload) => {
      const { data } = await api.post<ApiEnvelope<PropertyDetail>>(
        "/property",
        payload,
      );
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdateProperty(id: string) {
  const invalidate = useInvalidateProperties();

  return useMutation({
    mutationFn: async (payload: PropertyPayload) => {
      const { data } = await api.patch<ApiEnvelope<PropertyDetail>>(
        `/property/${id}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => invalidate(id),
  });
}

/**
 * The image is its own endpoint, so creating a property with a picture is two
 * calls: create, then upload against the id that comes back.
 *
 * Content-Type is left unset on purpose — axios derives the multipart
 * boundary from the FormData, and setting it by hand drops that boundary.
 */
export function useSetPropertyImage() {
  const invalidate = useInvalidateProperties();

  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const body = new FormData();
      body.append("image", file);

      const { data } = await api.put<ApiEnvelope<PropertyDetail>>(
        `/property/${id}/image`,
        body,
      );
      return data.data;
    },
    onSuccess: (property) => invalidate(property.id),
  });
}

export function useDeletePropertyImage() {
  const invalidate = useInvalidateProperties();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiEnvelope<PropertyDetail>>(
        `/property/${id}/image`,
      );
      return data.data;
    },
    onSuccess: (property) => invalidate(property.id),
  });
}

export function useArchiveProperty() {
  const invalidate = useInvalidateProperties();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiEnvelope<PropertyDetail>>(
        `/property/${id}`,
      );
      return data.data;
    },
    onSuccess: (property) => invalidate(property.id),
  });
}

export function useRestoreProperty() {
  const invalidate = useInvalidateProperties();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiEnvelope<PropertyDetail>>(
        `/property/${id}/restore`,
      );
      return data.data;
    },
    onSuccess: (property) => invalidate(property.id),
  });
}
