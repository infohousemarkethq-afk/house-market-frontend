import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import PillGroup, { type PillOption } from "../../../components/ui/PillGroup";
import Select from "../../../components/ui/Select";
import Stepper from "../../../components/ui/Stepper";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { useProperties } from "../../properties/hooks/useProperties";
import { DEFAULT_PROPERTY_FILTERS } from "../../properties/properties.types";
import AmenityPicker from "./AmenityPicker";
import { UnitFormSchema, type UnitFormValues } from "../units.schema";
import { toUnitPayload } from "../units.utils";
import {
  UNIT_TYPE_LABEL,
  UNIT_TYPE_OPTIONS,
  type UnitDetail,
  type UnitType,
} from "../units.types";
import { useCreateUnit, useUpdateUnit } from "../hooks/useUnits";

const TYPE_OPTIONS: PillOption<UnitType>[] = UNIT_TYPE_OPTIONS.map((type) => ({
  value: type,
  label: UNIT_TYPE_LABEL[type],
}));

interface UnitFormModalProps {
  onClose: () => void;
  /** Absent means create. */
  unit?: UnitDetail;
  /** Preselects and locks the property when adding from a property page. */
  propertyId?: string;
}

/**
 * One modal for both create and edit. Price is deliberately absent — it has
 * its own endpoint and its own dialog, so "edit the unit" and "change what we
 * charge" stay separate decisions.
 */
const UnitFormModal = ({ onClose, unit, propertyId }: UnitFormModalProps) => {
  const isEdit = Boolean(unit);

  const createUnit = useCreateUnit();
  const updateUnit = useUpdateUnit(unit?.id ?? "");

  // Enough to fill the picker without paging; the archived ones are excluded
  // because you can't add a unit to a building that's been taken out of use.
  const { data: propertiesPage } = useProperties({
    ...DEFAULT_PROPERTY_FILTERS,
    page: 1,
  });
  const properties = propertiesPage?.items ?? [];

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<UnitFormValues>({
    resolver: zodResolver(UnitFormSchema),
    mode: "onTouched",
    // Read once at mount, which is right: the modal is mounted on open, so a
    // cancelled edit can't leak into the next one.
    defaultValues: unit
      ? {
          propertyId: unit.property.id,
          unitName: unit.unitName,
          unitType: unit.unitType,
          unitTypeOther: unit.unitTypeOther ?? "",
          bedrooms: unit.bedrooms ?? 0,
          bathrooms: unit.bathrooms ?? 0,
          toilets: unit.toilets ?? 0,
          parlors: unit.parlors ?? 0,
          maxGuests: unit.maxGuests ?? 1,
          amenities: unit.amenities,
          description: unit.description ?? "",
        }
      : {
          propertyId: propertyId ?? "",
          unitName: "",
          unitType: "FLAT",
          unitTypeOther: "",
          bedrooms: 1,
          bathrooms: 1,
          toilets: 1,
          parlors: 1,
          maxGuests: 2,
          amenities: [],
          description: "",
        },
  });

  const isPending = createUnit.isPending || updateUnit.isPending;
  const selectedProperty = properties.find((p) => p.id === watch("propertyId"));

  const onSubmit = async (values: UnitFormValues) => {
    const payload = toUnitPayload(values);

    try {
      if (unit) {
        await updateUnit.mutateAsync(payload);
        toast.success("Unit updated");
      } else {
        const created = await createUnit.mutateAsync(payload);
        toast.success(`${created.unitName} added`);
      }
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEdit
            ? "We couldn't save your changes."
            : "We couldn't create this unit.",
        ),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      size="lg"
      dismissable={!isPending}
      title={isEdit ? "Edit unit" : "Add a unit"}
      description={
        isEdit
          ? "Everything except the nightly rate, which has its own control."
          : selectedProperty
            ? `Adding to ${selectedProperty.propertyName}. Price and images come after it exists.`
            : "Price and images come after the unit exists."
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="unit-form"
            disabled={isPending}
            className="px-8"
          >
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Save unit"}
          </Button>
        </div>
      }
    >
      <form id="unit-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-6">
          {!isEdit && (
            <Controller
              control={control}
              name="propertyId"
              render={({ field }) => (
                <Select
                  label="Property"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={Boolean(propertyId)}
                  error={errors.propertyId?.message}
                  className="rounded-[10px]"
                >
                  <option value="">Choose a property</option>
                  {properties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.propertyName} · {property.propertyCity}
                    </option>
                  ))}
                </Select>
              )}
            />
          )}

          <TextField
            label="Unit name"
            placeholder="Flat 16"
            error={errors.unitName?.message}
            {...register("unitName")}
          />

          <Controller
            control={control}
            name="unitType"
            render={({ field }) => (
              <PillGroup
                label="Type"
                options={TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.unitType?.message}
              />
            )}
          />

          {watch("unitType") === "OTHER" && (
            <TextField
              label="Describe the type"
              placeholder="Serviced apartment"
              error={errors.unitTypeOther?.message}
              {...register("unitTypeOther")}
            />
          )}

          <div className="border-t border-[#EDEAE2] pt-6">
            <p className="mb-3 text-[14px] font-medium text-[#2A2822]">
              Rooms and capacity
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              <Controller
                control={control}
                name="bedrooms"
                render={({ field }) => (
                  <Stepper
                    label="Bedrooms"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="bathrooms"
                render={({ field }) => (
                  <Stepper
                    label="Bathrooms"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="toilets"
                render={({ field }) => (
                  <Stepper
                    label="Toilets"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="parlors"
                render={({ field }) => (
                  <Stepper
                    label="Parlours"
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <Controller
                control={control}
                name="maxGuests"
                render={({ field }) => (
                  <Stepper
                    label="Max guests"
                    value={field.value}
                    onChange={field.onChange}
                    min={1}
                    max={100}
                  />
                )}
              />
            </div>
          </div>

          <div className="border-t border-[#EDEAE2] pt-6">
            <Controller
              control={control}
              name="amenities"
              render={({ field }) => (
                <AmenityPicker value={field.value} onChange={field.onChange} />
              )}
            />
          </div>

          <div>
            <label
              htmlFor="unit-description"
              className="mb-2 block text-[14px] font-medium text-[#2A2822]"
            >
              Description
            </label>
            <textarea
              id="unit-description"
              rows={3}
              placeholder="Two-bedroom flat on the third floor, generator-backed."
              className="w-full rounded-[10px] border border-[#DCD6CB] bg-white px-4 py-3 text-[15px] text-[#141412] transition-colors placeholder:text-[#A8A296] focus:border-[#141412] focus:outline-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="mt-2 text-[13px] text-[#B4432B]">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UnitFormModal;
