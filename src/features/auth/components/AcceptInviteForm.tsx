import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import Loader from "../../../components/ui/Loader";
import PasswordField from "../../../components/ui/PasswordField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useAcceptInvite } from "../hooks/useAuthMutations";
import { useInvitePreview } from "../hooks/useInvitePreview";
import {
  acceptInviteSchemaFor,
  type AcceptInviteValues,
} from "../schema/AcceptInviteSchema";

const ROLE_LABELS = {
  MANAGER: "Manager",
  OWNER: "Owner",
} as const;

const AcceptInviteForm = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const navigate = useNavigate();
  const { data: invite, isPending, isError } = useInvitePreview(token);
  const acceptInvite = useAcceptInvite();

  /**
   * An invitee who already has an account (an owner joining a second company)
   * doesn't set a password. Default to requiring one until the API says
   * otherwise, so the field never flickers from optional to required.
   */
  const requiresPassword = invite?.requiresPassword ?? true;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptInviteValues>({
    resolver: zodResolver(acceptInviteSchemaFor(requiresPassword)),
    mode: "onTouched",
  });

  const onSubmit = ({ password }: AcceptInviteValues) => {
    if (!token) return;

    acceptInvite.mutate(
      { token, ...(requiresPassword && password ? { password } : {}) },
      {
        // Accepting proves they control the invited address, so the API signs
        // them in — same as verifying an OTP. Straight to the app.
        onSuccess: () => {
          toast.success("You're in.");
          navigate("/dashboard", { replace: true });
        },
        onError: (error) => {
          toast.error(
            getApiErrorMessage(error, "We couldn't accept this invitation."),
          );
        },
      },
    );
  };

  if (token && isPending) return <Loader label="Checking your invitation" />;

  // No token, or the API rejected it: expired, revoked, already accepted, or
  // the inviting company was suspended. All the same dead end to the user.
  if (!token || isError || !invite) {
    return (
      <>
        <Callout tone="warning" title="This invitation link is no longer valid">
          Invitations expire, and each one works once. Ask whoever invited you
          to send a fresh one.
        </Callout>

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
  }

  return (
    <>
      <div className="mb-9">
        <h2 className="font-serif text-[38px] leading-tight text-[#141412]">
          Accept your invitation
        </h2>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          {invite.companyName} invited you to join House Market as a{" "}
          {ROLE_LABELS[invite.role]}.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {invite.units.length > 0 && (
          <Callout className="mb-6">
            <p className="font-label text-[11px] tracking-[0.18em] uppercase">
              This invitation covers
            </p>

            <ul className="mt-3 space-y-2">
              {invite.units.map((unit) => (
                <li
                  key={unit.id}
                  className="flex items-baseline justify-between gap-4"
                >
                  <span className="font-medium text-[#141412]">
                    {unit.unitName}
                  </span>
                  <span className="text-[13px]">{unit.propertyName}</span>
                </li>
              ))}
            </ul>
          </Callout>
        )}

        {requiresPassword ? (
          <PasswordField
            label="New password"
            autoComplete="new-password"
            hint="At least 8 characters."
            error={errors.password?.message}
            {...register("password")}
          />
        ) : (
          <Callout>
            You already have a House Market account for {invite.email}. Sign in
            with your existing password after accepting.
          </Callout>
        )}

        <Button
          type="submit"
          className="mt-7 w-full"
          disabled={acceptInvite.isPending}
        >
          {acceptInvite.isPending ? "Setting up…" : "Accept invitation"}
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

export default AcceptInviteForm;
