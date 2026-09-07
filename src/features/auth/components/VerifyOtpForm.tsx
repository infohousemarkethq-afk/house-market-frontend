import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useResendOtp, useVerifyOtp } from "../hooks/useAuthMutations";
import {
  VerifyOtpSchema,
  type VerifyOtpValues,
} from "../schema/VerifyOtpSchema";

const VerifyOtpForm = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email");

  const navigate = useNavigate();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyOtpValues>({
    resolver: zodResolver(VerifyOtpSchema),
  });

  const onSubmit = ({ code }: VerifyOtpValues) => {
    if (!email) return;

    verifyOtp.mutate(
      { email, code },
      {
        onSuccess: () => {
          toast.success("Email verified. You're all set.");
          navigate("/dashboard", { replace: true });
        },
        onError: (error) => {
          toast.error(getApiErrorMessage(error, "That code didn't work."));
        },
      },
    );
  };

  const onResend = () => {
    if (!email) return;

    resendOtp.mutate(
      { email },
      {
        onSuccess: () => toast.success("We sent a new code to your email."),
        onError: (error) =>
          toast.error(
            getApiErrorMessage(error, "We couldn't resend the code."),
          ),
      },
    );
  };

  return (
    <>
      <div className="mb-9">
        <h2 className="font-serif text-[38px] leading-tight text-[#141412]">
          Verify your email
        </h2>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          {email
            ? `Enter the 6-character code we sent to ${email}.`
            : "Enter the 6-character code we sent to your email."}
        </p>
      </div>

      {email ? (
        <>
          <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
              label="Verification code"
              autoComplete="one-time-code"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              maxLength={6}
              placeholder="k7mq3p"
              className="font-label tracking-[0.5em]"
              error={errors.code?.message}
              {...register("code")}
            />

            <Button
              type="submit"
              className="mt-7 w-full"
              disabled={verifyOtp.isPending}
            >
              {verifyOtp.isPending ? "Verifying…" : "Verify email"}
            </Button>
          </form>

          <p className="mt-6 text-center text-[15px] text-[#6B665C]">
            Didn't get the code?{" "}
            <button
              type="button"
              onClick={onResend}
              disabled={resendOtp.isPending}
              className="cursor-pointer font-semibold text-[#2F6B4E] hover:underline disabled:opacity-55"
            >
              {resendOtp.isPending ? "Sending…" : "Resend code"}
            </button>
          </p>
        </>
      ) : (
        <Callout tone="warning" title="We don't know which account to verify">
          Start from the login screen and we'll bring you back here with the
          resend action attached.
        </Callout>
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

export default VerifyOtpForm;
