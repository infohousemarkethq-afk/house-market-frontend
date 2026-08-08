import { cn } from "../../../utils/cn.util";
import {
  BOOKING_STATUS_LABEL,
  type BookingStatus,
} from "../calander.types";

const TONES: Record<BookingStatus, string> = {
  CONFIRMED: "bg-[#E7EFE9] text-[#3F7D5A]",
  CHECKED_IN: "bg-[#141412] text-[#F5F3EF]",
  CHECKED_OUT: "bg-[#EDEAE2] text-[#8A857B]",
  CANCELLED: "bg-[#F6E7E2] text-[#A8543C]",
};

interface BookingStatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

const BookingStatusBadge = ({ status, className }: BookingStatusBadgeProps) => (
  <span
    className={cn(
      "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-medium whitespace-nowrap",
      TONES[status],
      className,
    )}
  >
    {BOOKING_STATUS_LABEL[status]}
  </span>
);

export default BookingStatusBadge;
