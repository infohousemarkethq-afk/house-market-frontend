import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Image01Icon } from "@hugeicons/core-free-icons";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import CardGridSkeleton from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import ArchiveBlockedDialog from "../features/properties/components/ArchiveBlockedDialog";
import PropertyDetailSkeleton from "../features/properties/components/PropertyDetailSkeleton";
import PropertyFormModal from "../features/properties/components/PropertyFormModal";
import PropertyImageModal from "../features/properties/components/PropertyImageModal";
import {
  useArchiveProperty,
  useProperty,
  useRestoreProperty,
} from "../features/properties/hooks/useProperties";
import { isArchived, typeLabel } from "../features/properties/properties.utils";
import { usePropertyUnits } from "../features/units/hooks/useUnits";
import { UNIT_TYPE_LABEL } from "../features/units/units.types";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [blockedOpen, setBlockedOpen] = useState(false);

  const { data: property, isPending, isError, error } = useProperty(id);
  const { data: unitsPage, isPending: unitsPending } = usePropertyUnits(id);
  const archive = useArchiveProperty();
  const restore = useRestoreProperty();

  const units = unitsPage?.items ?? [];

  if (isPending) return <PropertyDetailSkeleton />;

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Callout tone="warning" title="We couldn't open this property">
          {getApiErrorMessage(error, "It may have been removed.")}
        </Callout>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate("/properties")}>
            Back to properties
          </Button>
        </div>
      </div>
    );
  }

  const archived = isArchived(property);

  const onArchive = () => {
    archive.mutate(property.id, {
      onSuccess: () => toast.success(`${property.propertyName} archived`),
      onError: (mutationError) => {
        if (
          mutationError instanceof AxiosError &&
          mutationError.response?.status === 409
        ) {
          setBlockedOpen(true);
          return;
        }
        toast.error(
          getApiErrorMessage(
            mutationError,
            "We couldn't archive this property.",
          ),
        );
      },
    });
  };

  const onRestore = () => {
    restore.mutate(property.id, {
      onSuccess: () => toast.success(`${property.propertyName} restored`),
      onError: (mutationError) =>
        toast.error(
          getApiErrorMessage(
            mutationError,
            "We couldn't restore this property.",
          ),
        ),
    });
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <Link
        to="/properties"
        className="mb-6 inline-flex items-center gap-2 text-[15px] text-[#4A463E] hover:text-[#141412]"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={18}
          color="currentColor"
          strokeWidth={1.8}
        />
        Properties
      </Link>

      <div className="overflow-hidden rounded-[16px] border border-[#E7E3DA] bg-white md:flex">
        <div className="flex h-[240px] items-center justify-center bg-[#EFEDE6] md:h-auto md:w-[300px] md:shrink-0">
          {property.imageUrl ? (
            <img
              src={property.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <HugeiconsIcon
              icon={Image01Icon}
              size={32}
              color="#B4AE9F"
              strokeWidth={1.5}
            />
          )}
        </div>

        <div className="flex-1 p-7">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-serif text-[36px] leading-tight text-[#141412]">
              {property.propertyName}
            </h1>
            <Badge>{typeLabel(property)}</Badge>
            {archived && <Badge tone="warning">Archived</Badge>}
          </div>

          <p className="mt-3 text-[15px] text-[#6B665C]">
            {property.propertyAddress}, {property.propertyCity}
          </p>

          <p className="mt-2 text-[15px] text-[#4A463E]">
            {property.activeUnitCount} active of {property.totalUnitCount}{" "}
            {property.totalUnitCount === 1 ? "unit" : "units"}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setEditOpen(true)}>
              Edit details
            </Button>
            <Button variant="secondary" onClick={() => setImageOpen(true)}>
              {property.imageUrl ? "Replace image" : "Add image"}
            </Button>

            {archived ? (
              <Button
                variant="secondary"
                onClick={onRestore}
                disabled={restore.isPending}
              >
                {restore.isPending ? "Restoring…" : "Restore property"}
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={onArchive}
                disabled={archive.isPending}
                className="border-[#E0BDB2] text-[#B4432B] hover:bg-[#FBF0ED]"
              >
                {archive.isPending ? "Archiving…" : "Archive property"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <h2 className="mt-12 mb-6 text-[22px] font-semibold text-[#141412]">
        Units in this property
      </h2>

      {unitsPending ? (
        // Its own query, so it lands after the property does. Without this the
        // section would flash "No units yet" before the real answer arrives.
        <CardGridSkeleton count={3} />
      ) : units.length === 0 ? (
        <EmptyState
          title="No units yet"
          description="Units are the flats and rooms guests actually book. Add them from the Units screen."
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {units.map((unit) => (
            <Link
              key={unit.id}
              to={`/units/${unit.id}`}
              className="block overflow-hidden rounded-[16px] border border-[#E7E3DA] bg-white transition-colors hover:border-[#C9C2B4]"
            >
              <div className="flex h-[170px] items-center justify-center bg-[#EFEDE6]">
                {unit.coverImageUrl ? (
                  <img
                    src={unit.coverImageUrl}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={Image01Icon}
                    size={26}
                    color="#B4AE9F"
                    strokeWidth={1.5}
                  />
                )}
              </div>

              <div className="flex items-start justify-between gap-3 p-5">
                <h3 className="text-[16px] font-semibold text-[#141412]">
                  {unit.unitName}
                </h3>
                <Badge>
                  {unit.unitType === "OTHER"
                    ? (unit.unitTypeOther ?? UNIT_TYPE_LABEL.OTHER)
                    : UNIT_TYPE_LABEL[unit.unitType]}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}

      {editOpen && (
        <PropertyFormModal
          onClose={() => setEditOpen(false)}
          property={property}
        />
      )}
      {imageOpen && (
        <PropertyImageModal
          onClose={() => setImageOpen(false)}
          property={property}
        />
      )}
      {blockedOpen && (
        <ArchiveBlockedDialog
          onClose={() => setBlockedOpen(false)}
          propertyName={property.propertyName}
          units={units}
        />
      )}
    </div>
  );
};

export default PropertyDetail;
