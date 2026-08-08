import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import ImagePicker from "../components/ui/ImagePicker";
import PasswordField from "../components/ui/PasswordField";
import TextField from "../components/ui/TextField";
import { getApiErrorMessage } from "../utils/apiError.util";
import { initials } from "../utils/initials.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import type { ApiUser } from "../features/auth/auth.types";
import {
  PasswordSchema,
  ProfileSchema,
  type PasswordValues,
  type ProfileValues,
} from "../features/settings/settings.schema";
import {
  useChangePassword,
  useRemoveAvatar,
  useSetAvatar,
  useUpdateProfile,
} from "../features/settings/hooks/useSettings";

const ProfileCard = ({ user }: { user: ApiUser }) => {
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(ProfileSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: user.fullName,
      phoneNumber: user.phoneNumber ?? "",
    },
  });

  const onSubmit = async (values: ProfileValues) => {
    try {
      // Cleared means "remove it" — the API takes null, not an empty string.
      await updateProfile.mutateAsync({
        fullName: values.fullName,
        phoneNumber: values.phoneNumber || null,
      });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't save your profile."));
    }
  };

  return (
    <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7">
      <h2 className="text-[20px] font-semibold text-[#141412]">Your details</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Full name"
            error={errors.fullName?.message}
            {...register("fullName")}
          />
          <TextField
            label="Phone"
            hint="Optional"
            error={errors.phoneNumber?.message}
            {...register("phoneNumber")}
          />
        </div>

        {/* Email isn't editable: changing it would move the account itself,
            and there's no endpoint for it. */}
        <p className="mt-4 text-[13px] text-[#8A857B]">
          Signed in as {user.email}. Contact your administrator to change the
          address on the account.
        </p>

        <Button
          type="submit"
          disabled={!isDirty || updateProfile.isPending}
          className="mt-6 px-8"
        >
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </section>
  );
};

const AvatarCard = ({ user }: { user: ApiUser }) => {
  const [file, setFile] = useState<File | null>(null);
  const setAvatar = useSetAvatar();
  const removeAvatar = useRemoveAvatar();

  const busy = setAvatar.isPending || removeAvatar.isPending;

  const onUpload = async () => {
    if (!file) return;

    try {
      await setAvatar.mutateAsync(file);
      setFile(null);
      toast.success("Photo updated");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't upload that photo."));
    }
  };

  const onRemove = async () => {
    try {
      await removeAvatar.mutateAsync();
      setFile(null);
      toast.success("Photo removed");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't remove that photo."));
    }
  };

  return (
    <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7">
      <div className="flex items-center gap-4">
        <span className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#141412] text-[15px] font-semibold text-[#F5F3EF]">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(user.fullName)
          )}
        </span>

        <h2 className="text-[20px] font-semibold text-[#141412]">Photo</h2>
      </div>

      <div className="mt-5">
        <ImagePicker
          label=""
          value={file}
          onChange={setFile}
          existingUrl={user.avatarUrl}
          disabled={busy}
          hint="JPEG, PNG or WebP, up to 5MB."
        />
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={onUpload} disabled={!file || busy}>
          {setAvatar.isPending ? "Uploading…" : "Save photo"}
        </Button>

        {user.avatarUrl && (
          <Button variant="secondary" onClick={onRemove} disabled={busy}>
            {removeAvatar.isPending ? "Removing…" : "Remove photo"}
          </Button>
        )}
      </div>
    </section>
  );
};

const PasswordCard = () => {
  const changePassword = useChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PasswordValues>({
    resolver: zodResolver(PasswordSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "" },
  });

  const onSubmit = async (values: PasswordValues) => {
    try {
      await changePassword.mutateAsync(values);
      reset();
      toast.success("Password changed");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't change your password."),
      );
    }
  };

  return (
    <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7">
      <h2 className="text-[20px] font-semibold text-[#141412]">Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="Current password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register("currentPassword")}
          />
          <PasswordField
            label="New password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
        </div>

        <Callout tone="muted" className="mt-5">
          Your current password is asked for even though you're signed in — a
          session left open shouldn't be enough to lock you out of your own
          account.
        </Callout>

        <Button
          type="submit"
          disabled={changePassword.isPending}
          className="mt-6 px-8"
        >
          {changePassword.isPending ? "Changing…" : "Change password"}
        </Button>
      </form>
    </section>
  );
};

const Settings = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-[900px]">
      <div className="mb-8">
        <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
          Your account
        </h1>
        <p className="mt-1 text-[15px] text-[#6B665C]">
          Your name, photo and password. Everyone manages their own, whatever
          their role.
        </p>
      </div>

      <div className="space-y-5">
        <ProfileCard user={user} />
        <AvatarCard user={user} />
        <PasswordCard />
      </div>
    </div>
  );
};

export default Settings;
