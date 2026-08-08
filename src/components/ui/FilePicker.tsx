import { useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon, File02Icon } from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";
import { DOCUMENT_MAX_BYTES, DOCUMENT_MIME_TYPES } from "./document.constants";

interface FilePickerProps {
  /** The chosen file, owned by the parent so it can upload on submit. */
  value: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
  error?: string;
}

function sizeLabel(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Drop zone for the document upload. Images have their own picker. */
const FilePicker = ({ value, onChange, disabled, error }: FilePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const onPick = (file: File | undefined) => {
    if (!file) return;

    if (!DOCUMENT_MIME_TYPES.includes(file.type)) {
      setLocalError("That file type isn't supported. Use PDF, DOCX, JPEG or PNG.");
      onChange(null);
      return;
    }

    if (file.size > DOCUMENT_MAX_BYTES) {
      setLocalError(`That file is ${sizeLabel(file.size)}. The limit is 20MB.`);
      onChange(null);
      return;
    }

    setLocalError(null);
    onChange(file);
  };

  const shownError = localError ?? error;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={DOCUMENT_MIME_TYPES.join(",")}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          onPick(event.target.files?.[0]);
          // Let the same file be re-picked after an error.
          event.target.value = "";
        }}
      />

      {value ? (
        <div className="flex items-center gap-3 rounded-[10px] border border-[#E7E3DA] px-4 py-3">
          <HugeiconsIcon
            icon={File02Icon}
            size={20}
            color="#8A857B"
            strokeWidth={1.8}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] font-medium text-[#2A2822]">
              {value.name}
            </p>
            <p className="text-[13px] text-[#8A857B]">{sizeLabel(value.size)}</p>
          </div>

          <button
            type="button"
            disabled={disabled}
            onClick={() => onChange(null)}
            aria-label="Remove file"
            className="cursor-pointer p-1 text-[#8A857B] hover:text-[#B4432B] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={18}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            onPick(event.dataTransfer.files?.[0]);
          }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-[12px] border border-dashed px-6 py-8 transition-colors disabled:cursor-not-allowed disabled:opacity-55",
            dragging
              ? "border-[#141412] bg-[#F3F1EA]"
              : "border-[#DCD6CB] bg-[#FBFAF7] hover:border-[#B8B1A4]",
          )}
        >
          <span className="text-[15px] font-medium text-[#2A2822]">
            Drop a file here
          </span>
          <span className="text-[13px] text-[#8A857B]">
            PDF, DOCX, JPEG or PNG · up to 20MB
          </span>
        </button>
      )}

      {shownError && (
        <p className="mt-2 text-[13px] text-[#B4432B]">{shownError}</p>
      )}
    </div>
  );
};

export default FilePicker;
