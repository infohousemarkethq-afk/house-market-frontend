import { Outlet } from "react-router";

import Navbar from "../ui/Navbar";
import Sidebar from "../ui/Sidebar";

/** The signed-in chrome. Sits inside ProtectedRoute, so a user is guaranteed. */
const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-[#F5F3EF] font-mono">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
