import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import { paymentQueryParams } from "../payments.utils";
import type {
  CreatePaymentInput,
  PaymentDetail,
  PaymentFilters,
  PaymentSummaryRow,
  PaymentTotals,
  UpdatePaymentInput,
} from "../payment.types";

export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: (filters: PaymentFilters) =>
    [...paymentKeys.lists(), filters] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: string) => [...paymentKeys.details(), id] as const,
  totals: (from: string, to: string) =>
    [...paymentKeys.all, "totals", from, to] as const,
};

export function usePayments(filters: PaymentFilters) {
  return useQuery({
    queryKey: paymentKeys.list(filters),
    queryFn: async () => {
      const { data } = await api.get<
        ApiEnvelope<Paginated<PaymentSummaryRow>>
      >("/payment", { params: paymentQueryParams(filters) });
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function usePayment(id: string | undefined) {
  return useQuery({
    queryKey: paymentKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<PaymentDetail>>(
        `/payment/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

/**
 * Totals for a period. The API scopes these the same way it scopes the list,
 * so an owner's `outflow` is their own payouts and nothing else — the numbers
 * always agree with the rows below them.
 */
export function usePaymentTotals(from: string, to: string) {
  return useQuery({
    queryKey: paymentKeys.totals(from, to),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<PaymentTotals>>(
        "/payment/summary",
        { params: { from, to } },
      );
      return data.data;
    },
    enabled: Boolean(from && to),
    placeholderData: keepPreviousData,
  });
}

/**
 * Totals are derived from the same rows, so any write has to drop both — a
 * list that refreshes while the summary above it doesn't is worse than either
 * being stale.
 */
function useInvalidatePayments() {
  const queryClient = useQueryClient();

  return (id?: string) => {
    queryClient.invalidateQueries({ queryKey: paymentKeys.all });
    if (id) {
      queryClient.invalidateQueries({ queryKey: paymentKeys.detail(id) });
    }
  };
}

export function useCreatePayment() {
  const invalidate = useInvalidatePayments();

  return useMutation({
    mutationFn: async (input: CreatePaymentInput) => {
      const { data } = await api.post<ApiEnvelope<PaymentSummaryRow>>(
        "/payment",
        input,
      );
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useUpdatePayment() {
  const invalidate = useInvalidatePayments();

  return useMutation({
    mutationFn: async ({
      id,
      ...input
    }: UpdatePaymentInput & { id: string }) => {
      const { data } = await api.patch<ApiEnvelope<PaymentSummaryRow>>(
        `/payment/${id}`,
        input,
      );
      return data.data;
    },
    onSuccess: (payment) => invalidate(payment.id),
  });
}

export function useDeletePayment() {
  const invalidate = useInvalidatePayments();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiEnvelope<{ id: string }>>(
        `/payment/${id}`,
      );
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}
