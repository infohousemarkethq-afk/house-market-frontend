import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { PlusSignIcon } from "@hugeicons/core-free-icons";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import CardGridSkeleton from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import { useProperties } from "../features/properties/hooks/useProperties";
import { DEFAULT_PROPERTY_FILTERS } from "../features/properties/properties.types";
import UnitCard from "../features/units/components/UnitCard";
import UnitFiltersBar from "../features/units/components/UnitFilters";
import UnitFormModal from "../features/units/components/UnitFormModal";
import UnitPriceModal from "../features/units/components/UnitPriceModal";
import { useUnits } from "../features/units/hooks/useUnits";
import {
  hasActiveUnitFilters,
  paramsFromUnitFilters,
  unitFiltersFromParams,
} from "../features/units/units.utils";
import type { UnitFilters, UnitSummary } from "../features/units/units.types";

const Units = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [pricingUnit, setPricingUnit] = useState<UnitSummary | null>(null);

  const { viewRole } = useAuth();
  const isAdmin = viewRole === "admin";

  const filters = unitFiltersFromParams(searchParams);

  /**
   * The URL is the filter state, so every control writes here. Stable across
   * renders because it patches from the previous params rather than closing
   * over the current ones — which also keeps the search debounce honest.
   */
  const updateFilters = useCallback(
    (patch: Partial<UnitFilters>, replace = false) => {
      setSearchParams(
        (previous) => {
          const next = { ...unitFiltersFromParams(previous), ...patch };
          if (!("page" in patch)) next.page = 1;
          return paramsFromUnitFilters(next);
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const { data, isPending, isError, error, isFetching } = useUnits(filters);

  // Admin-only: the property list endpoint is COMPANY_ADMIN, and a manager
  // filtering by a building they can't read would only get a 403.
  const { data: propertiesPage } = useProperties({
    ...DEFAULT_PROPERTY_FILTERS,
    page: 1,
  });

  const units = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[42px] leading-tight text-[#141412]">
            Units
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            Every flat across your properties.
          </p>
        </div>

        {isAdmin && (
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <HugeiconsIcon
              icon={PlusSignIcon}
              size={18}
              color="currentColor"
              strokeWidth={2}
            />
            Add unit
          </Button>
        )}
      </div>

      <UnitFiltersBar
        filters={filters}
        onChange={updateFilters}
        properties={propertiesPage?.items ?? []}
        total={meta?.total ?? 0}
        isFetching={isFetching}
      />

      {isPending ? (
        <CardGridSkeleton />
      ) : isError ? (
        <Callout tone="warning" title="We couldn't load your units">
          {getApiErrorMessage(error)}
        </Callout>
      ) : units.length === 0 ? (
        hasActiveUnitFilters(filters) ? (
          <EmptyState
            title="Nothing matches those filters"
            description={
              filters.search
                ? `No units named “${filters.search}” with the filters you've set.`
                : "No units match the filters you've set."
            }
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  updateFilters({
                    search: "",
                    propertyId: "",
                    type: "",
                    minBedrooms: "",
                    amenities: [],
                    includeArchived: false,
                  })
                }
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="No units yet"
            description="Units are the flats and rooms guests actually book. Add your first one."
            action={
              isAdmin ? (
                <Button onClick={() => setFormOpen(true)}>Add unit</Button>
              ) : undefined
            }
          />
        )
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                onSetPrice={isAdmin ? setPricingUnit : undefined}
              />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-10">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                onChange={(page) => updateFilters({ page })}
              />
            </div>
          )}
        </>
      )}

      {formOpen && <UnitFormModal onClose={() => setFormOpen(false)} />}

      {pricingUnit && (
        <UnitPriceModal
          onClose={() => setPricingUnit(null)}
          unitId={pricingUnit.id}
          unitName={pricingUnit.unitName}
          pricePerNight={pricingUnit.pricePerNight}
          ownerRatePerNight={pricingUnit.ownerRatePerNight}
        />
      )}
    </div>
  );
};

export default Units;
