import Badge from "../../../components/ui/Badge";
import { Skeleton } from "../../../components/ui/SkeletonLoader";
import { formatNaira } from "../../../utils/formatNaira.util";
import { cn } from "../../../utils/cn.util";
import type { PaymentTotals as Totals } from "../payment.types";

interface PaymentTotalsProps {
  totals: Totals | undefined;
  isPending: boolean;
  /** Owners only ever see money out, so in/out/net collapses to one figure. */
  showBothDirections: boolean;
  rangeLabel: string;
}

const Tile = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "in" | "out";
}) => (
  <div className="rounded-[16px] border border-[#E7E3DA] bg-white px-6 py-5">
    <p className="font-label text-[11px] tracking-[0.16em] text-[#8A857B] uppercase">
      {label}
    </p>
    <p
      className={cn(
        "mt-2 font-serif text-[26px] tabular-nums text-[#141412]",
        tone === "out" && "text-[#8A4A3B]",
        tone === "in" && "text-[#2F6B4E]",
      )}
    >
      {value}
    </p>
  </div>
);

const PaymentTotals = ({
  totals,
  isPending,
  showBothDirections,
  rangeLabel,
}: PaymentTotalsProps) => {
  if (isPending) {
    return (
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[104px] rounded-[16px]" />
        ))}
      </div>
    );
  }

  if (!totals) return null;

  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <Badge tone="muted">{rangeLabel}</Badge>
      </div>

      {showBothDirections ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Tile label="Money in" value={formatNaira(totals.inflow)} tone="in" />
          <Tile
            label="Money out"
            value={formatNaira(totals.outflow)}
            tone="out"
          />
          {/* Net can legitimately be negative — a month of payouts against no
              new bookings. formatNaira handles the minus itself. */}
          <Tile label="Net" value={formatNaira(totals.net)} />
        </div>
      ) : (
        <div className="grid gap-4 sm:max-w-[320px]">
          <Tile label="Paid to you" value={formatNaira(totals.outflow)} />
        </div>
      )}
    </div>
  );
};

export default PaymentTotals;
