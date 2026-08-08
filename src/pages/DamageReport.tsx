import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useParams } from "react-router";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import PhotosPicker from "../components/ui/PhotosPicker";
import Select from "../components/ui/Select";
import TextField from "../components/ui/TextField";
import { cn } from "../utils/cn.util";
import { getApiErrorMessage } from "../utils/apiError.util";
import { toKobo } from "../utils/formatNaira.util";
import { formatCalendarRange } from "../utils/formatTime.util";
import { useBookings } from "../features/calander/hooks/useBookings";
import { DEFAULT_BOOKING_FILTERS } from "../features/calander/calander.types";
import {
  useCreateDamage,
  useUploadDamagePhotos,
} from "../features/maintenance/hooks/useDamage";
import {
  DamageFormSchema,
  type DamageFormValues,
} from "../features/maintenance/maintenance.schema";
import {
  DAMAGE_PHOTOS_PER_REQUEST,
  DAMAGE_SEVERITIES,
  DAMAGE_SEVERITY_HINT,
  DAMAGE_SEVERITY_LABEL,
} from "../features/maintenance/maintenance.types";
import { useUnit } from "../features/units/hooks/useUnits";

const STEP_FIELDS = {
  2: ["bookingId", "severity", "location"],
  3: ["description", "estimatedCost"],
} as const;

const DamageReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photos, setPhotos] = useState<File[]>([]);

  const { data: unit } = useUnit(id);
  const { data: bookingData } = useBookings({
    ...DEFAULT_BOOKING_FILTERS,
    unitId: id ?? "",
  });

  const createDamage = useCreateDamage();
  const uploadPhotos = useUploadDamagePhotos();

  const stays = bookingData?.items ?? [];
  const busy = createDamage.isPending || uploadPhotos.isPending;
  const backTo = `/units/${id}`;

  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors },
  } = useForm<DamageFormValues>({
    resolver: zodResolver(DamageFormSchema),
    mode: "onTouched",
    defaultValues: {
      bookingId: "",
      severity: "MODERATE",
      location: "",
      description: "",
      estimatedCost: "",
    },
  });

  const onNext = async () => {
    if (step === 1) {
      setStep(2);
      return;
    }

    const valid = await trigger(STEP_FIELDS[2]);
    if (valid) setStep(3);
  };

  const onSubmit = async (values: DamageFormValues) => {
    try {
      // No column for "where in the unit", so it leads the description —
      // which is what the free-text field is for.
      const description = values.location
        ? `${values.location} — ${values.description}`
        : values.description;

      const damage = await createDamage.mutateAsync({
        bookingId: values.bookingId,
        severity: values.severity,
        description,
        ...(values.estimatedCost && {
          estimatedCost: toKobo(values.estimatedCost),
        }),
      });

      // The report exists either way, so a failed upload isn't a failed report.
      if (photos.length > 0) {
        try {
          await uploadPhotos.mutateAsync({ id: damage.id, files: photos });
        } catch (photoError) {
          toast.error(
            getApiErrorMessage(
              photoError,
              "Report filed, but the photos didn't upload.",
            ),
          );
        }
      }

      toast.success("Damage reported");
      navigate(backTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't file this report."));
    }
  };

  return (
    <div className="mx-auto max-w-[640px]">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-[14px] text-[#6B665C] transition-colors hover:text-[#141412]"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={16}
          color="currentColor"
          strokeWidth={1.8}
        />
        {unit?.unitName ?? "Unit"}
      </Link>

      <div className="mt-6 flex gap-2">
        {[1, 2, 3].map((bar) => (
          <div
            key={bar}
            className={cn(
              "h-[3px] flex-1 rounded-[2px]",
              bar <= step ? "bg-[#141412]" : "bg-[#E2DED5]",
            )}
          />
        ))}
      </div>

      <div className="mt-5 mb-6">
        <p className="font-label text-[12px] tracking-[0.06em] text-[#8A857B]">
          STEP {step} OF 3
        </p>
        <h1 className="mt-1 font-serif text-[36px] leading-tight text-[#141412]">
          Report damage
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-[16px] border border-[#E7E3DA] bg-white p-7"
      >
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-[17px] font-semibold text-[#141412]">
              Show us the damage
            </h2>

            <p className="text-[13px] leading-relaxed text-[#8A857B]">
              Photos come first because damage is reported from the room, phone
              in hand.
            </p>

            <PhotosPicker
              value={photos}
              onChange={setPhotos}
              max={DAMAGE_PHOTOS_PER_REQUEST}
              disabled={busy}
            />

            <Button onClick={onNext} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-[17px] font-semibold text-[#141412]">
              How bad is it?
            </h2>

            <Controller
              control={control}
              name="severity"
              render={({ field }) => (
                <div role="radiogroup" aria-label="Severity" className="space-y-2.5">
                  {DAMAGE_SEVERITIES.map((severity) => {
                    const selected = field.value === severity;

                    return (
                      <button
                        key={severity}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(severity)}
                        className={cn(
                          "w-full cursor-pointer rounded-[12px] bg-white p-4 text-left transition-colors",
                          selected
                            ? "border-2 border-[#141412]"
                            : "border border-[#E7E3DA] hover:border-[#B8B1A4]",
                        )}
                      >
                        <span className="block text-[15px] font-semibold text-[#141412]">
                          {DAMAGE_SEVERITY_LABEL[severity]}
                        </span>
                        <span className="mt-0.5 block text-[13px] text-[#6B665C]">
                          {DAMAGE_SEVERITY_HINT[severity]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            />

            {/* Required by the API: damage belongs to a stay, and the unit is
                read off the booking. */}
            <Select
              label="Which stay"
              error={errors.bookingId?.message}
              {...register("bookingId")}
            >
              <option value="">Choose the stay</option>
              {stays.map((stay) => (
                <option key={stay.id} value={stay.id}>
                  {stay.guestName} ·{" "}
                  {formatCalendarRange(stay.startDate, stay.endDate)}
                </option>
              ))}
            </Select>

            {stays.length === 0 && (
              <Callout tone="warning">
                This unit has no bookings yet. Guest damage is always attached
                to a stay, so there's nothing to file it against.
              </Callout>
            )}

            <TextField
              label="Where in the unit"
              placeholder="Guest bathroom"
              hint="Optional. Kept at the top of the description."
              error={errors.location?.message}
              {...register("location")}
            />

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={onNext} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-[17px] font-semibold text-[#141412]">
              Anything else we should know?
            </h2>

            <div>
              <label
                htmlFor="damage-description"
                className="mb-2 block text-[14px] font-medium text-[#2A2822]"
              >
                Description
              </label>
              <textarea
                id="damage-description"
                rows={4}
                placeholder="The shower screen cracked when it was closed. It still works but there is a sharp edge."
                className="w-full resize-y rounded-[10px] border border-[#DCD6CB] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#141412] transition-colors placeholder:text-[#A8A296] focus:border-[#141412] focus:outline-none"
                {...register("description")}
              />
              {errors.description && (
                <p className="mt-2 text-[13px] text-[#B4432B]">
                  {errors.description.message}
                </p>
              )}
            </div>

            <TextField
              label="Estimated cost"
              inputMode="decimal"
              placeholder="45000"
              hint="Optional. Unlike maintenance costs, owners do see this."
              error={errors.estimatedCost?.message}
              {...register("estimatedCost")}
            />

            <Callout tone="muted">
              The owner is not notified. A report becomes a maintenance record,
              or a charge, once someone decides which.
            </Callout>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setStep(2)}
                disabled={busy}
              >
                Back
              </Button>
              <Button type="submit" disabled={busy} className="flex-1">
                {busy ? "Filing…" : "Submit report"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default DamageReport;
