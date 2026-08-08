import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Callout from "../../../components/ui/Callout";
import Modal from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/SkeletonLoader";
import { cn } from "../../../utils/cn.util";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { UnitSummary } from "../../units/units.types";
import type { Member } from "../team.types";
import { useMemberUnits, useSetMemberUnits } from "../hooks/useTeam";

interface ManageUnitsModalProps {
  member: Member;
  units: UnitSummary[];
  onClose: () => void;
}

/**
 * The whole assignment set, ticked and unticked in one go — which is what
 * PUT /company/members/:userId/units takes.
 */
const ManageUnitsModal = ({
  member,
  units,
  onClose,
}: ManageUnitsModalProps) => {
  const assigned = useMemberUnits(member.id);
  const setUnits = useSetMemberUnits();

  // Null until the current set lands, so an early render can't submit an
  // empty selection and unassign everything.
  const [picked, setPicked] = useState<string[] | null>(null);

  const current = assigned.data?.map((unit) => unit.id) ?? [];
  const selection = picked ?? current;

  const onSave = async () => {
    try {
      await setUnits.mutateAsync({ userId: member.id, unitIds: selection });
      toast.success(`${member.fullName.split(" ")[0]}'s units updated`);
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't update those assignments."),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!setUnits.isPending}
      title="Assigned units"
      description={`Which units ${member.fullName} operates day to day.`}
      footer={
        <div className="flex items-center justify-between gap-4">
          <p className="text-[13px] text-[#8A857B]">
            {selection.length} selected
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={setUnits.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={onSave}
              disabled={assigned.isPending || setUnits.isPending}
            >
              {setUnits.isPending ? "Saving…" : "Save assignments"}
            </Button>
          </div>
        </div>
      }
    >
      {assigned.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-[52px] rounded-[10px]" />
          <Skeleton className="h-[52px] rounded-[10px]" />
          <Skeleton className="h-[52px] rounded-[10px]" />
        </div>
      ) : assigned.isError ? (
        <Callout tone="warning" title="We couldn't load their current units">
          {getApiErrorMessage(assigned.error)}
        </Callout>
      ) : (
        <>
          <div className="max-h-[300px] overflow-y-auto rounded-[10px] border border-[#EDEAE2]">
            {units.map((unit) => {
              const selected = selection.includes(unit.id);

              return (
                <button
                  key={unit.id}
                  type="button"
                  role="checkbox"
                  aria-checked={selected}
                  disabled={setUnits.isPending}
                  onClick={() =>
                    setPicked(
                      selected
                        ? selection.filter((id) => id !== unit.id)
                        : [...selection, unit.id],
                    )
                  }
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-3 border-b border-[#F4F2EC] px-4 py-3 text-left transition-colors last:border-b-0 disabled:cursor-not-allowed",
                    selected ? "bg-[#FBFAF7]" : "bg-white",
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 rounded-[5px] border",
                      selected
                        ? "border-[#141412] bg-[#141412]"
                        : "border-[#D5D0C5] bg-white",
                    )}
                  />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-medium text-[#2A2822]">
                      {unit.unitName}
                    </span>
                    <span className="block truncate text-[12px] text-[#A29C90]">
                      {unit.property.propertyName}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-[#8A857B]">
            Unticking a unit removes their access to its bookings, documents
            and maintenance on their next request. Records they already filed
            stay where they are.
          </p>
        </>
      )}
    </Modal>
  );
};

export default ManageUnitsModal;
