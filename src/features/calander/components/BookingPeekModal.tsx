import { useNavigate } from "react-router";

import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import Modal from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { formatNaira } from "../../../utils/formatNaira.util";
import { formatCalendarRangeLong } from "../../../utils/formatTime.util";
import { visibleAmount } from "../calander.utils";
import { useBooking } from "../hooks/useBookings";
import BookingStatusBadge from "./BookingStatusBadge";

interface BookingPeekModalProps {
  bookingId: string;
  onClose: () => void;
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[12px] text-[#8A857B]">{label}</p>
    <p className="mt-1 text-[15px] text-[#2A2822]">{value}</p>
  </div>
);

/** The quick look you get from clicking a bar on the grid. */
const BookingPeekModal = ({ bookingId, onClose }: BookingPeekModalProps) => {
  const navigate = useNavigate();
  const { data: booking, isPending, isError, error } = useBooking(bookingId);

  const amount = booking ? visibleAmount(booking) : null;

  return (
    <Modal
      onClose={onClose}
      title={booking?.guestName ?? "Booking"}
      description={
        booking
          ? `${booking.unit.unitName} · ${booking.unit.propertyName}`
          : undefined
      }
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button
            disabled={!booking}
            onClick={() => navigate(`/bookings/${bookingId}`)}
          >
            Open booking
          </Button>
        </div>
      }
    >
      {isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-[18px] w-1/2" />
          <Skeleton className="h-[14px] w-3/4" />
          <Skeleton className="h-[14px] w-2/3" />
        </div>
      ) : isError ? (
        <Callout tone="warning" title="We couldn't load this booking">
          {getApiErrorMessage(error)}
        </Callout>
      ) : (
        <div className="space-y-5">
          <BookingStatusBadge status={booking.status} />

          <div className="grid gap-4 border-t border-[#EDEAE2] pt-5 sm:grid-cols-2">
            <Detail
              label="Dates"
              value={formatCalendarRangeLong(booking.startDate, booking.endDate)}
            />
            <Detail
              label="Length"
              value={`${booking.nights} ${booking.nights === 1 ? "night" : "nights"}`}
            />
            <Detail
              label="Party"
              value={
                booking.numberOfGuests
                  ? `${booking.numberOfGuests} guests`
                  : "Not recorded"
              }
            />
            <Detail label="Phone" value={booking.guestPhone ?? "Not recorded"} />
            {amount && (
              <Detail label={amount.label} value={formatNaira(amount.kobo)} />
            )}
            <Detail label="Booked by" value={booking.createdBy.fullName} />
          </div>

          <div className="border-t border-[#EDEAE2] pt-5">
            <p className="text-[12px] text-[#8A857B]">Notes</p>
            <p className="mt-1 text-[14px] leading-relaxed text-[#4A463E]">
              {booking.notes ?? "No notes on this booking."}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default BookingPeekModal;
