import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { Skeleton } from "../components/ui/SkeletonLoader";
import Tabs from "../components/ui/Tabs";
import { getApiErrorMessage } from "../utils/apiError.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import BlockDatesModal from "../features/calander/components/BlockDatesModal";
import BlockPeekModal from "../features/calander/components/BlockPeekModal";
import BookingPeekModal from "../features/calander/components/BookingPeekModal";
import CalendarGrid from "../features/calander/components/CalendarGrid";
import NewBookingModal from "../features/calander/components/NewBookingModal";
import StaysTable from "../features/calander/components/StaysTable";
import {
  useBookings,
  useUnitCalendars,
} from "../features/calander/hooks/useBookings";
import {
  currentMonthWindow,
  shiftMonth,
} from "../features/calander/calander.utils";
import {
  DEFAULT_BOOKING_FILTERS,
  type CalendarBlockEntry,
} from "../features/calander/calander.types";
import { useUnits } from "../features/units/hooks/useUnits";
import { DEFAULT_UNIT_FILTERS } from "../features/units/units.types";

type ActiveModal =
  | { kind: "new-booking" }
  | { kind: "block-dates" }
  | { kind: "peek-booking"; bookingId: string }
  | { kind: "peek-block"; block: CalendarBlockEntry; unitLine: string }
  | null;

const Calender = () => {
  const { viewRole } = useAuth();
  const isAdmin = viewRole === "admin";

  const [tab, setTab] = useState<"calendar" | "stays">("calendar");
  const [window, setWindow] = useState(currentMonthWindow);
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ActiveModal>(null);

  const { data: unitData, isPending: unitsPending } = useUnits(
    DEFAULT_UNIT_FILTERS,
  );
  const units = unitData?.items ?? [];

  const calendars = useUnitCalendars(
    units.map((unit) => unit.id),
    window,
  );

  const {
    data: stayData,
    isPending: staysPending,
    isError: staysError,
    error: staysErrorDetail,
  } = useBookings({ ...DEFAULT_BOOKING_FILTERS, page }, { window });

  const stays = stayData?.items ?? [];
  const meta = stayData?.meta;

  const onChangeMonth = (by: number) => {
    setWindow((current) => shiftMonth(current, by));
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
            Calendar
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            {isAdmin
              ? "Availability is computed from bookings and blocks."
              : "Read-only. Ask the managing company to change dates."}
          </p>
        </div>

        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => setModal({ kind: "block-dates" })}
            >
              Block dates
            </Button>
            <Button
              onClick={() => setModal({ kind: "new-booking" })}
              className="gap-2"
            >
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={18}
                color="currentColor"
                strokeWidth={2}
              />
              New booking
            </Button>
          </div>
        )}
      </div>

      <Tabs
        label="Calendar views"
        value={tab}
        onChange={setTab}
        options={[
          { value: "calendar", label: "Calendar" },
          { value: "stays", label: "Stays", count: meta?.total ?? 0 },
        ]}
      />

      <div className="mt-6">
        {tab === "calendar" ? (
          unitsPending ? (
            <Skeleton className="h-[420px] rounded-[16px]" />
          ) : units.length === 0 ? (
            <EmptyState
              title="No units to show"
              description="Add a unit and its stays and blocks will appear here."
            />
          ) : (
            <>
              {calendars.isError && (
                <Callout
                  tone="warning"
                  title="Some rows couldn't be loaded"
                  className="mb-4"
                >
                  {getApiErrorMessage(calendars.error)}
                </Callout>
              )}

              <CalendarGrid
                window={window}
                units={units}
                views={calendars.views}
                isPending={calendars.isPending}
                onPreviousMonth={() => onChangeMonth(-1)}
                onNextMonth={() => onChangeMonth(1)}
                onSelectBooking={(entry) =>
                  setModal({ kind: "peek-booking", bookingId: entry.id })
                }
                onSelectBlock={(entry, unit) =>
                  setModal({
                    kind: "peek-block",
                    block: entry,
                    unitLine: `${unit.unitName} · ${unit.property.propertyName}`,
                  })
                }
              />
            </>
          )
        ) : staysPending ? (
          <Skeleton className="h-[320px] rounded-[16px]" />
        ) : staysError ? (
          <Callout tone="warning" title="We couldn't load these stays">
            {getApiErrorMessage(staysErrorDetail)}
          </Callout>
        ) : stays.length === 0 ? (
          <EmptyState
            title={`No stays in ${window.label}`}
            description="Bookings that overlap this month will be listed here."
          />
        ) : (
          <>
            <StaysTable bookings={stays} />

            {meta && meta.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  page={meta.page}
                  totalPages={meta.totalPages}
                  onChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {modal?.kind === "new-booking" && (
        <NewBookingModal
          window={window}
          units={units}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "block-dates" && (
        <BlockDatesModal
          window={window}
          units={units}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "peek-booking" && (
        <BookingPeekModal
          bookingId={modal.bookingId}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.kind === "peek-block" && (
        <BlockPeekModal
          block={modal.block}
          unitLine={modal.unitLine}
          canRelease={isAdmin}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default Calender;
