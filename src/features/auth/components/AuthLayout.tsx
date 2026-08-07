import type { ReactNode } from "react";

import HouseMark from "../../../components/ui/HouseMark";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid min-h-screen font-mono lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-[#141412] p-14 lg:flex">
        <p className="font-serif text-[30px] leading-none text-[#F5F3EF]">
          House Market
        </p>

        <div className="py-10">
          <HouseMark className="mb-14 h-auto w-[330px] max-w-full" />

          <h1 className="font-serif text-[64px] leading-[1.05] text-[#F5F3EF]">
            Run your short-lets
            <br />
            from one place.
          </h1>

          <p className="mt-8 max-w-[430px] text-[17px] leading-[1.65] text-[#A29B8E]">
            Buildings, flats, the staff who operate them and the owners who own
            them. Bookings, documents and payment history in a single record.
          </p>
        </div>

        <p className="font-label text-[11px] tracking-[0.18em] text-[#6F695D] uppercase">
          Multi-tenant<span className="ml-8">Lagos · Abuja</span>
        </p>
      </aside>

      <main className="flex items-center justify-center bg-[#F5F3EF] px-6 py-14">
        <div className="w-full max-w-[420px]">
          <p className="mb-10 font-serif text-[26px] leading-none text-[#141412] lg:hidden">
            House Market
          </p>
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
