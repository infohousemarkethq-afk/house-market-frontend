import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import TextField from "../../../components/ui/TextField";
import { cn } from "../../../utils/cn.util";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { UnitSummary } from "../../units/units.types";
import { InviteFormSchema, type InviteFormValues } from "../team.schema";
import {
  INVITE_ROLES,
  INVITE_ROLE_HINT,
  INVITE_ROLE_LABEL,
} from "../team.types";
import { useCreateInvite } from "../hooks/useTeam";

interface InviteModalProps {
  onClose: () => void;
  units: UnitSummary[];
}

const InviteModal = ({ onClose, units }: InviteModalProps) => {
  const createInvite = useCreateInvite();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<InviteFormValues>({
    resolver: zodResolver(InviteFormSchema),
    mode: "onTouched",
    defaultValues: {
      fullName: "",
      email: "",
      role: "MANAGER",
      unitIds: [],
    },
  });

  const picked = watch("unitIds");

  const onSubmit = async (values: InviteFormValues) => {
    try {
      await createInvite.mutateAsync(values);
      toast.success(`Invitation sent to ${values.email}`);
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't send this invitation."),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!createInvite.isPending}
      title="Invite someone"
      description="Managers operate units. Owners own them. Both need at least one unit."
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createInvite.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="invite-form"
            disabled={createInvite.isPending}
          >
            {createInvite.isPending ? "Sending…" : "Send invitation"}
          </Button>
        </div>
      }
    >
      <form id="invite-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Full name"
              placeholder="Grace Adeyemi"
              error={errors.fullName?.message}
              {...register("fullName")}
            />
            <TextField
              label="Email"
              type="email"
              placeholder="grace@example.com"
              error={errors.email?.message}
              {...register("email")}
            />
          </div>

          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div>
                <p className="mb-2 text-[14px] font-medium text-[#2A2822]">
                  Role
                </p>

                <div
                  role="radiogroup"
                  aria-label="Role"
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {INVITE_ROLES.map((role) => {
                    const selected = field.value === role;

                    return (
                      <button
                        key={role}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(role)}
                        className={cn(
                          "cursor-pointer rounded-[10px] bg-white p-4 text-left transition-colors",
                          selected
                            ? "border-2 border-[#141412]"
                            : "border border-[#DCD6CB] hover:border-[#B8B1A4]",
                        )}
                      >
                        <span className="block text-[15px] font-semibold text-[#141412]">
                          {INVITE_ROLE_LABEL[role]}
                        </span>
                        <span className="mt-1 block text-[13px] leading-snug text-[#6B665C]">
                          {INVITE_ROLE_HINT[role]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          />

          <Controller
            control={control}
            name="unitIds"
            render={({ field }) => (
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-[14px] font-medium text-[#2A2822]">Units</p>
                  <p className="text-[13px] text-[#8A857B]">
                    {picked.length} selected
                  </p>
                </div>

                <div className="max-h-[220px] overflow-y-auto rounded-[10px] border border-[#EDEAE2]">
                  {units.map((unit) => {
                    const selected = field.value.includes(unit.id);

                    return (
                      <button
                        key={unit.id}
                        type="button"
                        role="checkbox"
                        aria-checked={selected}
                        onClick={() =>
                          field.onChange(
                            selected
                              ? field.value.filter((id) => id !== unit.id)
                              : [...field.value, unit.id],
                          )
                        }
                        className={cn(
                          "flex w-full cursor-pointer items-center gap-3 border-b border-[#F4F2EC] px-4 py-3 text-left transition-colors last:border-b-0",
                          selected ? "bg-[#FBFAF7]" : "bg-white",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "h-[18px] w-[18px] shrink-0 rounded-[5px] border",
                            selected
                              ? "border-[#141412] bg-[#141412]"
                              : "border-[#D5D0C5] bg-white",
                          )}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-[14px] font-medium text-[#2A2822]">
                            {unit.unitName}
                          </span>
                          <span className="block truncate text-[12px] text-[#A29C90]">
                            {unit.property.propertyName}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {errors.unitIds && (
                  <p className="mt-2 text-[13px] text-[#B4432B]">
                    {errors.unitIds.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </form>
    </Modal>
  );
};

export default InviteModal;
