import { useNavigate } from "react-router";

import { formatCalendarRange } from "../../../utils/formatTime.util";
import type { BookingSummary } from "../calander.types";
import BookingStatusBadge from "./BookingStatusBadge";

const COLUMNS =
  "grid grid-cols-[1.6fr_1.6fr_1.4fr_1fr_1fr_90px] gap-4 px-6";

interface StaysTableProps {
  bookings: BookingSummary[];
}

const StaysTable = ({ bookings }: StaysTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-[16px] border border-[#E7E3DA] bg-white">
      <div className="min-w-[820px]">
        <div
          className={`${COLUMNS} font-label border-b border-[#EDEAE2] bg-[#FBFAF7] py-3.5 text-[12px] tracking-[0.05em] text-[#8A857B] uppercase`}
        >
          <div>Guest</div>
          <div>Unit</div>
          <div>Dates</div>
          <div>Guests</div>
          <div>Status</div>
          <div />
        </div>

        {bookings.map((booking) => (
          <button
            key={booking.id}
            type="button"
            onClick={() => navigate(`/bookings/${booking.id}`)}
            className={`${COLUMNS} w-full cursor-pointer items-center border-b border-[#F2F0EA] py-4 text-left transition-colors last:border-b-0 hover:bg-[#FBFAF7]`}
          >
            <div className="truncate text-[15px] font-medium text-[#141412]">
              {booking.guestName}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14px] text-[#4A463E]">
                {booking.unit.unitName}
              </p>
              <p className="truncate text-[12px] text-[#A29C90]">
                {booking.unit.propertyName}
              </p>
            </div>

            <div className="min-w-0">
              <p className="truncate text-[14px] text-[#4A463E]">
                {formatCalendarRange(booking.startDate, booking.endDate)}
              </p>
              <p className="text-[12px] text-[#A29C90]">
                {booking.nights} {booking.nights === 1 ? "night" : "nights"}
              </p>
            </div>

            <div className="text-[14px] text-[#6B665C]">
              {booking.numberOfGuests
                ? `${booking.numberOfGuests} guests`
                : "—"}
            </div>

            <div>
              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="text-right text-[14px] font-medium text-[#3F7D5A]">
              Open
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default StaysTable;
