import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope } from "../../../api/api.types";
import type { InviteFormValues } from "../team.schema";
import type { Invitation, Member } from "../team.types";

export const teamKeys = {
  all: ["team"] as const,
  members: () => [...teamKeys.all, "members"] as const,
  invites: () => [...teamKeys.all, "invites"] as const,
};

/** Admins and managers of this company. Not paginated — a company's staff is small. */
export function useMembers() {
  return useQuery({
    queryKey: teamKeys.members(),
    queryFn: async () => {
      const { data } = await api.get<ApiEnvelope<Member[]>>("/company/members");
      return data.data;
    },
  });
}

export function useInvites() {
  return useQuery({
    queryKey: teamKeys.invites(),
    queryFn: async () => {
      const { data } =
        await api.get<ApiEnvelope<Invitation[]>>("/auth/invites");
      return data.data;
    },
  });
}

/**
 * Soft removal: the row survives so audit history, createdBy links and past
 * bookings keep resolving. Their live sessions are destroyed server-side, so
 * the member is signed out the moment this returns.
 */
export function useDeactivateMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete<ApiEnvelope<Member>>(
        `/company/members/${userId}`,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members() });
    },
  });
}

/**
 * Accepting an invite creates the member, so the members list is dropped
 * alongside the invites one — otherwise a newly joined manager wouldn't show
 * up until a reload.
 */
function useInvalidateInvites() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: teamKeys.invites() });
    queryClient.invalidateQueries({ queryKey: teamKeys.members() });
  };
}

export function useCreateInvite() {
  const invalidate = useInvalidateInvites();

  return useMutation({
    mutationFn: async (payload: InviteFormValues) => {
      const { data } = await api.post<ApiEnvelope<Invitation>>(
        "/auth/invites",
        payload,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
}

export function useRevokeInvite() {
  const invalidate = useInvalidateInvites();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const { data } = await api.post<ApiEnvelope<Invitation>>(
        `/auth/invites/${inviteId}/revoke`,
      );
      return data.data;
    },
    onSuccess: invalidate,
  });
}
