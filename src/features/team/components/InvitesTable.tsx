import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { formatApiDate } from "../../../utils/formatTime.util";
import type { UnitSummary } from "../../units/units.types";
import {
  INVITE_ROLE_LABEL,
  INVITE_STATUS_LABEL,
  type Invitation,
} from "../team.types";

const COLUMNS = "grid grid-cols-[2fr_1.6fr_1fr_1.2fr_120px] gap-4 px-6";

interface InvitesTableProps {
  invites: Invitation[];
  units: UnitSummary[];
  onRevoke: (invite: Invitation) => void;
  revokingId: string | null;
}

/** The API stores unit ids on an invite, so names are resolved here. */
function unitLine(invite: Invitation, units: UnitSummary[]): string {
  const names = invite.unitIds
    .map((id) => units.find((unit) => unit.id === id)?.unitName)
    .filter(Boolean);

  if (names.length === 0) {
    return `${invite.unitIds.length} ${invite.unitIds.length === 1 ? "unit" : "units"}`;
  }
  return names.join(", ");
}

function statusMeta(invite: Invitation): string {
  if (invite.status === "PENDING") {
    return `expires ${formatApiDate(invite.expiresAt)}`;
  }
  if (invite.status === "ACCEPTED" && invite.acceptedAt) {
    return formatApiDate(invite.acceptedAt);
  }
  return formatApiDate(invite.createdAt);
}

const InvitesTable = ({
  invites,
  units,
  onRevoke,
  revokingId,
}: InvitesTableProps) => (
  <div className="overflow-x-auto rounded-[16px] border border-[#E7E3DA] bg-white">
    <div className="min-w-[820px]">
      <div
        className={`${COLUMNS} font-label border-b border-[#EDEAE2] bg-[#FBFAF7] py-3.5 text-[12px] tracking-[0.05em] text-[#8A857B] uppercase`}
      >
        <div>Invitee</div>
        <div>Email</div>
        <div>Role</div>
        <div>Status</div>
        <div />
      </div>

      {invites.map((invite) => (
        <div
          key={invite.id}
          className={`${COLUMNS} items-center border-b border-[#F2F0EA] py-4 last:border-b-0`}
        >
          <div className="min-w-0">
            <p className="truncate text-[15px] font-medium text-[#141412]">
              {invite.fullName}
            </p>
            <p className="truncate text-[12px] text-[#A29C90]">
              {unitLine(invite, units)}
            </p>
          </div>

          <div className="truncate text-[14px] text-[#6B665C]">
            {invite.email}
          </div>

          <div>
            <Badge tone="muted">{INVITE_ROLE_LABEL[invite.role]}</Badge>
          </div>

          <div>
            <Badge tone={invite.status === "PENDING" ? "warning" : "muted"}>
              {INVITE_STATUS_LABEL[invite.status]}
            </Badge>
            <p className="mt-1 text-[12px] text-[#A29C90]">
              {statusMeta(invite)}
            </p>
          </div>

          <div className="text-right">
            {/* Only a pending invite can be revoked — the API 409s otherwise. */}
            {invite.status === "PENDING" && (
              <Button
                size="sm"
                variant="secondary"
                disabled={revokingId === invite.id}
                onClick={() => onRevoke(invite)}
                className="border-[#E3C6BD] text-[#A8543C] hover:bg-[#F8EFEC]"
              >
                {revokingId === invite.id ? "Revoking…" : "Revoke"}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default InvitesTable;
