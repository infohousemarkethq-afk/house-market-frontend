import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import { formatApiDate } from "../utils/formatTime.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import PaymentFiltersBar from "../features/payments/components/PaymentFilters";
import PaymentTotals from "../features/payments/components/PaymentTotals";
import PaymentsTable from "../features/payments/components/PaymentsTable";
import RecordPaymentModal from "../features/payments/components/RecordPaymentModal";
import {
  usePayments,
  usePaymentTotals,
} from "../features/payments/hooks/usePayment";
import {
  monthStartIso,
  paymentFiltersFromParams,
  paramsFromPaymentFilters,
  paymentsSubtitleFor,
  hasActivePaymentFilters,
  showsBothDirections,
  todayIso,
} from "../features/payments/payments.utils";
import type { PaymentFilters } from "../features/payments/payment.types";
import { useUnits } from "../features/units/hooks/useUnits";
import { DEFAULT_UNIT_FILTERS } from "../features/units/units.types";

const Payments = () => {
  const { viewRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [recordOpen, setRecordOpen] = useState(false);

  const filters = paymentFiltersFromParams(searchParams);

  const updateFilters = useCallback(
    (patch: Partial<PaymentFilters>, replace = false) => {
      setSearchParams(
        (previous) => {
          const next = { ...paymentFiltersFromParams(previous), ...patch };

          if (!("page" in patch)) next.page = 1;
          return paramsFromPaymentFilters(next);
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  /**
   * Managers have no payment visibility at all — every route in the backend's
   * payment.routes.ts is requireRole("COMPANY_ADMIN", "OWNER"). The nav hides
   * the link, so this only shows if the URL is typed; better an explanation
   * than a request we know will 403.
   */
  const allowed = viewRole === "admin" || viewRole === "owner";

  // Totals follow the filtered range, so the figures always describe the rows
  // underneath them. With no range set, they cover the current month.
  const from = filters.from || monthStartIso();
  const to = filters.to || todayIso();

  const { data, isPending, isError, error, isFetching } = usePayments(filters);
  const totalsQuery = usePaymentTotals(allowed ? from : "", allowed ? to : "");
  const { data: unitData } = useUnits(DEFAULT_UNIT_FILTERS);

  const payments = data?.items ?? [];
  const units = unitData?.items ?? [];
  const meta = data?.meta;
  const showBoth = viewRole ? showsBothDirections(viewRole) : true;

  if (!allowed) {
    return (
      <div className="mx-auto max-w-[1180px]">
        <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
          Payments
        </h1>
        <Callout tone="warning" title="Payments aren't part of your view" className="mt-6">
          Payment history is a commercial record between the company and unit
          owners. Ask a company admin if you need a figure from it.
        </Callout>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
            Payments
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            {viewRole ? paymentsSubtitleFor(viewRole) : ""}
          </p>
        </div>

        {/* Owners read this ledger; only the company writes to it. */}
        {viewRole === "admin" && (
          <Button onClick={() => setRecordOpen(true)} className="gap-2">
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
            />
            Record payment
          </Button>
        )}
      </div>

      <PaymentTotals
        totals={totalsQuery.data}
        isPending={totalsQuery.isPending}
        showBothDirections={showBoth}
        rangeLabel={`${formatApiDate(from)} — ${formatApiDate(to)}`}
      />

      <PaymentFiltersBar
        filters={filters}
        onChange={updateFilters}
        units={units}
        total={meta?.total ?? 0}
        isFetching={isFetching}
        showDirectionFilter={showBoth}
      />

      {isPending ? (
        <Skeleton className="h-[380px] rounded-[16px]" />
      ) : isError ? (
        <Callout tone="warning" title="We couldn't load your payments">
          {getApiErrorMessage(error)}
        </Callout>
      ) : payments.length === 0 ? (
        hasActivePaymentFilters(filters) ? (
          <EmptyState
            title="Nothing matches those filters"
            description="No payments match the filters you've set."
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  updateFilters({
                    search: "",
                    unitId: "",
                    type: "",
                    direction: "",
                    from: "",
                    to: "",
                  })
                }
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No payments recorded yet"
            description={
              viewRole === "owner"
                ? "Payouts made to you from the date you took ownership will appear here."
                : "Booking payments, owner payouts and maintenance costs all live here. Recording one is history-keeping — no money moves through House Market."
            }
            action={
              viewRole === "admin" ? (
                <Button onClick={() => setRecordOpen(true)}>
                  Record the first payment
                </Button>
              ) : undefined
            }
          />
        )
      ) : (
        <>
          <PaymentsTable payments={payments} showSign={showBoth} />

          {meta && meta.totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onChange={(page) => updateFilters({ page })}
              />
            </div>
          )}
        </>
      )}

      {recordOpen && (
        <RecordPaymentModal
          units={units}
          onClose={() => setRecordOpen(false)}
        />
      )}
    </div>
  );
};

export default Payments;
