import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import PasswordField from "../../../components/ui/PasswordField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useResetPassword } from "../hooks/useAuthMutations";
import {
  ResetPasswordSchema,
  type ResetPasswordValues,
} from "../schema/ResetPasswordSchema";

const ResetPasswordForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const resetPassword = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(ResetPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = ({ password }: ResetPasswordValues) => {
    if (!token) return;

    // The API calls the field `newPassword`; the input is just "password".
    resetPassword.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          // The API destroyed every session for this account, including any
          // this browser held. Drop the cached session rather than calling
          // logout — there is nothing left on the server to log out of.
          queryClient.clear();
          toast.success("Password updated. Sign in with your new one.");
          navigate("/login", { replace: true });
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(error, "We couldn't update your password."),
          );
        },
      },
    );
  };

  return (
    <>
      <h2 className="mb-9 font-serif text-[38px] leading-tight text-[#141412]">
        Choose a new password
      </h2>

      {token ? (
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <PasswordField
            label="New password"
            autoComplete="new-password"
            hint="At least 8 characters."
            error={errors.password?.message}
            {...register("password")}
          />

          <Callout className="mt-6">
            Saving this will sign you out everywhere — including this browser's
            other tabs and the mobile app.
          </Callout>

          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={resetPassword.isPending}
          >
            {resetPassword.isPending ? "Saving…" : "Save and sign out everywhere"}
          </Button>
        </form>
      ) : (
        <>
          <Callout tone="warning" title="This reset link is no longer valid">
            Links work once and expire after 30 minutes. Request a fresh one to
            keep going.
          </Callout>

          <Button
            className="mt-6 w-full"
            onClick={() => navigate("/forgot-password")}
          >
            Request a new link
          </Button>
        </>
      )}

      <p className="mt-6 text-center">
        <Link
          to="/login"
          className="text-[15px] text-[#4A463E] hover:text-[#141412] hover:underline"
        >
          Back to login
        </Link>
      </p>
    </>
  );
};

export default ResetPasswordForm;
