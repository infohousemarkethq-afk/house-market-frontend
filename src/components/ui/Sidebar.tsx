import { NavLink } from "react-router";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  Building03Icon,
  Building06Icon,
  Calendar03Icon,
  CreditCardIcon,
  DashboardSquare01Icon,
  File01Icon,
  Home01Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";
import { useAuth } from "../../features/auth/hooks/useAuth";
import type { ViewRole } from "../../features/auth/auth.types";

interface NavItem {
  to: string;
  label: string;
  icon: IconSvgElement;
  /** Omitted means every signed-in role sees it. */
  roles?: ViewRole[];
}

/**
 * Properties and Company are admin-only because the API is: every route in
 * the backend's property.routes.ts sits behind requireRole("COMPANY_ADMIN"),
 * so showing the link to a manager would only lead to a 403.
 */
const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { to: "/properties", label: "Properties", icon: Building03Icon, roles: ["admin"] },
  { to: "/units", label: "Units", icon: Home01Icon },
  { to: "/calendar", label: "Calendar", icon: Calendar03Icon },
  { to: "/documents", label: "Documents", icon: File01Icon },
  { to: "/team", label: "Team", icon: UserGroupIcon, roles: ["admin"] },
  { to: "/payments", label: "Payments", icon: CreditCardIcon },
  { to: "/reports", label: "Reports", icon: Analytics01Icon },
  { to: "/company", label: "Company", icon: Building06Icon, roles: ["admin"] },
];

const Sidebar = () => {
  const { viewRole } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (viewRole && item.roles.includes(viewRole)),
  );

  return (
    <aside className="hidden w-[280px] shrink-0 flex-col border-r border-[#E7E3DA] bg-[#FBFAF7] lg:flex">
      <div className="px-8 py-7">
        <p className="font-serif text-[26px] leading-none text-[#141412]">
          House Market
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-8">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-[12px] px-4 py-3 text-[15px] transition-colors",
                    isActive
                      ? "bg-[#141412] font-semibold text-[#F5F3EF]"
                      : "text-[#4A463E] hover:bg-[#EFEDE6]",
                  )
                }
              >
                <HugeiconsIcon
                  icon={item.icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.8}
                />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
