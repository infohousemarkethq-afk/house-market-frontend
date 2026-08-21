import Badge from "../../../components/ui/Badge";
import { formatApiDate } from "../../../utils/formatTime.util";
import { formatNaira } from "../../../utils/formatNaira.util";
import { cn } from "../../../utils/cn.util";
import { PAYMENT_TYPE_LABEL, type PaymentSummaryRow } from "../payment.types";
import { paymentUnitLine } from "../payments.utils";

const COLUMNS = "grid grid-cols-[1fr_1.7fr_1.3fr_1.1fr_1fr] gap-4 px-6";

interface PaymentsTableProps {
  payments: PaymentSummaryRow[];
  /** Owners see one side of the ledger, so the +/- prefix is just noise. */
  showSign: boolean;
}

const PaymentsTable = ({ payments, showSign }: PaymentsTableProps) => (
  <div className="overflow-x-auto rounded-[16px] border border-[#E7E3DA] bg-white">
    <div className="min-w-[820px]">
      <div
        className={`${COLUMNS} font-label border-b border-[#EDEAE2] bg-[#FBFAF7] py-3.5 text-[12px] tracking-[0.05em] text-[#8A857B] uppercase`}
      >
        <div>Paid</div>
        <div>Description</div>
        <div>Unit</div>
        <div>Type</div>
        <div className="text-right">Amount</div>
      </div>

      {payments.map((payment) => {
        const isOut = payment.direction === "OUTFLOW";

        return (
          <div
            key={payment.id}
            className={`${COLUMNS} items-center border-b border-[#F2F0EA] py-4 last:border-b-0`}
          >
            <div className="text-[14px] text-[#6B665C]">
              {formatApiDate(payment.paidAt)}
            </div>

            <div className="min-w-0">
              <p className="truncate text-[15px] font-medium text-[#141412]">
                {payment.description}
              </p>
              {payment.reference && (
                <p className="mt-0.5 truncate text-[13px] text-[#8A857B]">
                  {payment.reference}
                </p>
              )}
            </div>

            <div className="truncate text-[14px] text-[#6B665C]">
              {paymentUnitLine(payment)}
            </div>

            <div>
              <Badge>{PAYMENT_TYPE_LABEL[payment.type]}</Badge>
            </div>

            <div
              className={cn(
                "text-right text-[15px] font-medium tabular-nums",
                showSign && isOut ? "text-[#8A4A3B]" : "text-[#141412]",
              )}
            >
              {/* The API keeps every amount positive and carries the sign in
                  `direction`, so the prefix is presentation, not data. */}
              {showSign && (isOut ? "−" : "+")}
              {formatNaira(payment.amount)}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default PaymentsTable;
