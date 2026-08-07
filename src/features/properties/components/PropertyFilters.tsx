import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, Search01Icon } from "@hugeicons/core-free-icons";

import PillGroup, { type PillOption } from "../../../components/ui/PillGroup";
import Select from "../../../components/ui/Select";
import { cn } from "../../../utils/cn.util";
import {
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABEL,
  type PropertyFilters as Filters,
  type PropertyType,
} from "../properties.types";
import { hasActiveFilters } from "../properties.utils";

const TYPE_OPTIONS: PillOption<PropertyType | "">[] = [
  { value: "", label: "All types" },
  ...PROPERTY_TYPES.map((type) => ({
    value: type,
    label: PROPERTY_TYPE_LABEL[type],
  })),
];

interface PropertyFiltersProps {
  filters: Filters;
  /** Stable across renders — the debounce below depends on it. */
  onChange: (patch: Partial<Filters>, replace?: boolean) => void;
  cities: string[];
  total: number;
  isFetching: boolean;
}

const PropertyFiltersBar = ({
  filters,
  onChange,
  cities,
  total,
  isFetching,
}: PropertyFiltersProps) => {
  /** The search box is typed into far faster than it's worth querying. */
  const [draft, setDraft] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);

  // Follow the URL when it changes from elsewhere — "Clear all", or the back
  // button. Adjusted during render rather than in an effect so the input never
  // paints one frame showing the stale text.
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setDraft(filters.search);
  }

  useEffect(() => {
    if (draft === filters.search) return;

    const timer = setTimeout(() => onChange({ search: draft }, true), 300);
    return () => clearTimeout(timer);
  }, [draft, filters.search, onChange]);

  const active = hasActiveFilters(filters);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[240px] flex-1 sm:max-w-[340px]">
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
            aria-label="Search properties by name"
            placeholder="Search by name"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-[48px] w-full rounded-full border border-[#DCD6CB] bg-white pr-4 pl-11 text-[14px] text-[#141412] transition-colors placeholder:text-[#9A9488] hover:border-[#B8B1A4] focus:border-[#141412] focus:outline-none"
          />
        </div>

        <Select
          label="City"
          hideLabel
          value={filters.city}
          onChange={(event) => onChange({ city: event.target.value })}
          className="w-auto min-w-[160px]"
        >
          <option value="">All cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </Select>

        <button
          type="button"
          aria-pressed={filters.includeArchived}
          onClick={() => onChange({ includeArchived: !filters.includeArchived })}
          className={cn(
            "h-[48px] cursor-pointer rounded-full border px-5 text-[14px] font-medium transition-colors",
            filters.includeArchived
              ? "border-[#141412] bg-[#141412] text-[#F5F3EF]"
              : "border-[#DCD6CB] bg-white text-[#2A2822] hover:border-[#B8B1A4]",
          )}
        >
          Show archived
        </button>
      </div>

      <div className="mt-4">
        <PillGroup
          options={TYPE_OPTIONS}
          value={filters.type}
          onChange={(type) => onChange({ type })}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p
          aria-live="polite"
          className={cn(
            "font-label text-[12px] tracking-[0.14em] text-[#6B665C] uppercase transition-opacity",
            isFetching && "opacity-50",
          )}
        >
          {total === 1 ? "1 property" : `${total} properties`}
        </p>

        {filters.city && (
          <FilterChip
            label={filters.city}
            onRemove={() => onChange({ city: "" })}
          />
        )}
        {filters.type && (
          <FilterChip
            label={PROPERTY_TYPE_LABEL[filters.type]}
            onRemove={() => onChange({ type: "" })}
          />
        )}
        {filters.includeArchived && (
          <FilterChip
            label="Including archived"
            onRemove={() => onChange({ includeArchived: false })}
          />
        )}

        {active && (
          <button
            type="button"
            onClick={() =>
              onChange({
                search: "",
                city: "",
                type: "",
                includeArchived: false,
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

const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD6CB] bg-white py-1 pr-1.5 pl-3 text-[13px] text-[#2A2822]">
    {label}
    <button
      type="button"
      onClick={onRemove}
      aria-label={`Remove ${label} filter`}
      className="cursor-pointer rounded-full p-1 text-[#8A857B] hover:bg-[#EFEDE6] hover:text-[#141412]"
    >
      <HugeiconsIcon
        icon={Cancel01Icon}
        size={13}
        color="currentColor"
        strokeWidth={2}
      />
    </button>
  </span>
);

export default PropertyFiltersBar;
