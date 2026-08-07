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
import PropertyCard from "../features/properties/components/PropertyCard";
import PropertyFiltersBar from "../features/properties/components/PropertyFilters";
import PropertyFormModal from "../features/properties/components/PropertyFormModal";
import {
  useProperties,
  usePropertyCities,
} from "../features/properties/hooks/useProperties";
import {
  filtersFromParams,
  hasActiveFilters,
  paramsFromFilters,
} from "../features/properties/properties.utils";
import type { PropertyFilters } from "../features/properties/properties.types";

const Properties = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const filters = filtersFromParams(searchParams);

  const updateFilters = useCallback(
    (patch: Partial<PropertyFilters>, replace = false) => {
      setSearchParams(
        (previous) => {
          const next = { ...filtersFromParams(previous), ...patch };

          if (!("page" in patch)) next.page = 1;
          return paramsFromFilters(next);
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const { data, isPending, isError, error, isFetching } =
    useProperties(filters);
  const { data: cities = [] } = usePropertyCities();

  const properties = data?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[42px] leading-tight text-[#141412]">
            Properties
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            Buildings you manage. Open one to see its units.
          </p>
        </div>

        <Button onClick={() => setFormOpen(true)} className="gap-2">
          <HugeiconsIcon
            icon={PlusSignIcon}
            size={18}
            color="currentColor"
            strokeWidth={2}
          />
          Add property
        </Button>
      </div>

      <PropertyFiltersBar
        filters={filters}
        onChange={updateFilters}
        cities={cities}
        total={meta?.total ?? 0}
        isFetching={isFetching}
      />

      {isPending ? (
        <CardGridSkeleton />
      ) : isError ? (
        <Callout tone="warning" title="We couldn't load your properties">
          {getApiErrorMessage(error)}
        </Callout>
      ) : properties.length === 0 ? (
        hasActiveFilters(filters) ? (
          <EmptyState
            title="Nothing matches those filters"
            description={
              filters.search
                ? `No properties named “${filters.search}” with the filters you've set.`
                : "No properties match the filters you've set."
            }
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  updateFilters({
                    search: "",
                    city: "",
                    type: "",
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
            title="No properties yet"
            description="Add your first building, then put units inside it."
            action={
              <Button onClick={() => setFormOpen(true)}>Add property</Button>
            }
          />
        )
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
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

      {formOpen && <PropertyFormModal onClose={() => setFormOpen(false)} />}
    </div>
  );
};

export default Properties;
