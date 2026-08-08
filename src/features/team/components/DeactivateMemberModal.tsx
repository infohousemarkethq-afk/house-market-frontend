import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { Member } from "../team.types";
import { useDeactivateMember } from "../hooks/useTeam";

interface DeactivateMemberModalProps {
  member: Member;
  onClose: () => void;
}

const DeactivateMemberModal = ({
  member,
  onClose,
}: DeactivateMemberModalProps) => {
  const deactivate = useDeactivateMember();
  const firstName = member.fullName.split(" ")[0];

  const onConfirm = async () => {
    try {
      await deactivate.mutateAsync(member.id);
      toast.success(`${firstName} has been deactivated`);
      onClose();
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "We couldn't deactivate this member."),
      );
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!deactivate.isPending}
      size="sm"
      title={`Deactivate ${member.fullName}?`}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deactivate.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={deactivate.isPending}
            className="bg-[#A8543C] hover:bg-[#8F4632]"
          >
            {deactivate.isPending ? "Deactivating…" : "Deactivate"}
          </Button>
        </div>
      }
    >
      <p className="text-[15px] leading-relaxed text-[#4A463E]">
        {firstName} will be signed out immediately and will lose access to their{" "}
        {member._count.assignments}{" "}
        {member._count.assignments === 1 ? "assigned unit" : "assigned units"}.
        Their history stays on the record, and their unit assignments are kept
        so nothing is lost.
      </p>
    </Modal>
  );
};

export default DeactivateMemberModal;
