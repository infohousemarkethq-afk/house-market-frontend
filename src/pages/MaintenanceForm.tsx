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
import PillGroup, { type PillOption } from "../components/ui/PillGroup";
import { Skeleton } from "../components/ui/SkeletonLoader";
import TextField from "../components/ui/TextField";
import { getApiErrorMessage } from "../utils/apiError.util";
import { toKobo, toKoboLabel } from "../utils/formatNaira.util";
import {
  useCreateMaintenance,
  useUploadMaintenancePhotos,
} from "../features/maintenance/hooks/useMaintenance";
import {
  MaintenanceFormSchema,
  type MaintenanceFormValues,
} from "../features/maintenance/maintenance.schema";
import {
  MAINTENANCE_CATEGORIES,
  MAINTENANCE_CATEGORY_LABEL,
  MAINTENANCE_PHOTOS_PER_REQUEST,
  MAINTENANCE_STATUSES,
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_TYPES,
  MAINTENANCE_TYPE_LABEL,
  type MaintenanceCategory,
  type MaintenanceStatus,
  type MaintenanceType,
} from "../features/maintenance/maintenance.types";
import { useUnit } from "../features/units/hooks/useUnits";

const TYPE_OPTIONS: PillOption<MaintenanceType>[] = MAINTENANCE_TYPES.map(
  (type) => ({ value: type, label: MAINTENANCE_TYPE_LABEL[type] }),
);

const CATEGORY_OPTIONS: PillOption<MaintenanceCategory>[] =
  MAINTENANCE_CATEGORIES.map((category) => ({
    value: category,
    label: MAINTENANCE_CATEGORY_LABEL[category],
  }));

const STATUS_OPTIONS: PillOption<MaintenanceStatus>[] = MAINTENANCE_STATUSES.map(
  (status) => ({ value: status, label: MAINTENANCE_STATUS_LABEL[status] }),
);

const MaintenanceForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [photos, setPhotos] = useState<File[]>([]);

  const { data: unit, isPending } = useUnit(id);
  const createMaintenance = useCreateMaintenance();
  const uploadPhotos = useUploadMaintenancePhotos();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<MaintenanceFormValues>({
    resolver: zodResolver(MaintenanceFormSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      type: "REACTIVE",
      category: "REPAIR",
      status: "PENDING",
      description: "",
      cost: "",
      performedAt: "",
    },
  });

  const busy = createMaintenance.isPending || uploadPhotos.isPending;
  const backTo = `/units/${id}`;

  const onSubmit = async (values: MaintenanceFormValues) => {
    if (!id) return;

    try {
      const record = await createMaintenance.mutateAsync({
        unitId: id,
        title: values.title,
        type: values.type,
        category: values.category,
        status: values.status,
        description: values.description,
        ...(values.cost && { cost: toKobo(values.cost) }),
        ...(values.performedAt && { performedAt: values.performedAt }),
      });

      // The record exists either way, so a failed photo upload must not read
      // as a failed save.
      if (photos.length > 0) {
        try {
          await uploadPhotos.mutateAsync({ id: record.id, files: photos });
        } catch (photoError) {
          toast.error(
            getApiErrorMessage(
              photoError,
              "Work saved, but the photos didn't upload.",
            ),
          );
        }
      }

      toast.success("Maintenance record saved");
      navigate(backTo);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't save this record."));
    }
  };

  return (
    <div className="mx-auto max-w-[820px]">
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
        {isPending ? "Unit" : (unit?.unitName ?? "Unit")}
      </Link>

      <div className="mt-6 mb-8">
        <h1 className="font-serif text-[42px] leading-tight text-[#141412]">
          Log maintenance
        </h1>
        {isPending ? (
          <Skeleton className="mt-2 h-[16px] w-[240px]" />
        ) : (
          unit && (
            <p className="mt-1 text-[15px] text-[#6B665C]">
              {unit.unitName} · {unit.property.propertyName}
            </p>
          )
        )}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="rounded-[16px] border border-[#E7E3DA] bg-white p-7"
      >
        <div className="space-y-6">
          <TextField
            label="What was done"
            placeholder="Generator service"
            error={errors.title?.message}
            {...register("title")}
          />

          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <div>
                <PillGroup
                  label="Type"
                  options={TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.type?.message}
                />
                <p className="mt-2 text-[13px] text-[#8A857B]">
                  Scheduled work was planned. Reactive work answers something
                  that broke.
                </p>
              </div>
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <PillGroup
                label="Category"
                options={CATEGORY_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.category?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <PillGroup
                label="Status"
                options={STATUS_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.status?.message}
              />
            )}
          />

          <div className="grid gap-4 border-t border-[#F0EEE8] pt-6 sm:grid-cols-2">
            <div>
              <TextField
                label="Cost"
                inputMode="decimal"
                placeholder="18000"
                error={errors.cost?.message}
                {...register("cost")}
              />
              {/* Naira in, kobo stored — showing the conversion is how the
                  user can tell nothing was lost. */}
              <p className="font-label mt-2 text-[12px] text-[#8A857B]">
                stored as {toKoboLabel(watch("cost") || 0)} kobo
              </p>
            </div>

            <TextField
              label="Date performed"
              type="date"
              hint="Optional"
              error={errors.performedAt?.message}
              {...register("performedAt")}
            />
          </div>

          <div>
            <label
              htmlFor="maintenance-notes"
              className="mb-2 block text-[14px] font-medium text-[#2A2822]"
            >
              Notes
            </label>
            <textarea
              id="maintenance-notes"
              rows={3}
              placeholder="Filter replaced, oil topped up. Next service due in six months."
              className="w-full resize-y rounded-[10px] border border-[#DCD6CB] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#141412] transition-colors placeholder:text-[#A8A296] focus:border-[#141412] focus:outline-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-2 text-[13px] text-[#B4432B]">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <p className="mb-2 text-[14px] font-medium text-[#2A2822]">Photos</p>
            <PhotosPicker
              value={photos}
              onChange={setPhotos}
              max={MAINTENANCE_PHOTOS_PER_REQUEST}
              disabled={busy}
            />
          </div>

          <Callout tone="muted">
            Owners see the work and its status, but not what it cost. Costs
            appear only to company staff.
          </Callout>

          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => navigate(backTo)}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy} className="px-8">
              {busy ? "Saving…" : "Save record"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MaintenanceForm;
