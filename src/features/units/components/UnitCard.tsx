import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { cn } from "../../../utils/cn.util";
import { formatNaira } from "../../../utils/formatNaira.util";
import { AMENITY_LABEL } from "../units.types";
import {
  isUnitArchived,
  unitSpecLine,
  unitTypeLabel,
  visibleRate,
} from "../units.utils";
import type { UnitSummary } from "../units.types";

const AMENITIES_SHOWN = 4;

interface UnitCardProps {
  unit: UnitSummary;
  onSetPrice?: (unit: UnitSummary) => void;
}

const UnitCard = ({ unit, onSetPrice }: UnitCardProps) => {
  const archived = isUnitArchived(unit);
  const rate = visibleRate(unit);
  const shown = unit.amenities.slice(0, AMENITIES_SHOWN);
  const extra = unit.amenities.length - shown.length;

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[16px] border border-[#E7E3DA] bg-white transition-colors hover:border-[#C9C2B4]",
        archived && "opacity-65",
      )}
    >
      <Link to={`/units/${unit.id}`} className="block">
        <div className="relative flex h-[190px] items-center justify-center bg-[#EFEDE6]">
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
              size={28}
              color="#B4AE9F"
              strokeWidth={1.5}
            />
          )}

          {archived && (
            <Badge tone="warning" className="absolute top-3 left-3">
              Archived
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <Link
            to={`/units/${unit.id}`}
            className="text-[17px] font-semibold text-[#141412] hover:underline"
          >
            {unit.unitName}
          </Link>
          <Badge>{unitTypeLabel(unit)}</Badge>
        </div>

        <p className="mt-2 text-[14px] text-[#6B665C]">{unitSpecLine(unit)}</p>

        {shown.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {shown.map((amenity) => (
              <Badge key={amenity}>{AMENITY_LABEL[amenity]}</Badge>
            ))}
            {extra > 0 && <Badge tone="muted">+{extra}</Badge>}
          </div>
        )}

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#EDEAE2] pt-4">
          <div>
            {rate ? (
              <p className="text-[19px] font-semibold text-[#141412]">
                {formatNaira(rate.kobo)}
                <span className="text-[14px] font-normal text-[#8A857B]">
                  {" "}
                  / night
                </span>
              </p>
            ) : (
              <p className="text-[15px] text-[#8A857B]">No rate set</p>
            )}

            <p className="mt-1 text-[13px] text-[#8A857B]">
              {unit.property.propertyName} · {unit.property.propertyCity}
            </p>
          </div>

          {onSetPrice && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSetPrice(unit)}
            >
              {rate ? "Set price" : "Add price"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitCard;
