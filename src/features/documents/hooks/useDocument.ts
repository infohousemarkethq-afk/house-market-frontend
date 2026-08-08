import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import { documentQueryParams } from "../documents.utils";
import type {
  DocumentAccessLogEntry,
  DocumentDetail,
  DocumentFilters,
  DocumentSummary,
  DownloadLink,
} from "../document.type";

export const documentKeys = {
  all: ["documents"] as const,
  lists: () => [...documentKeys.all, "list"] as const,
  list: (filters: DocumentFilters) =>
    [...documentKeys.lists(), filters] as const,
  details: () => [...documentKeys.all, "detail"] as const,
  detail: (id: string) => [...documentKeys.details(), id] as const,
  accessLog: (id: string) => [...documentKeys.detail(id), "access-log"] as const,
};

export function useDocuments(filters: DocumentFilters) {
  return useQuery({
    queryKey: documentKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<DocumentSummary>>>(
        "/document",
        { params: documentQueryParams(filters) },
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

/** Every unit's documents, for the panel on the unit screen. */
export function useUnitDocuments(unitId: string | undefined) {
  return useQuery({
    queryKey: documentKeys.list({
      page: 1,
      search: "",
      unitId: unitId ?? "",
      category: "",
    }),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<DocumentSummary>>>(
        "/document",
        { params: { page: 1, unitId } },
      );
      return data.data;
    },
    enabled: Boolean(unitId),
  });
}

/**
 * Fetching a sensitive document writes a VIEWED entry to its access log, so
 * the log query is invalidated once the record lands — otherwise the timeline
 * below it would be one visit out of date.
 */
export function useDocument(id: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: documentKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<DocumentDetail>>(
        `/document/${id}`,
      );

      if (data.data.isSensitive) {
        queryClient.invalidateQueries({
          queryKey: documentKeys.accessLog(data.data.id),
        });
      }
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useDocumentAccessLog(id: string | undefined, enabled = true) {
  return useQuery({
    queryKey: documentKeys.accessLog(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<DocumentAccessLogEntry[]>>(
        `/document/${id}/access-log`,
      );
      return data.data;
    },
    enabled: Boolean(id) && enabled,
  });
}

function useInvalidateDocuments() {
  const queryClient = useQueryClient();

  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: documentKeys.lists() });
    if (id) {
      queryClient.invalidateQueries({ queryKey: documentKeys.detail(id) });
    }
  };
}

interface UploadDocumentInput {
  unitId: string;
  documentName: string;
  documentCategory: string;
  file: File;
}

/**
 * Multipart, because the file and its metadata are one request on the server.
 * Content-Type is left unset on purpose — axios derives the boundary from the
 * FormData, and setting it by hand drops that boundary.
 */
export function useUploadDocument() {
  const invalidate = useInvalidateDocuments();

  return useMutation({
    mutationFn: async ({
      file,
      ...fields
    }: UploadDocumentInput): Promise<DocumentSummary> => {
      const body = new FormData();
      body.append("file", file);
      body.append("unitId", fields.unitId);
      body.append("documentName", fields.documentName);
      body.append("documentCategory", fields.documentCategory);

      const { data } = await api.post<ApiEnvelope<DocumentSummary>>(
        "/document",
        body,
      );
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}

/**
 * A mutation rather than a query: the link is minted on request, expires in
 * minutes, and each call is logged. Caching it would hand out a dead URL.
 */
export function useDocumentDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.get<ApiEnvelope<DownloadLink>>(
        `/document/${id}/download`,
      );
      return data.data;
    },
    onSuccess: (_link, id) => {
      queryClient.invalidateQueries({ queryKey: documentKeys.accessLog(id) });
    },
  });
}

