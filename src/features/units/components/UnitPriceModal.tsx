import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { toKobo, toKoboLabel } from "../../../utils/formatNaira.util";
import { UnitPriceSchema, type UnitPriceValues } from "../units.schema";
import { useUpdateUnitPrice } from "../hooks/useUnits";

interface UnitPriceModalProps {
  onClose: () => void;
  unitId: string;
  unitName: string;
  /** Kobo, as the API stores them. */
  pricePerNight?: number | null;
  ownerRatePerNight?: number | null;
}

/** Naira in the field, kobo on the wire — the hint shows the conversion. */
const nairaFromKobo = (kobo?: number | null) =>
  kobo == null ? "" : String(kobo / 100);

const UnitPriceModal = ({
  onClose,
  unitId,
  unitName,
  pricePerNight,
  ownerRatePerNight,
}: UnitPriceModalProps) => {
  const updatePrice = useUpdateUnitPrice();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<UnitPriceValues>({
    resolver: zodResolver(UnitPriceSchema),
    mode: "onTouched",
    defaultValues: {
      pricePerNight: nairaFromKobo(pricePerNight),
      ownerRatePerNight: nairaFromKobo(ownerRatePerNight),
    },
  });

  const onSubmit = (values: UnitPriceValues) => {
    const owner = values.ownerRatePerNight.trim();

    updatePrice.mutate(
      {
        id: unitId,
        pricePerNight: toKobo(values.pricePerNight),
        ...(owner
          ? { ownerRatePerNight: toKobo(owner) }
          : ownerRatePerNight != null
            ? { ownerRatePerNight: null }
            : {}),
      },
      {
        onSuccess: () => {
          toast.success(`Rate updated for ${unitName}`);
          onClose();
        },
        onError: (error) =>
          toast.error(getApiErrorMessage(error, "We couldn't save the rate.")),
      },
    );
  };

  return (
    <Modal
      onClose={onClose}
      size="sm"
      dismissable={!updatePrice.isPending}
      title="Change price"
      description={`What ${unitName} costs per night.`}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={updatePrice.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="unit-price-form"
            disabled={updatePrice.isPending}
            className="px-8"
          >
            {updatePrice.isPending ? "Saving…" : "Save price"}
          </Button>
        </div>
      }
    >
      <form id="unit-price-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div>
            <TextField
              label="Guest rate per night"
              inputMode="numeric"
              placeholder="120000"
              error={errors.pricePerNight?.message}
              {...register("pricePerNight")}
            />
            {/* The field takes naira; the API stores kobo. Showing the
                conversion is how the user can tell nothing was lost. */}
            <p className="font-label mt-2 text-[12px] text-[#8A857B]">
              stored as {toKoboLabel(watch("pricePerNight") || 0)} kobo
            </p>
          </div>

          <div>
            <TextField
              label="Owner rate per night"
              inputMode="numeric"
              placeholder="Optional"
              hint="What the owner is paid. Owners see this rate, never the guest one."
              error={errors.ownerRatePerNight?.message}
              {...register("ownerRatePerNight")}
            />
            {watch("ownerRatePerNight") && (
              <p className="font-label mt-2 text-[12px] text-[#8A857B]">
                stored as {toKoboLabel(watch("ownerRatePerNight"))} kobo
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UnitPriceModal;
