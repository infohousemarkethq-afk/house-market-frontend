import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import { getApiErrorMessage } from "../utils/apiError.util";
import { formatNaira } from "../utils/formatNaira.util";
import { initials } from "../utils/initials.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import UnitDetailSkeleton from "../features/units/components/UnitDetailSkeleton";
import UnitFormModal from "../features/units/components/UnitFormModal";
import UnitGallery from "../features/units/components/UnitGallery";
import UnitPriceModal from "../features/units/components/UnitPriceModal";
import {
  useArchiveUnit,
  useRestoreUnit,
  useUnit,
} from "../features/units/hooks/useUnits";
import { AMENITY_LABEL } from "../features/units/units.types";
import { isUnitArchived, unitTypeLabel, visibleRate } from "../features/units/units.utils";

const UnitDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [editOpen, setEditOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const { viewRole } = useAuth();
  const isAdmin = viewRole === "admin";

  const { data: unit, isPending, isError, error } = useUnit(id);
  const archive = useArchiveUnit();
  const restore = useRestoreUnit();

  if (isPending) return <UnitDetailSkeleton />;

  if (isError || !unit) {
    return (
      <div className="mx-auto max-w-[720px]">
        <Callout tone="warning" title="We couldn't open this unit">
          {getApiErrorMessage(error, "It may have been removed.")}
        </Callout>
        <div className="mt-6">
          <Button variant="secondary" onClick={() => navigate("/units")}>
            Back to units
          </Button>
        </div>
      </div>
    );
  }

  const archived = isUnitArchived(unit);
  const rate = visibleRate(unit);

  const stats = [
    { label: "Bedrooms", value: unit.bedrooms },
    { label: "Bathrooms", value: unit.bathrooms },
    { label: "Toilets", value: unit.toilets },
    { label: "Parlours", value: unit.parlors },
    { label: "Max guests", value: unit.maxGuests },
  ].filter((stat) => stat.value != null);

  const onArchive = () => {
    archive.mutate(unit.id, {
      onSuccess: () => toast.success(`${unit.unitName} archived`),
      onError: (mutationError) => {
        // 409 here means live bookings still run against this unit — see
        // archiveUnit in the backend's unit.service.ts.
        if (
          mutationError instanceof AxiosError &&
          mutationError.response?.status === 409
        ) {
          toast.error(
            getApiErrorMessage(
              mutationError,
              "This unit still has upcoming stays. Cancel or finish them first.",
            ),
          );
          return;
        }
        toast.error(
          getApiErrorMessage(mutationError, "We couldn't archive this unit."),
        );
      },
    });
  };

  const onRestore = () => {
    restore.mutate(unit.id, {
      onSuccess: () => toast.success(`${unit.unitName} restored`),
      onError: (mutationError) =>
        toast.error(
          getApiErrorMessage(mutationError, "We couldn't restore this unit."),
        ),
    });
  };

  return (
    <div className="mx-auto max-w-[1180px]">
      <Link
        to="/units"
        className="mb-6 inline-flex items-center gap-2 text-[15px] text-[#4A463E] hover:text-[#141412]"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={18}
          color="currentColor"
          strokeWidth={1.8}
        />
        Units
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-7">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-[36px] leading-tight text-[#141412]">
                {unit.unitName}
              </h1>
              <Badge>{unitTypeLabel(unit)}</Badge>
              {archived && <Badge tone="warning">Archived</Badge>}
            </div>

            <p className="mt-2 text-[15px] text-[#6B665C]">
              <Link
                to={`/properties/${unit.property.id}`}
                className="hover:text-[#141412] hover:underline"
              >
                {unit.property.propertyName}
              </Link>
              {" · "}
              {unit.property.propertyCity}
            </p>

            {stats.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[10px] border border-[#E7E3DA] px-4 py-3"
                  >
                    <p className="text-[22px] font-semibold text-[#141412]">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-[13px] text-[#8A857B]">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {unit.description && (
              <p className="mt-6 text-[15px] leading-relaxed text-[#4A463E]">
                {unit.description}
              </p>
            )}

            {unit.amenities.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {unit.amenities.map((amenity) => (
                  <Badge key={amenity}>{AMENITY_LABEL[amenity]}</Badge>
                ))}
              </div>
            )}
          </section>

          <UnitGallery
            unitId={unit.id}
            images={unit.images}
            canEdit={isAdmin && !archived}
          />
        </div>

        <div className="space-y-6">
          <section className="rounded-[16px] bg-[#141412] p-7 text-[#F5F3EF]">
            <p className="text-[14px] text-[#A29B8E]">
              {rate?.label ?? "Nightly rate"}
            </p>

            <p className="mt-2 font-serif text-[42px] leading-none">
              {rate ? formatNaira(rate.kobo) : "Not set"}
            </p>

            <p className="mt-4 text-[14px] leading-relaxed text-[#A29B8E]">
              per night · set separately from the unit's other details
            </p>

            {isAdmin && (
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setPriceOpen(true)}
                  disabled={archived}
                >
                  Change price
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setEditOpen(true)}
                  disabled={archived}
                >
                  Edit unit
                </Button>
              </div>
            )}
          </section>

          <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-7">
            <h2 className="text-[20px] font-semibold text-[#141412]">Owners</h2>

            {unit.owners.length === 0 ? (
              <p className="mt-3 text-[15px] text-[#8A857B]">
                Nobody owns this unit yet. Owners are linked from the Team
                screen.
              </p>
            ) : (
              <ul className="mt-4 space-y-4">
                {unit.owners.map((owner) => (
                  <li key={owner.id} className="flex items-center gap-3">
                    <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#EFEDE6] text-[13px] font-semibold text-[#4A463E]">
                      {initials(owner.fullName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-medium text-[#141412]">
                        {owner.fullName}
                      </span>
                      <span className="block truncate text-[13px] text-[#8A857B]">
                        {owner.email}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {isAdmin && (
            <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-7">
              {archived ? (
                <>
                  <p className="text-[15px] leading-relaxed text-[#6B665C]">
                    This unit is archived, so it's out of circulation and hidden
                    from listings.
                  </p>
                  <Button
                    variant="secondary"
                    className="mt-4 w-full"
                    onClick={onRestore}
                    disabled={restore.isPending}
                  >
                    {restore.isPending ? "Restoring…" : "Restore unit"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full border-[#E0BDB2] text-[#B4432B] hover:bg-[#FBF0ED]"
                  onClick={onArchive}
                  disabled={archive.isPending}
                >
                  {archive.isPending ? "Archiving…" : "Archive unit"}
                </Button>
              )}
            </section>
          )}
        </div>
      </div>

      {editOpen && (
        <UnitFormModal onClose={() => setEditOpen(false)} unit={unit} />
      )}

      {priceOpen && (
        <UnitPriceModal
          onClose={() => setPriceOpen(false)}
          unitId={unit.id}
          unitName={unit.unitName}
          pricePerNight={unit.pricePerNight}
          ownerRatePerNight={unit.ownerRatePerNight}
        />
      )}
    </div>
  );
};

export default UnitDetail;
