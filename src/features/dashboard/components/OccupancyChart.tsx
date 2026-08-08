import type { UnitOccupancy } from "../dashboard.types";

interface OccupancyChartProps {
  units: UnitOccupancy[];
  month: string;
  bookedNights: number;
  availableNights: number;
}

const OccupancyChart = ({
  units,
  month,
  bookedNights,
  availableNights,
}: OccupancyChartProps) => (
  // min-w-0 is what lets the scroller below actually scroll: as a grid child
  // this section would otherwise size to its widest content and push the
  // whole page sideways.
  <section className="min-w-0 rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7">
    <div>
      <h2 className="text-[19px] font-semibold text-[#141412]">
        Occupancy by unit
      </h2>
      <p className="mt-1 text-[13px] text-[#8A857B]">
        {bookedNights} of {availableNights} available nights in {month}
      </p>
    </div>

    {units.length === 0 ? (
      <p className="mt-8 text-[15px] text-[#6B665C]">
        No active units to measure this month.
      </p>
    ) : (
      // No fixed min-width: the 72px track floor already decides when the bars
      // stop fitting, so a handful of units fills the card and only a long
      // portfolio scrolls.
      <div className="mt-8 overflow-x-auto">
        <div
          className="grid items-end gap-4"
          style={{
            gridTemplateColumns: `repeat(${units.length}, minmax(72px, 1fr))`,
            height: 220,
          }}
        >
          {units.map((unit) => (
            <div
              key={unit.unitId}
              className="flex h-full flex-col items-center justify-end gap-2.5"
            >
              <p className="font-label text-[11px] text-[#8A857B]">
                {unit.percent}%
              </p>

              {/* Floored so a unit with no stays still shows a baseline. */}
              <div
                className="w-full rounded-t-[6px] rounded-b-[3px] bg-[#CDD8CF]"
                style={{ height: Math.max(6, Math.round(unit.percent * 1.9)) }}
              />

              <p className="w-full truncate text-center text-[12px] text-[#8A857B]">
                {unit.unitName}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
);

export default OccupancyChart;
