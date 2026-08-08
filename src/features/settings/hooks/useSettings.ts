import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import { ME_QUERY_KEY } from "../../../api/queryClient";
import type { ApiEnvelope } from "../../../api/api.types";
import type { ApiUser } from "../../auth/auth.types";
import type { PasswordValues } from "../settings.schema";

/**
 * Every one of these changes the signed-in user, so the answer is written
 * straight into the /auth/me cache — the header and sidebar read from there.
 */
function useWriteMe() {
  const queryClient = useQueryClient();
  return (user: ApiUser) => queryClient.setQueryData(ME_QUERY_KEY, user);
}

export function useUpdateProfile() {
  const writeMe = useWriteMe();

  return useMutation({
    mutationFn: async (payload: {
      fullName?: string;
      phoneNumber?: string | null;
    }) => {
      const { data } = await api.patch<ApiEnvelope<ApiUser>>(
        "/settings/profile",
        payload,
      );
      return data.data;
    },
    onSuccess: writeMe,
  });
}

/**
 * The current password is required even though the caller is signed in: a
 * session left open on a shared machine shouldn't be enough to lock the real
 * owner out. Rate-limited to 5 attempts per 15 minutes server-side.
 */
export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: PasswordValues) => {
      await api.post("/settings/password", payload);
    },
  });
}

export function useSetAvatar() {
  const writeMe = useWriteMe();

  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData();
      body.append("avatar", file);

      const { data } = await api.put<ApiEnvelope<ApiUser>>(
        "/settings/avatar",
        body,
      );
      return data.data;
    },
    onSuccess: writeMe,
  });
}

export function useRemoveAvatar() {
  const writeMe = useWriteMe();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete<ApiEnvelope<ApiUser>>(
        "/settings/avatar",
      );
      return data.data;
    },
    onSuccess: writeMe,
  });
}
