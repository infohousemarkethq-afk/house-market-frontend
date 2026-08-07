import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import PasswordField from "../../../components/ui/PasswordField";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useLogin, useResendOtp } from "../hooks/useAuthMutations";
import { isEmailNotVerified } from "../auth.utils";
import { LoginSchema, type LoginValues } from "../schema/LoginSchema";

const LoginForm = () => {
  /** Set when the API rejects a sign-in because the address was never confirmed. */
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();
  const resendOtp = useResendOtp();

  /** Where the guard bounced them from, so we can put them back. */
  const from = (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(LoginSchema),
    mode: "onTouched",
  });

  const onSubmit = (values: LoginValues) => {
    setUnverifiedEmail(null);

    login.mutate(values, {
      // The mutation seeds the session cache with the user the API returned,
      // so by the time we navigate the app already knows who this is.
      onSuccess: (user) => {
        toast.success(`Welcome back, ${user.fullName.split(" ")[0]}`);
        navigate(from, { replace: true });
      },
      onError: (error) => {
        if (isEmailNotVerified(error)) {
          setUnverifiedEmail(values.email);
          return;
        }
        toast.error(getApiErrorMessage(error, "We couldn't sign you in."));
      },
    });
  };

  const onResend = () => {
    if (!unverifiedEmail) return;

    resendOtp.mutate(
      { email: unverifiedEmail },
      {
        onSuccess: () => {
          toast.success("We sent a new code to your email.");
          navigate(`/verify-otp?email=${encodeURIComponent(unverifiedEmail)}`);
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "We couldn't resend the code."));
        },
      },
    );
  };

  return (
    <>
      <div className="mb-9">
        <h2 className="font-serif text-[38px] leading-tight text-[#141412]">
          Welcome back
        </h2>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          Sign in to your company workspace.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register("email")}
          />

          <PasswordField
            label="Password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register("password")}
          />
        </div>

        <div className="mt-3 mb-6 text-right">
          <Link
            to="/forgot-password"
            className="text-[14px] text-[#4A463E] underline underline-offset-4 hover:text-[#141412]"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={login.isPending}>
          {login.isPending ? "Signing in…" : "Log in"}
        </Button>
      </form>

      {unverifiedEmail && (
        <Callout
          tone="warning"
          title="Please verify your email before logging in"
          className="mt-6"
        >
          <p>
            We sent a 6-digit code to {unverifiedEmail}. Enter it to activate
            your account.
          </p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={onResend}
            disabled={resendOtp.isPending}
          >
            {resendOtp.isPending ? "Sending…" : "Resend code"}
          </Button>
        </Callout>
      )}

      <p className="mt-8 text-center text-[15px] text-[#6B665C]">
        No account yet?{" "}
        <Link to="/signup" className="font-semibold text-[#2F6B4E] hover:underline">
          Register your company
        </Link>
      </p>
    </>
  );
};

export default LoginForm;
