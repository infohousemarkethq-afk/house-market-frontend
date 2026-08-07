import { useEffect, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowDown01Icon,
  Cancel01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";

import PillGroup, { type PillOption } from "../../../components/ui/PillGroup";
import Select from "../../../components/ui/Select";
import { cn } from "../../../utils/cn.util";
import type { PropertySummary } from "../../properties/properties.types";
import AmenityPicker from "./AmenityPicker";
import {
  AMENITY_LABEL,
  UNIT_TYPE_LABEL,
  UNIT_TYPE_OPTIONS,
  type UnitFilters as Filters,
  type UnitType,
} from "../units.types";
import { hasActiveUnitFilters } from "../units.utils";

const TYPE_OPTIONS: PillOption<UnitType | "">[] = [
  { value: "", label: "All types" },
  ...UNIT_TYPE_OPTIONS.map((type) => ({
    value: type,
    label: UNIT_TYPE_LABEL[type],
  })),
];

const BEDROOM_OPTIONS = ["1", "2", "3", "4", "5"];

interface UnitFiltersProps {
  filters: Filters;
  /** Stable across renders — the debounce below depends on it. */
  onChange: (patch: Partial<Filters>, replace?: boolean) => void;
  properties: PropertySummary[];
  total: number;
  isFetching: boolean;
}

const UnitFiltersBar = ({
  filters,
  onChange,
  properties,
  total,
  isFetching,
}: UnitFiltersProps) => {
  const [draft, setDraft] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);
  const [amenitiesOpen, setAmenitiesOpen] = useState(false);
  const amenitiesRef = useRef<HTMLDivElement>(null);

  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setDraft(filters.search);
  }

  useEffect(() => {
    if (draft === filters.search) return;

    const timer = setTimeout(() => onChange({ search: draft }, true), 300);
    return () => clearTimeout(timer);
  }, [draft, filters.search, onChange]);

  useEffect(() => {
    if (!amenitiesOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!amenitiesRef.current?.contains(event.target as Node)) {
        setAmenitiesOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAmenitiesOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [amenitiesOpen]);

  const active = hasActiveUnitFilters(filters);
  const selectedProperty = properties.find((p) => p.id === filters.propertyId);

  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-[300px]">
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
            aria-label="Search units by name"
            placeholder="Search units"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            className="h-[48px] w-full rounded-full border border-[#DCD6CB] bg-white pr-4 pl-11 text-[14px] text-[#141412] transition-colors placeholder:text-[#9A9488] hover:border-[#B8B1A4] focus:border-[#141412] focus:outline-none"
          />
        </div>

        <Select
          label="Property"
          hideLabel
          value={filters.propertyId}
          onChange={(event) => onChange({ propertyId: event.target.value })}
          className="w-auto min-w-[170px]"
        >
          <option value="">All properties</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.propertyName}
            </option>
          ))}
        </Select>

        <Select
          label="Minimum bedrooms"
          hideLabel
          value={filters.minBedrooms}
          onChange={(event) => onChange({ minBedrooms: event.target.value })}
          className="w-auto min-w-[160px]"
        >
          <option value="">Min bedrooms</option>
          {BEDROOM_OPTIONS.map((count) => (
            <option key={count} value={count}>
              {count}+ bedrooms
            </option>
          ))}
        </Select>

        <div ref={amenitiesRef} className="relative">
          <button
            type="button"
            aria-expanded={amenitiesOpen}
            onClick={() => setAmenitiesOpen((open) => !open)}
            className={cn(
              "flex h-[48px] cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] transition-colors",
              filters.amenities.length
                ? "border-[#141412] bg-[#141412] text-[#F5F3EF]"
                : "border-[#DCD6CB] bg-white text-[#2A2822] hover:border-[#B8B1A4]",
            )}
          >
            Amenities
            {filters.amenities.length > 0 && ` (${filters.amenities.length})`}
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              size={16}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>

          {amenitiesOpen && (
            <div className="absolute top-full left-0 z-20 mt-2 w-[420px] max-w-[calc(100vw-3rem)] rounded-[12px] border border-[#E7E3DA] bg-white p-4 shadow-lg">
              <AmenityPicker
                value={filters.amenities}
                onChange={(amenities) => onChange({ amenities })}
                showCount={false}
              />
              <p className="mt-3 text-[13px] text-[#8A857B]">
                Units must have every amenity you pick.
              </p>
            </div>
          )}
        </div>

        <button
          type="button"
          aria-pressed={filters.includeArchived}
          onClick={() =>
            onChange({ includeArchived: !filters.includeArchived })
          }
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
          {total === 1 ? "1 unit" : `${total} units`}
        </p>

        {selectedProperty && (
          <FilterChip
            label={selectedProperty.propertyName}
            onRemove={() => onChange({ propertyId: "" })}
          />
        )}
        {filters.type && (
          <FilterChip
            label={UNIT_TYPE_LABEL[filters.type]}
            onRemove={() => onChange({ type: "" })}
          />
        )}
        {filters.minBedrooms && (
          <FilterChip
            label={`${filters.minBedrooms}+ bedrooms`}
            onRemove={() => onChange({ minBedrooms: "" })}
          />
        )}
        {filters.amenities.map((amenity) => (
          <FilterChip
            key={amenity}
            label={AMENITY_LABEL[amenity]}
            onRemove={() =>
              onChange({
                amenities: filters.amenities.filter((a) => a !== amenity),
              })
            }
          />
        ))}
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
                propertyId: "",
                type: "",
                minBedrooms: "",
                amenities: [],
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

export default UnitFiltersBar;
