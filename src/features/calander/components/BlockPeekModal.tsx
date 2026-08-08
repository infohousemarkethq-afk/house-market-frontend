import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { formatCalendarRangeLong } from "../../../utils/formatTime.util";
import { nightsBetween } from "../calander.utils";
import type { CalendarBlockEntry } from "../calander.types";
import { useDeleteBlock } from "../hooks/useBookings";

interface BlockPeekModalProps {
  block: CalendarBlockEntry;
  unitLine: string;
  /** Only an admin may release dates, so managers and owners just read it. */
  canRelease: boolean;
  onClose: () => void;
}

const BlockPeekModal = ({
  block,
  unitLine,
  canRelease,
  onClose,
}: BlockPeekModalProps) => {
  const deleteBlock = useDeleteBlock();
  const nights = nightsBetween(block.startDate, block.endDate);

  const onRemove = async () => {
    try {
      await deleteBlock.mutateAsync(block.id);
      toast.success("Those dates are back on the calendar");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't remove this block."));
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!deleteBlock.isPending}
      title={block.reason ?? "Blocked"}
      description={unitLine}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={deleteBlock.isPending}
          >
            Close
          </Button>

          {canRelease && (
            <Button
              variant="secondary"
              onClick={onRemove}
              disabled={deleteBlock.isPending}
              className="border-[#E3C6BD] text-[#A8543C] hover:bg-[#F8EFEC]"
            >
              {deleteBlock.isPending ? "Removing…" : "Remove block"}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-[12px] text-[#8A857B]">Dates</p>
            <p className="mt-1 text-[15px] text-[#2A2822]">
              {formatCalendarRangeLong(block.startDate, block.endDate)}
            </p>
          </div>
          <div>
            <p className="text-[12px] text-[#8A857B]">Length</p>
            <p className="mt-1 text-[15px] text-[#2A2822]">
              {nights} {nights === 1 ? "night" : "nights"} held
            </p>
          </div>
        </div>

        <p className="text-[13px] leading-relaxed text-[#8A857B]">
          A block has no guest and no money attached. Removing it puts the dates
          straight back on the calendar.
        </p>
      </div>
    </Modal>
  );
};

export default BlockPeekModal;
