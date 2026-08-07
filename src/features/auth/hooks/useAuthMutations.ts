import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "../../../api/axiosInstance";
import type { ApiEnvelope } from "../../../api/api.types";
import type { ApiUser } from "../auth.types";
import { ME_QUERY_KEY } from "./useMe";
import type { LoginValues } from "../schema/LoginSchema";
import type { RegisterValues } from "../schema/SignupSchema";

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export interface EmailPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  newPassword: string;
}

export interface AcceptInvitePayload {
  token: string;
  /** Omitted when the invitee already has an account. */
  password?: string;
}

/**
 * The three endpoints that hand back a live session (login, verify-otp,
 * accept-invite) seed the cache with the user they return, so the app knows
 * who is signed in without a second round trip to /auth/me.
 */
function useSessionCache() {
  const queryClient = useQueryClient();
  return (user: ApiUser) => queryClient.setQueryData(ME_QUERY_KEY, user);
}

export function useLogin() {
  const seedSession = useSessionCache();

  return useMutation({
    mutationFn: async (values: LoginValues) => {
      const { data } = await api.post<ApiEnvelope<ApiUser>>(
        "/auth/login",
        values,
      );
      return data.data;
    },
    onSuccess: seedSession,
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (values: RegisterValues) => {
      // No session yet — signup only creates the account and mails an OTP.
      const { data } = await api.post<ApiEnvelope<ApiUser>>(
        "/auth/signup",
        values,
      );
      return data.data;
    },
  });
}

export function useVerifyOtp() {
  const seedSession = useSessionCache();

  return useMutation({
    mutationFn: async (payload: VerifyOtpPayload) => {
      const { data } = await api.post<ApiEnvelope<ApiUser>>(
        "/auth/verify-otp",
        payload,
      );
      return data.data;
    },
    // Verifying proves ownership of the address, so the API logs them in.
    onSuccess: seedSession,
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async (payload: EmailPayload) => {
      await api.post("/auth/send-otp", payload);
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (payload: EmailPayload) => {
      await api.post("/auth/forgot-password", payload);
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      await api.post("/auth/reset-password", payload);
    },
  });
}

export function useAcceptInvite() {
  const seedSession = useSessionCache();

  return useMutation({
    mutationFn: async (payload: AcceptInvitePayload) => {
      const { data } = await api.post<ApiEnvelope<ApiUser>>(
        "/auth/invites/accept",
        payload,
      );
      return data.data;
    },
    onSuccess: seedSession,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    // Clear regardless: if the call failed because the session was already
    // gone, staying "signed in" on the client is the wrong answer.
    onSettled: () => queryClient.clear(),
  });
}
