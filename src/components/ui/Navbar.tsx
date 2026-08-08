import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Logout01Icon,
  Menu01Icon,
  Search01Icon,
  UserAccountIcon,
} from "@hugeicons/core-free-icons";

import { useAuth } from "../../features/auth/hooks/useAuth";
import { initials } from "../../utils/initials.util";

const ROLE_LABELS = {
  admin: "Company admin",
  manager: "Manager",
  owner: "Owner",
} as const;

const Navbar = ({ onOpenNav }: { onOpenNav: () => void }) => {
  const { user, viewRole, signOut, isSigningOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  if (!user) return null;

  const subtitle = [
    viewRole ? ROLE_LABELS[viewRole] : null,
    user.company?.companyName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <header className="flex items-center gap-3 border-b border-[#E7E3DA] bg-white px-4 py-3 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
      {/* The sidebar is a drawer below lg, so this is the only way to reach it. */}
      <button
        type="button"
        onClick={onOpenNav}
        aria-label="Open navigation"
        className="flex h-[44px] w-[44px] shrink-0 cursor-pointer items-center justify-center rounded-[12px] text-[#2A2822] transition-colors hover:bg-[#F5F3EF] lg:hidden"
      >
        <HugeiconsIcon
          icon={Menu01Icon}
          size={22}
          color="currentColor"
          strokeWidth={1.8}
        />
      </button>

      <div className="relative hidden min-w-0 max-w-[620px] flex-1 sm:block">
        <span className="pointer-events-none absolute top-0 left-4 flex h-[48px] items-center text-[#9A9488]">
          <HugeiconsIcon
            icon={Search01Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.8}
          />
        </span>
        <input
          type="search"
          aria-label="Search"
          placeholder="Search properties, units, documents..."
          className="h-[48px] w-full rounded-[14px] border border-[#E7E3DA] bg-[#FBFAF7] pr-4 pl-11 text-[14px] text-[#141412] transition-colors placeholder:text-[#9A9488] focus:border-[#141412] focus:outline-none"
        />
      </div>

      <div ref={menuRef} className="relative ml-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="flex cursor-pointer items-center gap-3 rounded-[12px] p-1 pr-2 transition-colors hover:bg-[#F5F3EF]"
        >
          <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full bg-[#141412] text-[14px] font-semibold text-[#F5F3EF]">
            {initials(user.fullName)}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[14px] font-semibold text-[#141412]">
              {user.fullName}
            </span>
            <span className="block text-[13px] text-[#8A857B]">{subtitle}</span>
          </span>
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-0 z-20 mt-2 w-[200px] rounded-[12px] border border-[#E7E3DA] bg-white p-1 shadow-lg"
          >
            <Link
              to="/settings"
              role="menuitem"
              onClick={() => setMenuOpen(false)}
              className="flex w-full items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-[14px] text-[#4A463E] transition-colors hover:bg-[#F5F3EF]"
            >
              <HugeiconsIcon
                icon={UserAccountIcon}
                size={18}
                color="currentColor"
                strokeWidth={1.8}
              />
              Your account
            </Link>

            <button
              type="button"
              role="menuitem"
              onClick={signOut}
              disabled={isSigningOut}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[8px] px-3 py-2.5 text-left text-[14px] text-[#4A463E] transition-colors hover:bg-[#F5F3EF] disabled:opacity-55"
            >
              <HugeiconsIcon
                icon={Logout01Icon}
                size={18}
                color="currentColor"
                strokeWidth={1.8}
              />
              {isSigningOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
