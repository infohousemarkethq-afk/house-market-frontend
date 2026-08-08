import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { formatCalendarRangeLong } from "../../../utils/formatTime.util";
import {
  CancelBookingSchema,
  type CancelBookingValues,
} from "../calander.schema";
import type { BookingDetail } from "../calander.types";
import { useCancelBooking } from "../hooks/useBookings";

interface CancelBookingModalProps {
  booking: BookingDetail;
  onClose: () => void;
}

const CancelBookingModal = ({ booking, onClose }: CancelBookingModalProps) => {
  const cancelBooking = useCancelBooking();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CancelBookingValues>({
    resolver: zodResolver(CancelBookingSchema),
    mode: "onTouched",
    defaultValues: { reason: "" },
  });

  const onSubmit = async (values: CancelBookingValues) => {
    try {
      await cancelBooking.mutateAsync({
        id: booking.id,
        ...(values.reason && { reason: values.reason }),
      });

      toast.success("Booking cancelled — those dates are free again");
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't cancel this booking."),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!cancelBooking.isPending}
      size="sm"
      title={`Cancel ${booking.guestName}'s stay?`}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={cancelBooking.isPending}
          >
            Keep booking
          </Button>
          <Button
            type="submit"
            form="cancel-booking-form"
            disabled={cancelBooking.isPending}
            className="bg-[#A8543C] hover:bg-[#8F4632]"
          >
            {cancelBooking.isPending ? "Cancelling…" : "Cancel booking"}
          </Button>
        </div>
      }
    >
      <form
        id="cancel-booking-form"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <p className="text-[15px] leading-relaxed text-[#4A463E]">
          {formatCalendarRangeLong(booking.startDate, booking.endDate)} on{" "}
          {booking.unit.unitName} · {booking.unit.propertyName}. The dates go
          back on the calendar straight away and the guest is not notified by
          House Market.
        </p>

        <div className="mt-5">
          <TextField
            label="Reason"
            placeholder="Guest cancelled by phone"
            hint="Optional. Kept on the booking record, not shown to the owner."
            error={errors.reason?.message}
            {...register("reason")}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CancelBookingModal;
