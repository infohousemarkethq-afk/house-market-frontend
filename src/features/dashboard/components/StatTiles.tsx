import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Building01Icon,
  Calendar03Icon,
  CreditCardIcon,
  File02Icon,
  Home01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { formatNaira } from "../../../utils/formatNaira.util";
import type { DashboardCards } from "../dashboard.types";

interface Tile {
  label: string;
  value: string;
  caption: string;
  icon: IconSvgElement;
}

/** Team and revenue are omitted for roles the server doesn't send them to. */
function tilesFrom(cards: DashboardCards): Tile[] {
  const tiles: Tile[] = [
    {
      label: "Properties",
      value: String(cards.properties.total),
      caption: `${cards.properties.unitCount} ${cards.properties.unitCount === 1 ? "unit" : "units"}`,
      icon: Building01Icon,
    },
    {
      label: "Active units",
      value: String(cards.units.active),
      caption: `of ${cards.units.total}`,
      icon: Home01Icon,
    },
    {
      label: "Documents",
      value: String(cards.documents.total),
      caption: `${cards.documents.sensitive} sensitive`,
      icon: File02Icon,
    },
    {
      label: "Occupancy",
      value: `${cards.occupancy.percent}%`,
      caption: `${cards.occupancy.bookedNights} of ${cards.occupancy.availableNights} nights`,
      icon: Calendar03Icon,
    },
  ];

  if (cards.revenue) {
    tiles.push({
      label: "Revenue",
      value: formatNaira(cards.revenue.amount),
      caption: cards.revenue.month,
      icon: CreditCardIcon,
    });
  }

  if (cards.team) {
    tiles.push({
      label: "Team",
      value: String(cards.team.members),
      caption: `${cards.team.pendingInvites} ${cards.team.pendingInvites === 1 ? "invite" : "invites"} pending`,
      icon: UserGroupIcon,
    });
  }

  return tiles;
}

const StatTiles = ({ cards }: { cards: DashboardCards }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {tilesFrom(cards).map((tile) => (
      <div
        key={tile.label}
        className="rounded-[16px] border border-[#E7E3DA] bg-white p-6"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#F4F2EC] text-[#5C584F]">
            <HugeiconsIcon
              icon={tile.icon}
              size={17}
              color="currentColor"
              strokeWidth={1.6}
            />
          </span>
          <p className="text-[15px] font-medium text-[#4A463E]">{tile.label}</p>
        </div>

        <div className="mt-6 flex items-baseline gap-2.5">
          <p className="text-[38px] leading-none font-semibold tracking-[-0.02em] text-[#141412]">
            {tile.value}
          </p>
          <p className="text-[13px] text-[#8A857B]">{tile.caption}</p>
        </div>
      </div>
    ))}
  </div>
);

export default StatTiles;
