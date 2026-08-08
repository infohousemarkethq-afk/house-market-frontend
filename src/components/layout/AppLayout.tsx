import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router";

import Navbar from "../ui/Navbar";
import Sidebar from "../ui/Sidebar";

/** The signed-in chrome. Sits inside ProtectedRoute, so a user is guaranteed. */
const AppLayout = () => {
  const [navOpen, setNavOpen] = useState(false);
  const { pathname } = useLocation();
  const [navPath, setNavPath] = useState(pathname);

  // Navigating is the end of the drawer's job. Closing on the link click alone
  // would miss redirects, which land here just the same. Adjusted during
  // render rather than in an effect, so it never paints an open drawer over
  // the page you've already moved to.
  if (pathname !== navPath) {
    setNavPath(pathname);
    setNavOpen(false);
  }

  // The drawer scrolls on its own; the page behind it shouldn't.
  useEffect(() => {
    if (!navOpen) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [navOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F3EF] font-mono">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenNav={() => setNavOpen(true)} />

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
