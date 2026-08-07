import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useForgotPassword } from "../hooks/useAuthMutations";
import {
  ForgotPasswordSchema,
  type ForgotPasswordValues,
} from "../schema/ForgotPasswordSchema";

const ForgotPasswordForm = () => {
  const forgotPassword = useForgotPassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(ForgotPasswordSchema),
    mode: "onTouched",
  });

  const onSubmit = (values: ForgotPasswordValues) => {
    forgotPassword.mutate(values, {
      onSuccess: () => {
        toast.success(`If ${values.email} has an account, the link is on its way.`);
        reset();
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "We couldn't send the link."));
      },
    });
  };

  return (
    <>
      <div className="mb-9">
        <h2 className="font-serif text-[38px] leading-tight text-[#141412]">
          Reset your password
        </h2>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          We'll email you a link. It's good for 30 minutes and works once.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          className="mt-7 w-full"
          disabled={forgotPassword.isPending}
        >
          {forgotPassword.isPending ? "Sending…" : "Send reset link"}
        </Button>
      </form>

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

export default ForgotPasswordForm;
