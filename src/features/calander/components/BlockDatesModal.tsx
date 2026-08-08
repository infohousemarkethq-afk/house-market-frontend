import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { UnitSummary } from "../../units/units.types";
import { BlockFormSchema, type BlockFormValues } from "../calander.schema";
import { toApiDate, type MonthWindow } from "../calander.utils";
import { useCreateBlock } from "../hooks/useBookings";

interface BlockDatesModalProps {
  onClose: () => void;
  window: MonthWindow;
  units: UnitSummary[];
  unitId?: string;
}

const BlockDatesModal = ({
  onClose,
  window,
  units,
  unitId,
}: BlockDatesModalProps) => {
  const createBlock = useCreateBlock();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BlockFormValues>({
    resolver: zodResolver(BlockFormSchema),
    mode: "onTouched",
    defaultValues: {
      unitId: unitId ?? units[0]?.id ?? "",
      startDate: toApiDate(window.start),
      endDate: "",
      reason: "",
    },
  });

  const onSubmit = async (values: BlockFormValues) => {
    try {
      await createBlock.mutateAsync({
        unitId: values.unitId,
        startDate: values.startDate,
        endDate: values.endDate,
        ...(values.reason && { reason: values.reason }),
      });

      toast.success("Those dates are now held");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't block those dates."));
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!createBlock.isPending}
      title="Block dates"
      description="Makes a unit unavailable with no guest attached."
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={createBlock.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="block-form"
            disabled={createBlock.isPending}
          >
            {createBlock.isPending ? "Holding…" : "Block dates"}
          </Button>
        </div>
      }
    >
      <form id="block-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <Select label="Unit" error={errors.unitId?.message} {...register("unitId")}>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unitName} — {unit.property.propertyName}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="From"
              type="date"
              error={errors.startDate?.message}
              {...register("startDate")}
            />
            <TextField
              label="To"
              type="date"
              hint="The unit is free again on this day"
              error={errors.endDate?.message}
              {...register("endDate")}
            />
          </div>

          <TextField
            label="Reason"
            placeholder="Kitchen renovation"
            hint="Optional. Shown on the calendar bar."
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>
      </form>
    </Modal>
  );
};

export default BlockDatesModal;
