import { useState } from "react";
import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { cn } from "../utils/cn.util";
import { getApiErrorMessage } from "../utils/apiError.util";
import { formatNaira } from "../utils/formatNaira.util";
import {
  formatApiDateTime,
  formatCalendarDayShort,
  formatCalendarRangeLong,
} from "../utils/formatTime.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import BookingStatusBadge from "../features/calander/components/BookingStatusBadge";
import CancelBookingModal from "../features/calander/components/CancelBookingModal";
import {
  useBooking,
  useCheckIn,
  useCheckOut,
} from "../features/calander/hooks/useBookings";
import { visibleAmount } from "../features/calander/calander.utils";
import type { BookingDetail as Booking } from "../features/calander/calander.types";

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[12px] text-[#8A857B]">{label}</p>
    <p className="mt-1 text-[15px] text-[#2A2822]">{value}</p>
  </div>
);

function progressSteps(booking: Booking) {
  const arrived =
    booking.status === "CHECKED_IN" || booking.status === "CHECKED_OUT";
  const departed = booking.status === "CHECKED_OUT";

  return [
    {
      label: "Created",
      when: formatApiDateTime(booking.createdAt),
      done: true,
    },
    {
      label: "Checked in",
      when: arrived
        ? `${formatCalendarDayShort(booking.startDate)}, on arrival`
        : `expected ${formatCalendarDayShort(booking.startDate)}, from 2pm`,
      done: arrived,
    },
    {
      label: "Checked out",
      when: departed
        ? `${formatCalendarDayShort(booking.endDate)}, on departure`
        : `expected ${formatCalendarDayShort(booking.endDate)}, by 11am`,
      done: departed,
    },
  ];
}

const BookingDetailPage = () => {
  const { id } = useParams();
  const { viewRole } = useAuth();
  const [cancelOpen, setCancelOpen] = useState(false);

  const { data: booking, isPending, isError, error } = useBooking(id);
  const checkIn = useCheckIn();
  const checkOut = useCheckOut();

  const isAdmin = viewRole === "admin";
  const isStaff = viewRole === "admin" || viewRole === "manager";

  const onCheckIn = async () => {
    if (!booking) return;
    try {
      await checkIn.mutateAsync(booking.id);
      toast.success(`${booking.guestName} is checked in`);
    } catch (mutationError) {
      toast.error(
        getApiErrorMessage(mutationError, "We couldn't check this guest in."),
      );
    }
  };

  const onCheckOut = async () => {
    if (!booking) return;
    try {
      await checkOut.mutateAsync(booking.id);
      toast.success(`${booking.guestName} is checked out`);
    } catch (mutationError) {
      toast.error(
        getApiErrorMessage(mutationError, "We couldn't check this guest out."),
      );
    }
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-[1080px] space-y-6">
        <Skeleton className="h-[16px] w-[100px]" />
        <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
          <Skeleton className="h-[320px] rounded-[16px]" />
          <Skeleton className="h-[220px] rounded-[16px]" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1080px]">
        <Callout tone="warning" title="We couldn't load this booking">
          {getApiErrorMessage(error)}
        </Callout>
      </div>
    );
  }

  const amount = visibleAmount(booking);
  const nightlyRate =
    amount && booking.nights > 0 ? Math.round(amount.kobo / booking.nights) : null;

  const isCancelled = booking.status === "CANCELLED";
  const busy = checkIn.isPending || checkOut.isPending;

  return (
    <div className="mx-auto max-w-[1080px]">
      <Link
        to="/calendar"
        className="inline-flex items-center gap-2 text-[14px] text-[#6B665C] transition-colors hover:text-[#141412]"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={16}
          color="currentColor"
          strokeWidth={1.8}
        />
        Calendar
      </Link>

      <div className="mt-6 grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-[34px] leading-tight text-[#141412]">
                  {booking.guestName}
                </h1>
                <p className="mt-1 text-[15px] text-[#6B665C]">
                  {booking.unit.unitName} · {booking.unit.propertyName}
                </p>
              </div>

              <BookingStatusBadge status={booking.status} />
            </div>

            <div className="mt-6 grid gap-5 border-t border-[#EDEAE2] pt-6 sm:grid-cols-3">
              <Detail
                label="Dates"
                value={formatCalendarRangeLong(
                  booking.startDate,
                  booking.endDate,
                )}
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
              <Detail
                label="Phone"
                value={booking.guestPhone ?? "Not recorded"}
              />
              <Detail
                label="Email"
                value={booking.guestEmail ?? "Not recorded"}
              />
              <Detail label="Booked by" value={booking.createdBy.fullName} />
            </div>

            <div className="mt-6 border-t border-[#EDEAE2] pt-6">
              <p className="text-[12px] text-[#8A857B]">Notes</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[#4A463E]">
                {booking.notes ?? "No notes on this booking."}
              </p>
            </div>

            {isCancelled && (
              <Callout tone="warning" title="This stay was cancelled" className="mt-6">
                {booking.cancelledReason ?? "No reason was recorded."}
                {booking.cancelledAt &&
                  ` · ${formatApiDateTime(booking.cancelledAt)}`}
              </Callout>
            )}
          </section>

          <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-6 sm:p-7">
            <h2 className="text-[19px] font-semibold text-[#141412]">
              Progress
            </h2>

            <ol className="mt-5 space-y-4">
              {progressSteps(booking).map((step) => (
                <li key={step.label} className="flex items-start gap-3.5">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "mt-1.5 h-[10px] w-[10px] shrink-0 rounded-full",
                      step.done
                        ? "bg-[#3F7D5A]"
                        : "border border-[#D5D0C5] bg-white",
                    )}
                  />
                  <div>
                    <p
                      className={cn(
                        "text-[15px] font-medium",
                        step.done ? "text-[#141412]" : "text-[#A8A49A]",
                      )}
                    >
                      {step.label}
                    </p>
                    <p className="text-[13px] text-[#A29C90]">{step.when}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <div className="space-y-5">
          {amount && (
            <section className="rounded-[16px] bg-[#141412] p-6 text-[#F5F3EF]">
              <p className="text-[13px] text-[#8A857B]">{amount.label}</p>
              <p className="mt-3 text-[38px] leading-none font-semibold tracking-[-0.02em]">
                {formatNaira(amount.kobo)}
              </p>
              {nightlyRate && (
                <p className="mt-3 text-[13px] text-[#8A857B]">
                  {booking.nights}{" "}
                  {booking.nights === 1 ? "night" : "nights"} ×{" "}
                  {formatNaira(nightlyRate)}
                </p>
              )}
            </section>
          )}

          {isStaff && !isCancelled && (
            <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-6">
              <h2 className="text-[17px] font-semibold text-[#141412]">
                Actions
              </h2>

              <div className="mt-4 space-y-3">
                {booking.status === "CONFIRMED" && (
                  <Button
                    onClick={onCheckIn}
                    disabled={busy}
                    className="w-full"
                  >
                    {checkIn.isPending ? "Checking in…" : "Check in"}
                  </Button>
                )}

                {booking.status === "CHECKED_IN" && (
                  <Button
                    onClick={onCheckOut}
                    disabled={busy}
                    className="w-full"
                  >
                    {checkOut.isPending ? "Checking out…" : "Check out"}
                  </Button>
                )}

                {isAdmin && booking.status === "CONFIRMED" && (
                  <Button
                    variant="secondary"
                    onClick={() => setCancelOpen(true)}
                    disabled={busy}
                    className="w-full border-[#E3C6BD] text-[#A8543C] hover:bg-[#F8EFEC]"
                  >
                    Cancel booking
                  </Button>
                )}
              </div>

              <p className="mt-4 text-[13px] leading-relaxed text-[#8A857B]">
                Check-in is only offered once the stay is confirmed, and
                check-out only after arrival. A cancelled stay releases its
                dates immediately.
              </p>
            </section>
          )}
        </div>
      </div>

      {cancelOpen && (
        <CancelBookingModal
          booking={booking}
          onClose={() => setCancelOpen(false)}
        />
      )}
    </div>
  );
};

export default BookingDetailPage;
