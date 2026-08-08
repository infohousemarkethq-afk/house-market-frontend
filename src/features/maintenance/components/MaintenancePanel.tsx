import { useNavigate } from "react-router";

import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import { Skeleton } from "../../../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { formatNaira } from "../../../utils/formatNaira.util";
import { formatApiDate } from "../../../utils/formatTime.util";
import { useUnitMaintenance } from "../hooks/useMaintenance";
import {
  MAINTENANCE_STATUS_LABEL,
  MAINTENANCE_TYPE_LABEL,
  type MaintenanceStatus,
} from "../maintenance.types";

const STATUS_TONE: Record<MaintenanceStatus, "neutral" | "muted" | "warning"> = {
  COMPLETED: "neutral",
  IN_PROGRESS: "warning",
  PENDING: "muted",
};

interface MaintenancePanelProps {
  unitId: string;
  /** Staff only — owners read the work but never log it. */
  canWrite: boolean;
}

const MaintenancePanel = ({ unitId, canWrite }: MaintenancePanelProps) => {
  const navigate = useNavigate();
  const { data, isPending, isError, error } = useUnitMaintenance(unitId);
  const records = data?.items ?? [];

  return (
    <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[20px] font-semibold text-[#141412]">Maintenance</h2>

        {canWrite && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/units/${unitId}/damage`)}
            >
              Report damage
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate(`/units/${unitId}/maintenance/new`)}
            >
              Log work
            </Button>
          </div>
        )}
      </div>

      <div className="mt-5">
        {isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-[18px] w-2/3" />
            <Skeleton className="h-[18px] w-1/2" />
          </div>
        ) : isError ? (
          <Callout tone="warning" title="We couldn't load the maintenance log">
            {getApiErrorMessage(error)}
          </Callout>
        ) : records.length === 0 ? (
          <p className="text-[15px] leading-relaxed text-[#6B665C]">
            No work logged on this unit yet.
          </p>
        ) : (
          <ul>
            {records.map((record) => (
              <li
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-4 border-t border-[#F0EEE8] py-3.5 first:border-t-0 first:pt-0"
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-medium text-[#141412]">
                    {record.title}
                  </p>
                  <p className="text-[12px] text-[#A29C90]">
                    {MAINTENANCE_TYPE_LABEL[record.type]}
                    {record.performedAt
                      ? ` · ${formatApiDate(record.performedAt)}`
                      : ""}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {/* Absent for owners, who never see what work cost. */}
                  {record.cost != null && (
                    <span className="text-[14px] text-[#6B665C]">
                      {formatNaira(record.cost)}
                    </span>
                  )}

                  <Badge tone={STATUS_TONE[record.status]}>
                    {MAINTENANCE_STATUS_LABEL[record.status]}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default MaintenancePanel;
