import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import { cn } from "../../../utils/cn.util";
import { initials } from "../../../utils/initials.util";
import { MEMBER_ROLE_LABEL, type Member } from "../team.types";

const COLUMNS = "grid grid-cols-[2fr_1.6fr_1fr_1fr_190px] gap-4 px-6";

interface MembersTableProps {
  members: Member[];
  /** The signed-in admin, who can't deactivate themselves. */
  currentUserId: string | undefined;
  onDeactivate: (member: Member) => void;
  onManageUnits: (member: Member) => void;
}

const MembersTable = ({
  members,
  currentUserId,
  onDeactivate,
  onManageUnits,
}: MembersTableProps) => (
  <div className="overflow-x-auto rounded-[16px] border border-[#E7E3DA] bg-white">
    <div className="min-w-[820px]">
      <div
        className={`${COLUMNS} font-label border-b border-[#EDEAE2] bg-[#FBFAF7] py-3.5 text-[12px] tracking-[0.05em] text-[#8A857B] uppercase`}
      >
        <div>Name</div>
        <div>Email</div>
        <div>Role</div>
        <div>Units</div>
        <div />
      </div>

      {members.map((member) => {
        const isDeactivated = Boolean(member.deactivatedAt);
        const isSelf = member.id === currentUserId;

        return (
          <div
            key={member.id}
            className={cn(
              `${COLUMNS} items-center border-b border-[#F2F0EA] py-4 last:border-b-0`,
              isDeactivated && "opacity-55",
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#EDEAE2] text-[12px] font-semibold text-[#5C584F]">
                {initials(member.fullName)}
              </span>

              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-[15px] font-medium text-[#141412]">
                  {member.fullName}
                </span>
                {isDeactivated && <Badge tone="muted">Deactivated</Badge>}
              </div>
            </div>

            <div className="truncate text-[14px] text-[#6B665C]">
              {member.email}
            </div>

            <div>
              <Badge
                tone={member.role === "COMPANY_ADMIN" ? "neutral" : "muted"}
              >
                {MEMBER_ROLE_LABEL[member.role]}
              </Badge>
            </div>

            <div className="text-[14px] text-[#6B665C]">
              {member.role === "COMPANY_ADMIN"
                ? "—"
                : `${member._count.assignments} assigned`}
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              {/* Assignments only mean something for managers — an admin
                  already reaches every unit, and the API 400s on the attempt. */}
              {!isDeactivated && member.role === "MANAGER" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onManageUnits(member)}
                >
                  Units
                </Button>
              )}

              {/* No restore action: the API has no endpoint to undo this yet.
                  Deactivating yourself is refused server-side, so it isn't
                  offered either. */}
              {!isDeactivated && !isSelf && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onDeactivate(member)}
                  className="border-[#E3C6BD] text-[#A8543C] hover:bg-[#F8EFEC]"
                >
                  Deactivate
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default MembersTable;
