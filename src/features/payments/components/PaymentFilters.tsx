import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import Select from "../../../components/ui/Select";
import { cn } from "../../../utils/cn.util";
import type { UnitSummary } from "../../units/units.types";
import {
  PAYMENT_DIRECTION_LABEL,
  PAYMENT_DIRECTIONS,
  PAYMENT_TYPE_LABEL,
  PAYMENT_TYPES,
  type PaymentDirection,
  type PaymentFilters as Filters,
  type PaymentType,
} from "../payment.types";
import { hasActivePaymentFilters, todayIso } from "../payments.utils";

interface PaymentFiltersProps {
  filters: Filters;
  /** Stable across renders — the debounce below depends on it. */
  onChange: (patch: Partial<Filters>, replace?: boolean) => void;
  units: UnitSummary[];
  total: number;
  isFetching: boolean;
  /** Owners have one direction, so the selector would only ever say "out". */
  showDirectionFilter: boolean;
}

const dateInput =
  "h-[48px] rounded-[10px] border border-[#DCD6CB] bg-white px-3 text-[14px] text-[#141412] transition-colors hover:border-[#B8B1A4] focus:border-[#141412] focus:outline-none";

const PaymentFiltersBar = ({
  filters,
  onChange,
  units,
  total,
  isFetching,
  showDirectionFilter,
}: PaymentFiltersProps) => {
  const [draft, setDraft] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);

  // Follow the URL when it changes from elsewhere — "Clear all", or the back
  // button. Adjusted during render so the input never paints stale text.
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setDraft(filters.search);
  }

  useEffect(() => {
    if (draft === filters.search) return;

    const timer = setTimeout(() => onChange({ search: draft }, true), 300);
    return () => clearTimeout(timer);
  }, [draft, filters.search, onChange]);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-[300px]">
          <span className="pointer-events-none absolute top-0 left-4 flex h-[48px] items-center text-[#9A9488]">
            <HugeiconsIcon
              icon={Search01Icon}
              size={17}
              color="currentColor"
              strokeWidth={1.8}
            />
          </span>
          <input
            type="search"
            aria-label="Search payments by description or reference"
            placeholder="Search description or reference"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-[48px] w-full rounded-full border border-[#DCD6CB] bg-white pr-4 pl-11 text-[14px] text-[#141412] transition-colors placeholder:text-[#9A9488] hover:border-[#B8B1A4] focus:border-[#141412] focus:outline-none"
          />
        </div>

        <Select
          label="Unit"
          hideLabel
          value={filters.unitId}
          onChange={(event) => onChange({ unitId: event.target.value })}
          className="w-auto min-w-[170px]"
        >
          <option value="">All units</option>
          {units.map((unit) => (
            <option key={unit.id} value={unit.id}>
              {unit.unitName}
            </option>
          ))}
        </Select>

        <Select
          label="Type"
          hideLabel
          value={filters.type}
          onChange={(event) =>
            onChange({ type: event.target.value as PaymentType | "" })
          }
          className="w-auto min-w-[180px]"
        >
          <option value="">All types</option>
          {PAYMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {PAYMENT_TYPE_LABEL[type]}
            </option>
          ))}
        </Select>

        {showDirectionFilter && (
          <Select
            label="Direction"
            hideLabel
            value={filters.direction}
            onChange={(event) =>
              onChange({
                direction: event.target.value as PaymentDirection | "",
              })
            }
            className="w-auto min-w-[150px]"
          >
            <option value="">In and out</option>
            {PAYMENT_DIRECTIONS.map((direction) => (
              <option key={direction} value={direction}>
                {PAYMENT_DIRECTION_LABEL[direction]}
              </option>
            ))}
          </Select>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] text-[#6B665C]">
          From
          <input
            type="date"
            max={filters.to || todayIso()}
            value={filters.from}
            onChange={(event) => onChange({ from: event.target.value })}
            className={dateInput}
          />
        </label>

        <label className="flex items-center gap-2 text-[13px] text-[#6B665C]">
          To
          <input
            type="date"
            min={filters.from || undefined}
            max={todayIso()}
            value={filters.to}
            onChange={(event) => onChange({ to: event.target.value })}
            className={dateInput}
          />
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p
          aria-live="polite"
          className={cn(
            "font-label text-[12px] tracking-[0.14em] text-[#6B665C] uppercase transition-opacity",
            isFetching && "opacity-50",
          )}
        >
          {total === 1 ? "1 payment" : `${total} payments`}
        </p>

        {hasActivePaymentFilters(filters) && (
          <button
            type="button"
            onClick={() =>
              onChange({
                search: "",
                unitId: "",
                type: "",
                direction: "",
                from: "",
                to: "",
              })
            }
            className="cursor-pointer text-[13px] font-medium text-[#2F6B4E] underline underline-offset-4 hover:text-[#245239]"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentFiltersBar;
