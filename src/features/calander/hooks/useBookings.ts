import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope, Paginated } from "../../../api/api.types";
import { toApiDate, type MonthWindow } from "../calander.utils";
import type {
  BookingDetail,
  BookingFilters,
  BookingSummary,
  CalendarView,
} from "../calander.types";

export const bookingKeys = {
  all: ["bookings"] as const,
  lists: () => [...bookingKeys.all, "list"] as const,
  list: (filters: BookingFilters, window?: { from: string; to: string }) =>
    [...bookingKeys.lists(), filters, window ?? null] as const,
  details: () => [...bookingKeys.all, "detail"] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
  calendars: () => [...bookingKeys.all, "calendar"] as const,
  calendar: (unitId: string, from: string, to: string) =>
    [...bookingKeys.calendars(), unitId, from, to] as const,
};

interface BookingQueryOptions {
  /** Stays overlapping this window, not stays starting inside it. */
  window?: MonthWindow;
}

export function useBookings(
  filters: BookingFilters,
  { window }: BookingQueryOptions = {},
) {
  const range = window
    ? { from: toApiDate(window.start), to: toApiDate(window.end) }
    : undefined;

  return useQuery({
    queryKey: bookingKeys.list(filters, range),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Paginated<BookingSummary>>>(
        "/booking",
        {
          params: {
            page: filters.page,
            ...(filters.search && { search: filters.search }),
            ...(filters.unitId && { unitId: filters.unitId }),
            ...(filters.status && { status: filters.status }),
            ...range,
          },
        },
      );
      return data.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: bookingKeys.detail(id ?? ""),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<BookingDetail>>(
        `/booking/${id}`,
      );
      return data.data;
    },
    enabled: Boolean(id),
  });
}

export function useUnitCalendars(unitIds: string[], window: MonthWindow) {
  const from = toApiDate(window.start);
  const to = toApiDate(window.end);

  return useQueries({
    queries: unitIds.map((unitId) => ({
      queryKey: bookingKeys.calendar(unitId, from, to),
      queryFn: async () => {
        const { data } = await api.get<ApiEnvelope<CalendarView>>(
          "/booking/calendar",
          { params: { unitId, from, to } },
        );
        return data.data;
      },
    })),
    combine: (results) => ({
      views: results
        .map((result) => result.data)
        .filter((view): view is CalendarView => Boolean(view)),
      isPending: results.some((result) => result.isPending),
      isError: results.some((result) => result.isError),
      error: results.find((result) => result.error)?.error,
    }),
  });
}

/** One unit's month, for the date picker in the booking and block forms. */
export function useUnitCalendar(
  unitId: string | undefined,
  window: MonthWindow,
) {
  const from = toApiDate(window.start);
  const to = toApiDate(window.end);

  return useQuery({
    queryKey: bookingKeys.calendar(unitId ?? "", from, to),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<CalendarView>>(
        "/booking/calendar",
        { params: { unitId, from, to } },
      );
      return data.data;
    },
    enabled: Boolean(unitId),
  });
}

/**
 * Bookings and blocks compete for the same dates, so any write to either has
 * to drop both caches — a new block changes what the stays list may become,
 * and a cancelled stay frees dates the calendar is drawing as busy.
 */
function useInvalidateCalendar() {
  const queryClient = useQueryClient();

  return (bookingId?: string) => {
    queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    queryClient.invalidateQueries({ queryKey: bookingKeys.calendars() });
    if (bookingId) {
      queryClient.invalidateQueries({
        queryKey: bookingKeys.detail(bookingId),
      });
    }
  };
}

export interface CreateBookingPayload {
  unitId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  guestPhone?: string;
  guestEmail?: string;
  numberOfGuests?: number;
  notes?: string;
}

export function useCreateBooking() {
  const invalidate = useInvalidateCalendar();

  return useMutation({
    mutationFn: async (payload: CreateBookingPayload) => {
      const { data } = await api.post<ApiEnvelope<BookingDetail>>(
        "/booking",
        payload,
      );
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useCancelBooking() {
  const invalidate = useInvalidateCalendar();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await api.post<ApiEnvelope<BookingDetail>>(
        `/booking/${id}/cancel`,
        reason ? { reason } : {},
      );
      return data.data;
    },
    onSuccess: (booking) => invalidate(booking.id),
  });
}

export function useCheckIn() {
  const invalidate = useInvalidateCalendar();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiEnvelope<BookingDetail>>(
        `/booking/${id}/check-in`,
      );
      return data.data;
    },
    onSuccess: (booking) => invalidate(booking.id),
  });
}

export function useCheckOut() {
  const invalidate = useInvalidateCalendar();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post<ApiEnvelope<BookingDetail>>(
        `/booking/${id}/check-out`,
      );
      return data.data;
    },
    onSuccess: (booking) => invalidate(booking.id),
  });
}

export interface CreateBlockPayload {
  unitId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export function useCreateBlock() {
  const invalidate = useInvalidateCalendar();

  return useMutation({
    mutationFn: async (payload: CreateBlockPayload) => {
      const { data } = await api.post<ApiEnvelope<{ id: string }>>(
        "/booking/calendar/block",
        payload,
      );
      return data.data;
    },
    onSuccess: () => invalidate(),
  });
}

export function useDeleteBlock() {
  const invalidate = useInvalidateCalendar();

  return useMutation({
    mutationFn: async (blockId: string) => {
      await api.delete(`/booking/calendar/block/${blockId}`);
      return blockId;
    },
    onSuccess: () => invalidate(),
  });
}
