import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import ImagePicker from "../../../components/ui/ImagePicker";
import Modal from "../../../components/ui/Modal";
import PillGroup, { type PillOption } from "../../../components/ui/PillGroup";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import {
  PropertyFormSchema,
  type PropertyFormValues,
} from "../properties.schema";
import { toPropertyPayload } from "../properties.utils";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  type PropertyDetail,
  type PropertySummary,
  type PropertyType,
} from "../properties.types";
import {
  useCreateProperty,
  useSetPropertyImage,
  useUpdateProperty,
} from "../hooks/useProperties";

const TYPE_OPTIONS: PillOption<PropertyType>[] = PROPERTY_TYPES.map((type) => ({
  value: type,
  label: PROPERTY_TYPE_LABEL[type],
}));

const EMPTY: PropertyFormValues = {
  propertyName: "",
  propertyAddress: "",
  propertyCity: "",
  propertyType: "APARTMENT",
  propertyTypeOther: "",
};

interface PropertyFormModalProps {
  onClose: () => void;
  /** Absent means create. */
  property?: PropertySummary | PropertyDetail;
  onCreated?: (property: PropertyDetail) => void;
}

/**
 * One modal for both create and edit.
 *
 * The image lives on its own endpoint, so creating with a picture is two
 * calls — create, then upload against the new id. Edit doesn't touch the
 * image at all; the detail screen owns that.
 */
const PropertyFormModal = ({
  onClose,
  property,
  onCreated,
}: PropertyFormModalProps) => {
  const isEdit = Boolean(property);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty(property?.id ?? "");
  const setImage = useSetPropertyImage();

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PropertyFormValues>({
    resolver: zodResolver(PropertyFormSchema),
    mode: "onTouched",
    // Only read at mount, which is exactly right: the modal is mounted on open,
    // so a cancelled edit can't leak into the next one.
    defaultValues: property
      ? {
          propertyName: property.propertyName,
          propertyAddress: property.propertyAddress,
          propertyCity: property.propertyCity,
          propertyType: property.propertyType,
          propertyTypeOther: property.propertyTypeOther ?? "",
        }
      : EMPTY,
  });

  const isPending =
    createProperty.isPending || updateProperty.isPending || setImage.isPending;

  const onSubmit = async (values: PropertyFormValues) => {
    const payload = toPropertyPayload(values);

    try {
      if (property) {
        await updateProperty.mutateAsync(payload);
        toast.success("Property updated");
      } else {
        const created = await createProperty.mutateAsync(payload);

        // The property exists either way; a failed image upload must not read
        // as a failed create, so it's reported separately.
        if (imageFile) {
          try {
            await setImage.mutateAsync({ id: created.id, file: imageFile });
          } catch (error) {
            toast.error(
              getApiErrorMessage(
                error,
                "Property created, but the image didn't upload. Try again from the property page.",
              ),
            );
          }
        }

        toast.success(`${created.propertyName} added`);
        onCreated?.(created);
      }

      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          isEdit
            ? "We couldn't save your changes."
            : "We couldn't create this property.",
        ),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!isPending}
      title={isEdit ? "Edit details" : "Add a property"}
      description={
        isEdit
          ? "The building itself. Units are managed separately."
          : "A property is the building. Units go inside it afterwards."
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="property-form"
            disabled={isPending}
            className="px-8"
          >
            {isPending ? "Saving…" : isEdit ? "Save changes" : "Save property"}
          </Button>
        </div>
      }
    >
      <form id="property-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <TextField
            label="Property name"
            placeholder="Lekki Court"
            error={errors.propertyName?.message}
            {...register("propertyName")}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Address"
              placeholder="12 Admiralty Way"
              error={errors.propertyAddress?.message}
              {...register("propertyAddress")}
            />
            <TextField
              label="City"
              placeholder="Lagos"
              error={errors.propertyCity?.message}
              {...register("propertyCity")}
            />
          </div>

          <Controller
            control={control}
            name="propertyType"
            render={({ field }) => (
              <PillGroup
                label="Type"
                options={TYPE_OPTIONS}
                value={field.value}
                onChange={field.onChange}
                error={errors.propertyType?.message}
              />
            )}
          />

          {watch("propertyType") === "OTHER" && (
            <TextField
              label="Describe the type"
              placeholder="Serviced villa"
              error={errors.propertyTypeOther?.message}
              {...register("propertyTypeOther")}
            />
          )}

          {!isEdit && (
            <div className="border-t border-[#EDEAE2] pt-5">
              <ImagePicker
                value={imageFile}
                onChange={setImageFile}
                disabled={isPending}
              />
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default PropertyFormModal;
