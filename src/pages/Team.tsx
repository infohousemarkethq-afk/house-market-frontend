import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import EmptyState from "../components/ui/EmptyState";
import { Skeleton } from "../components/ui/SkeletonLoader";
import Tabs from "../components/ui/Tabs";
import { getApiErrorMessage } from "../utils/apiError.util";
import { useAuth } from "../features/auth/hooks/useAuth";
import DeactivateMemberModal from "../features/team/components/DeactivateMemberModal";
import InviteModal from "../features/team/components/InviteModal";
import InvitesTable from "../features/team/components/InvitesTable";
import MembersTable from "../features/team/components/MembersTable";
import {
  useInvites,
  useMembers,
  useRevokeInvite,
} from "../features/team/hooks/useTeam";
import type { Member } from "../features/team/team.types";
import { useUnits } from "../features/units/hooks/useUnits";
import { DEFAULT_UNIT_FILTERS } from "../features/units/units.types";

const Team = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<"members" | "invites">("members");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [pendingDeactivation, setPendingDeactivation] = useState<Member | null>(
    null,
  );

  const members = useMembers();
  const invites = useInvites();
  const revokeInvite = useRevokeInvite();
  const { data: unitData } = useUnits(DEFAULT_UNIT_FILTERS);

  const units = unitData?.items ?? [];
  const activeMembers = (members.data ?? []).filter(
    (member) => !member.deactivatedAt,
  );
  const pendingInvites = (invites.data ?? []).filter(
    (invite) => invite.status === "PENDING",
  );

  const onRevoke = async (inviteId: string, email: string) => {
    try {
      await revokeInvite.mutateAsync(inviteId);
      toast.success(`Invitation to ${email} revoked`);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't revoke this invitation."),
      );
    }
  };

  const active = tab === "members" ? members : invites;

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-[42px] leading-tight text-[#141412]">
            Team
          </h1>
          <p className="mt-1 text-[15px] text-[#6B665C]">
            {tab === "members"
              ? "Admins and managers. Owners are not company staff and never appear here."
              : "Sent invitations and what became of them. Pending ones expire after seven days."}
          </p>
        </div>

        <Button onClick={() => setInviteOpen(true)}>Invite someone</Button>
      </div>

      <Tabs
        label="Team views"
        value={tab}
        onChange={setTab}
        options={[
          { value: "members", label: "Team", count: activeMembers.length },
          {
            value: "invites",
            label: "Invitations",
            count: pendingInvites.length,
          },
        ]}
      />

      <div className="mt-6">
        {active.isPending ? (
          <Skeleton className="h-[300px] rounded-[16px]" />
        ) : active.isError ? (
          <Callout
            tone="warning"
            title={
              tab === "members"
                ? "We couldn't load your team"
                : "We couldn't load your invitations"
            }
          >
            {getApiErrorMessage(active.error)}
          </Callout>
        ) : tab === "members" ? (
          <MembersTable
            members={members.data ?? []}
            currentUserId={user?.id}
            onDeactivate={setPendingDeactivation}
          />
        ) : (invites.data ?? []).length === 0 ? (
          <EmptyState
            title="No invitations yet"
            description="Invite a manager to operate your units, or an owner to see their payouts."
            action={
              <Button onClick={() => setInviteOpen(true)}>
                Invite someone
              </Button>
            }
          />
        ) : (
          <InvitesTable
            invites={invites.data ?? []}
            units={units}
            revokingId={
              revokeInvite.isPending ? (revokeInvite.variables ?? null) : null
            }
            onRevoke={(invite) => onRevoke(invite.id, invite.email)}
          />
        )}
      </div>

      {inviteOpen && (
        <InviteModal units={units} onClose={() => setInviteOpen(false)} />
      )}

      {pendingDeactivation && (
        <DeactivateMemberModal
          member={pendingDeactivation}
          onClose={() => setPendingDeactivation(null)}
        />
      )}
    </div>
  );
};

export default Team;
