import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import type { UnitSummary } from "../../units/units.types";

interface ArchiveBlockedDialogProps {
  onClose: () => void;
  propertyName: string;
  units: UnitSummary[];
}

/**
 * Shown when the API refuses to archive a building that still has live units.
 *
 * The 409 body says only "This property still has active units" — no list. The
 * names come from the units this screen has already loaded, which is the
 * difference between a dead end and a to-do list.
 */
const ArchiveBlockedDialog = ({
  onClose,
  propertyName,
  units,
}: ArchiveBlockedDialogProps) => (
  <Modal
    onClose={onClose}
    size="sm"
    title={`Can't archive ${propertyName} yet`}
    footer={
      <div className="flex justify-end">
        <Button onClick={onClose} className="px-8">
          Understood
        </Button>
      </div>
    }
  >
    <p className="text-[15px] leading-relaxed text-[#4A463E]">
      This property still has {units.length}{" "}
      {units.length === 1 ? "active unit" : "active units"}. Archive or move
      {units.length === 1 ? " it" : " them"} first — archiving the building
      would leave {units.length === 1 ? "it" : "them"} without a parent.
    </p>

    {units.length > 0 && (
      <ul className="mt-5 divide-y divide-[#EDEAE2] rounded-[10px] border border-[#E7E3DA]">
        {units.map((unit) => (
          <li
            key={unit.id}
            className="flex items-center justify-between gap-4 px-4 py-3"
          >
            <span className="text-[15px] text-[#141412]">{unit.unitName}</span>
            <span className="text-[13px] text-[#8A857B]">active</span>
          </li>
        ))}
      </ul>
    )}
  </Modal>
);

export default ArchiveBlockedDialog;
