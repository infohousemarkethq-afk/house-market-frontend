import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { formatNaira } from "../../../utils/formatNaira.util";
import type { UnitSummary } from "../../units/units.types";
import { BookingFormSchema, type BookingFormValues } from "../calander.schema";
import {
  busyNightsOf,
  dayDate,
  toApiDate,
  type MonthWindow,
} from "../calander.utils";
import { useCreateBooking, useUnitCalendar } from "../hooks/useBookings";
import MonthDayPicker from "./MonthDayPicker";

interface NewBookingModalProps {
  onClose: () => void;
  window: MonthWindow;
  units: UnitSummary[];
  /** Preselected when the form is opened from a unit's row. */
  unitId?: string;
}

const NewBookingModal = ({
  onClose,
  window,
  units,
  unitId,
}: NewBookingModalProps) => {
  const [range, setRange] = useState<{
    startDay: number | null;
    endDay: number | null;
  }>({ startDay: null, endDay: null });

  const createBooking = useCreateBooking();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormValues>({
    resolver: zodResolver(BookingFormSchema),
    mode: "onTouched",
    defaultValues: {
      unitId: unitId ?? units[0]?.id ?? "",
      guestName: "",
      guestPhone: "",
      guestEmail: "",
      startDate: "",
      endDate: "",
      numberOfGuests: "2",
      notes: "",
    },
  });

  const selectedUnitId = watch("unitId");
  const selectedUnit = units.find((unit) => unit.id === selectedUnitId);

  const { data: calendar, isPending: calendarPending } = useUnitCalendar(
    selectedUnitId,
    window,
  );

  const busyNights = busyNightsOf(window, calendar);
  const nights =
    range.startDay && range.endDay ? range.endDay - range.startDay : 0;
  const rate = selectedUnit?.pricePerNight ?? null;

  const onPickRange = (startDay: number | null, endDay: number | null) => {
    setRange({ startDay, endDay });

    setValue("startDate", startDay ? toApiDate(dayDate(window, startDay)) : "", {
      shouldValidate: Boolean(startDay && endDay),
    });
    setValue("endDate", endDay ? toApiDate(dayDate(window, endDay)) : "", {
      shouldValidate: Boolean(endDay),
    });
  };

  const onSubmit = async (values: BookingFormValues) => {
    try {
      const booking = await createBooking.mutateAsync({
        unitId: values.unitId,
        guestName: values.guestName,
        startDate: values.startDate,
        endDate: values.endDate,
        numberOfGuests: Number(values.numberOfGuests),
        ...(values.guestPhone && { guestPhone: values.guestPhone }),
        ...(values.guestEmail && { guestEmail: values.guestEmail }),
        ...(values.notes && { notes: values.notes }),
      });

      toast.success(`${booking.guestName}'s stay is booked`);
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't create this booking."),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!createBooking.isPending}
      size="lg"
      title="New booking"
      description="Dates already taken are unselectable. Same-day changeovers are allowed."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-[14px] text-[#6B665C]">
            {nights > 0 && rate ? (
              <>
                {nights} {nights === 1 ? "night" : "nights"} ×{" "}
                {formatNaira(rate)}
                <span className="ml-3 text-[20px] font-semibold text-[#141412]">
                  {formatNaira(rate * nights)}
                </span>
              </>
            ) : nights > 0 ? (
              `${nights} ${nights === 1 ? "night" : "nights"} · no nightly rate set`
            ) : (
              "Pick the dates"
            )}
          </div>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={createBooking.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="booking-form"
              disabled={createBooking.isPending}
            >
              {createBooking.isPending ? "Saving…" : "Create booking"}
            </Button>
          </div>
        </div>
      }
    >
      <form id="booking-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Unit" {...register("unitId")} error={errors.unitId?.message}>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitName} — {unit.property.propertyName}
                </option>
              ))}
            </Select>

            <TextField
              label="Guests"
              inputMode="numeric"
              error={errors.numberOfGuests?.message}
              hint={
                selectedUnit?.maxGuests
                  ? `Sleeps up to ${selectedUnit.maxGuests}`
                  : undefined
              }
              {...register("numberOfGuests")}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Guest name"
              placeholder="Grace Adeyemi"
              error={errors.guestName?.message}
              {...register("guestName")}
            />
            <TextField
              label="Phone"
              placeholder="08012345678"
              hint="Optional"
              error={errors.guestPhone?.message}
              {...register("guestPhone")}
            />
          </div>

          <TextField
            label="Email"
            type="email"
            placeholder="grace@example.com"
            hint="Optional"
            error={errors.guestEmail?.message}
            {...register("guestEmail")}
          />

          <div>
            <p className="mb-2 text-[14px] font-medium text-[#2A2822]">
              Dates · {window.label}
            </p>

            <MonthDayPicker
              window={window}
              busyNights={busyNights}
              startDay={range.startDay}
              endDay={range.endDay}
              onChange={onPickRange}
              disabled={calendarPending || createBooking.isPending}
            />

            {(errors.startDate ?? errors.endDate) && (
              <p className="mt-2 text-[13px] text-[#B4432B]">
                {errors.endDate?.message ?? errors.startDate?.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="booking-notes"
              className="mb-2 block text-[14px] font-medium text-[#2A2822]"
            >
              Notes
            </label>
            <textarea
              id="booking-notes"
              rows={2}
              placeholder="Arriving late, key with security."
              className="w-full resize-y rounded-[10px] border border-[#DCD6CB] bg-white px-4 py-3 text-[15px] leading-relaxed text-[#141412] transition-colors placeholder:text-[#A8A296] focus:border-[#141412] focus:outline-none"
              {...register("notes")}
            />
            {errors.notes && (
              <p className="mt-2 text-[13px] text-[#B4432B]">
                {errors.notes.message}
              </p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default NewBookingModal;
