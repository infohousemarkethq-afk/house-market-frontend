import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import { Image01Icon } from "@hugeicons/core-free-icons";

import Badge from "../../../components/ui/Badge";
import { cn } from "../../../utils/cn.util";
import { isArchived, typeLabel } from "../properties.utils";
import type { PropertySummary } from "../properties.types";

const PropertyCard = ({ property }: { property: PropertySummary }) => {
  const archived = isArchived(property);

  return (
    <Link
      to={`/properties/${property.id}`}
      className={cn(
        "group block overflow-hidden rounded-[16px] border border-[#E7E3DA] bg-white transition-colors hover:border-[#C9C2B4]",
        archived && "opacity-65",
      )}
    >
      <div className="relative flex h-[190px] items-center justify-center bg-[#EFEDE6]">
        {property.imageUrl ? (
          <img
            src={property.imageUrl}
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

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold text-[#141412]">
            {property.propertyName}
          </h3>
          <Badge>{typeLabel(property)}</Badge>
        </div>

        <p className="mt-2 text-[14px] text-[#6B665C]">
          {property.propertyAddress}, {property.propertyCity}
        </p>

        <p className="mt-5 border-t border-[#EDEAE2] pt-4 text-[14px] text-[#4A463E]">
          {property.activeUnitCount === 1
            ? "1 active unit"
            : `${property.activeUnitCount} active units`}
        </p>
      </div>
    </Link>
  );
};

export default PropertyCard;
