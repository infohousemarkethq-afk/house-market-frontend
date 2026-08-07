import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import PasswordField from "../../../components/ui/PasswordField";
import TextField from "../../../components/ui/TextField";
import { cn } from "../../../utils/cn.util";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useSignup } from "../hooks/useAuthMutations";
import {
  AccountStepSchema,
  RegisterSchema,
  type RegisterValues,
} from "../schema/SignupSchema";

const ACCOUNT_FIELDS = Object.keys(
  AccountStepSchema.shape,
) as (keyof RegisterValues)[];

const SignupForm = () => {
  const [step, setStep] = useState<1 | 2>(1);

  const navigate = useNavigate();
  const signup = useSignup();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(RegisterSchema),
    mode: "onTouched",
  });

  /** Only advance once step 1's own fields pass — step 2 is untouched at this point. */
  const goToCompanyStep = async () => {
    const valid = await trigger(ACCOUNT_FIELDS);
    if (valid) setStep(2);
  };

  const onSubmit = (values: RegisterValues) => {
    signup.mutate(values, {
      onSuccess: () => {
        toast.success("Account created. Check your email for the code.");
        navigate(`/verify-otp?email=${encodeURIComponent(values.email)}`);
      },
      onError: (error) => {
        toast.error(
          getApiErrorMessage(error, "We couldn't create your account."),
        );
      },
    });
  };

  return (
    <>
      <div className="mb-8 flex gap-3">
        <span className="h-[3px] flex-1 rounded-full bg-[#141412]" />
        <span
          className={cn(
            "h-[3px] flex-1 rounded-full",
            step === 2 ? "bg-[#141412]" : "bg-[#DCD6CB]",
          )}
        />
      </div>

      <p className="font-label text-[11px] tracking-[0.18em] text-[#8A857B] uppercase">
        Step {step} of 2
      </p>
      <h2 className="mt-2 mb-8 font-serif text-[38px] leading-tight text-[#141412]">
        {step === 1 ? "About you" : "About your company"}
      </h2>

      <form
        noValidate
        onSubmit={
          step === 1
            ? (event) => {
                event.preventDefault();
                void goToCompanyStep();
              }
            : handleSubmit(onSubmit)
        }
      >
        {step === 1 ? (
          <>
            <div className="space-y-5">
              <TextField
                label="Full name"
                autoComplete="name"
                error={errors.fullName?.message}
                {...register("fullName")}
              />

              <TextField
                label="Email"
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register("email")}
              />

              <PasswordField
                label="Password"
                autoComplete="new-password"
                error={errors.password?.message}
                {...register("password")}
              />
            </div>

            <Button type="submit" className="mt-7 w-full">
              Continue
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-5">
              <TextField
                label="Company name"
                error={errors.companyName?.message}
                {...register("companyName")}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Company email"
                  type="email"
                  error={errors.companyEmail?.message}
                  {...register("companyEmail")}
                />

                <TextField
                  label="Phone"
                  type="tel"
                  inputMode="tel"
                  error={errors.companyPhoneNumber?.message}
                  {...register("companyPhoneNumber")}
                />
              </div>

              <TextField
                label="Company address"
                error={errors.companyAddress?.message}
                {...register("companyAddress")}
              />
            </div>

            <div className="mt-7 flex gap-3">
              <Button
                variant="secondary"
                className="px-8"
                onClick={() => setStep(1)}
                disabled={signup.isPending}
              >
                Back
              </Button>

              <Button type="submit" className="flex-1" disabled={signup.isPending}>
                {signup.isPending ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="mt-8 text-center text-[15px] text-[#6B665C]">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-[#2F6B4E] hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
};

export default SignupForm;
