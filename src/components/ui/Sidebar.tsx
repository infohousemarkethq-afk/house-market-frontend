import { useEffect } from "react";
import { NavLink } from "react-router";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  Analytics01Icon,
  Cancel01Icon,
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
 *
 * Reports are gated to admin and owner — managers get a 403 from the backend
 * and showing them the link would only cause confusion.
 */
const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: DashboardSquare01Icon },
  { to: "/properties", label: "Properties", icon: Building03Icon, roles: ["admin"] },
  { to: "/units", label: "Units", icon: Home01Icon },
  { to: "/calendar", label: "Calendar", icon: Calendar03Icon },
  { to: "/documents", label: "Documents", icon: File01Icon },
  { to: "/team", label: "Team", icon: UserGroupIcon, roles: ["admin"] },
  { to: "/payments", label: "Payments", icon: CreditCardIcon, roles: ["admin", "owner"] },
  { to: "/reports", label: "Reports", icon: Analytics01Icon, roles: ["admin", "owner"] },
  { to: "/company", label: "Company", icon: Building06Icon, roles: ["admin"] },
];

interface SidebarProps {
  /** Drawer state. Ignored from lg up, where the sidebar is always in flow. */
  open: boolean;
  onClose: () => void;
}

/**
 * Static column from lg up, slide-over drawer below it.
 *
 * One component rather than two so the nav list can't drift between them —
 * a link added for desktop that a phone never gets is the classic way this
 * breaks.
 */
const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { viewRole } = useAuth();

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || (viewRole && item.roles.includes(viewRole)),
  );

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-[#141412]/45 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[280px] shrink-0 flex-col border-r border-[#E7E3DA] bg-[#FBFAF7] transition-transform duration-200",
          "lg:static lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 py-6 lg:px-8 lg:py-7">
          <p className="font-serif text-[26px] leading-none text-[#141412]">
            House Market
          </p>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="-mr-2 cursor-pointer p-2 text-[#8A857B] hover:text-[#141412] lg:hidden"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 pb-8">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  onClick={onClose}
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
    </>
  );
};

export default Sidebar;