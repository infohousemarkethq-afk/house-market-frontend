import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { toKobo, toKoboLabel } from "../../../utils/formatNaira.util";
import type { UnitSummary } from "../../units/units.types";
import {
  PAYMENT_DIRECTION_LABEL,
  PAYMENT_DIRECTIONS,
  PAYMENT_TYPE_LABEL,
  PAYMENT_TYPES,
} from "../payment.types";
import { directionFor, todayIso } from "../payments.utils";
import {
  RecordPaymentSchema,
  type RecordPaymentValues,
} from "../payments.schema";
import { useCreatePayment } from "../hooks/usePayment";

interface RecordPaymentModalProps {
  onClose: () => void;
  units: UnitSummary[];
  /** Preselected when opened from a unit's screen. */
  unitId?: string;
}

const RecordPaymentModal = ({
  onClose,
  units,
  unitId,
}: RecordPaymentModalProps) => {
  const createPayment = useCreatePayment();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RecordPaymentValues>({
    resolver: zodResolver(RecordPaymentSchema),
    mode: "onTouched",
    defaultValues: {
      unitId: unitId ?? units[0]?.id ?? "",
      type: "BOOKING_PAYMENT",
      direction: "INFLOW",
      description: "",
      reference: "",
      paidAt: todayIso(),
    },
  });

  const type = watch("type");
  const amount = watch("amount");
  const fixedDirection = directionFor(type);

  /**
   * The API insists a booking payment is money in and a payout is money out.
   * Rather than let someone choose a pair that will be rejected, the type
   * drives the direction and the field goes read-only. OTHER is the only type
   * where the choice is genuinely theirs.
   */
  useEffect(() => {
    if (fixedDirection) setValue("direction", fixedDirection);
  }, [fixedDirection, setValue]);

  const onSubmit = async (values: RecordPaymentValues) => {
    try {
      await createPayment.mutateAsync({
        unitId: values.unitId,
        // Typed in naira, stored in kobo — the conversion happens once, here.
        amount: toKobo(values.amount),
        type: values.type,
        direction: values.direction,
        description: values.description,
        ...(values.reference ? { reference: values.reference } : {}),
        paidAt: new Date(values.paidAt).toISOString(),
      });

      toast.success("Payment recorded");
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't record this payment."),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!createPayment.isPending}
      title="Record a payment"
      description="History only — House Market doesn't move money."
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createPayment.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="payment-form"
            disabled={createPayment.isPending}
          >
            {createPayment.isPending ? "Saving…" : "Save payment"}
          </Button>
        </div>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Select
            label="Unit"
            error={errors.unitId?.message}
            {...register("unitId")}
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unitName} — {unit.property.propertyName}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Type"
              error={errors.type?.message}
              {...register("type")}
            >
              {PAYMENT_TYPES.map((option) => (
                <option key={option} value={option}>
                  {PAYMENT_TYPE_LABEL[option]}
                </option>
              ))}
            </Select>

            <Select
              label="Direction"
              error={errors.direction?.message}
              disabled={Boolean(fixedDirection)}
              {...register("direction")}
            >
              {PAYMENT_DIRECTIONS.map((option) => (
                <option key={option} value={option}>
                  {PAYMENT_DIRECTION_LABEL[option]}
                </option>
              ))}
            </Select>
          </div>

          {fixedDirection && (
            <p className="-mt-2 text-[13px] text-[#8A857B]">
              A {PAYMENT_TYPE_LABEL[type].toLowerCase()} is always{" "}
              {PAYMENT_DIRECTION_LABEL[fixedDirection].toLowerCase()}.
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Amount (₦)"
              inputMode="decimal"
              placeholder="45000"
              hint={amount ? `Stored as ${toKoboLabel(amount)} kobo` : undefined}
              error={errors.amount?.message}
              {...register("amount")}
            />

            <TextField
              label="Date paid"
              type="date"
              max={todayIso()}
              error={errors.paidAt?.message}
              {...register("paidAt")}
            />
          </div>

          <TextField
            label="Description"
            placeholder="July payout"
            error={errors.description?.message}
            {...register("description")}
          />

          <TextField
            label="Reference"
            placeholder="TRF-1029"
            hint="Optional — the transfer or invoice number."
            error={errors.reference?.message}
            {...register("reference")}
          />
        </div>
      </form>
    </Modal>
  );
};

export default RecordPaymentModal;
