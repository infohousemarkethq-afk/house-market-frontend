import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

import Select from "../../../components/ui/Select";
import { cn } from "../../../utils/cn.util";
import type { UnitSummary } from "../../units/units.types";
import {
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABEL,
  type DocumentCategory,
  type DocumentFilters as Filters,
} from "../document.type";
import { hasActiveDocumentFilters } from "../documents.utils";

interface DocumentFiltersProps {
  filters: Filters;
  /** Stable across renders — the debounce below depends on it. */
  onChange: (patch: Partial<Filters>, replace?: boolean) => void;
  units: UnitSummary[];
  total: number;
  isFetching: boolean;
}

const DocumentFiltersBar = ({
  filters,
  onChange,
  units,
  total,
  isFetching,
}: DocumentFiltersProps) => {
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
        <div className="relative min-w-[240px] flex-1 sm:max-w-[320px]">
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
            aria-label="Search documents by name"
            placeholder="Search documents"
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
          label="Category"
          hideLabel
          value={filters.category}
          onChange={(event) =>
            onChange({ category: event.target.value as DocumentCategory | "" })
          }
          className="w-auto min-w-[190px]"
        >
          <option value="">All categories</option>
          {DOCUMENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {DOCUMENT_CATEGORY_LABEL[category]}
            </option>
          ))}
        </Select>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p
          aria-live="polite"
          className={cn(
            "font-label text-[12px] tracking-[0.14em] text-[#6B665C] uppercase transition-opacity",
            isFetching && "opacity-50",
          )}
        >
          {total === 1 ? "1 document" : `${total} documents`}
        </p>

        {hasActiveDocumentFilters(filters) && (
          <button
            type="button"
            onClick={() =>
              onChange({ search: "", unitId: "", category: "" })
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

export default DocumentFiltersBar;
