import { useCallback, useState } from "react";
import { useSearchParams } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon } from "@hugeicons/core-free-icons";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import Pagination from "../components/ui/Pagination";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import DocumentFiltersBar from "../features/documents/components/DocumentFilters";
import DocumentsTable from "../features/documents/components/DocumentsTable";
import UploadDocumentModal from "../features/documents/components/UploadDocumentModal";
import { useDocuments } from "../features/documents/hooks/useDocument";
import {
  documentFiltersFromParams,
  documentsSubtitleFor,
  hasActiveDocumentFilters,
  paramsFromDocumentFilters,
} from "../features/documents/documents.utils";
import type { DocumentFilters } from "../features/documents/document.type";
import { useUnits } from "../features/units/hooks/useUnits";
import { DEFAULT_UNIT_FILTERS } from "../features/units/units.types";

const Documents = () => {
  const { viewRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [uploadOpen, setUploadOpen] = useState(false);

  const filters = documentFiltersFromParams(searchParams);

  const updateFilters = useCallback(
    (patch: Partial<DocumentFilters>, replace = false) => {
      setSearchParams(
        (previous) => {
          const next = { ...documentFiltersFromParams(previous), ...patch };

          if (!("page" in patch)) next.page = 1;
          return paramsFromDocumentFilters(next);
        },
        { replace },
      );
    },
    [setSearchParams],
  );

  const { data, isPending, isError, error, isFetching } = useDocuments(filters);
  const { data: unitData } = useUnits(DEFAULT_UNIT_FILTERS);

  const documents = data?.items ?? [];
  const units = unitData?.items ?? [];
  const meta = data?.meta;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[30px] leading-tight text-[#141412] sm:text-[42px]">
            Documents
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            {viewRole ? documentsSubtitleFor(viewRole) : ""}
          </p>
        </div>

        <Button onClick={() => setUploadOpen(true)} className="gap-2">
          <HugeiconsIcon
            icon={Upload01Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.8}
          />
          Upload document
        </Button>
      </div>

      <DocumentFiltersBar
        filters={filters}
        onChange={updateFilters}
        units={units}
        total={meta?.total ?? 0}
        isFetching={isFetching}
      />

      {isPending ? (
        <Skeleton className="h-[380px] rounded-[16px]" />
      ) : isError ? (
        <Callout tone="warning" title="We couldn't load your documents">
          {getApiErrorMessage(error)}
        </Callout>
      ) : documents.length === 0 ? (
        hasActiveDocumentFilters(filters) ? (
          <EmptyState
            title="Nothing matches those filters"
            description={
              filters.search
                ? `No documents named “${filters.search}” with the filters you've set.`
                : "No documents match the filters you've set."
            }
            action={
              <Button
                variant="secondary"
                onClick={() =>
                  updateFilters({ search: "", unitId: "", category: "" })
                }
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <EmptyState
            title="Nothing filed yet"
            description={
              viewRole === "owner"
                ? "Documents filed from the date you took ownership will appear here. Anything the previous owner filed stays with them."
                : "Leases, titles, inspections and maintenance records all live here, filed against one unit."
            }
            action={
              <Button onClick={() => setUploadOpen(true)}>
                Upload your first document
              </Button>
            }
          />
        )
      ) : (
        <>
          <DocumentsTable documents={documents} />

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

      {uploadOpen && viewRole && (
        <UploadDocumentModal
          role={viewRole}
          units={units}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </div>
  );
};

export default Documents;
