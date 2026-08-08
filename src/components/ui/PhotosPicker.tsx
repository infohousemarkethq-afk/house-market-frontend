import { useEffect, useMemo, useRef, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";
import {
  PHOTO_MAX_BYTES,
  PHOTO_MIME_TYPES,
} from "../../features/maintenance/maintenance.types";

interface PhotosPickerProps {
  value: File[];
  onChange: (files: File[]) => void;
  max: number;
  disabled?: boolean;
}

/** Multi-image picker for damage and maintenance photos. */
const PhotosPicker = ({
  value,
  onChange,
  max,
  disabled,
}: PhotosPickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const previews = useMemo(
    () => value.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [value],
  );

  // Object URLs pin the file in memory until they're revoked.
  useEffect(
    () => () => previews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [previews],
  );

  const onPick = (picked: FileList | null) => {
    if (!picked) return;

    const incoming = Array.from(picked);

    if (incoming.some((file) => !PHOTO_MIME_TYPES.includes(file.type))) {
      setError("Only JPEG, PNG and WebP images can be attached.");
      return;
    }

    if (incoming.some((file) => file.size > PHOTO_MAX_BYTES)) {
      setError("Each photo has to be under 5MB.");
      return;
    }

    if (value.length + incoming.length > max) {
      setError(`Up to ${max} photos.`);
      return;
    }

    setError(null);
    onChange([...value, ...incoming]);
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={PHOTO_MIME_TYPES.join(",")}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => {
          onPick(event.target.files);
          // Let the same file be re-picked after an error.
          event.target.value = "";
        }}
      />

      <div className="grid grid-cols-3 gap-2.5">
        {previews.map((preview, index) => (
          <div
            key={preview.url}
            className="relative aspect-square overflow-hidden rounded-[10px] bg-[#EDEAE2]"
          >
            <img
              src={preview.url}
              alt=""
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              disabled={disabled}
              aria-label={`Remove photo ${index + 1}`}
              onClick={() =>
                onChange(value.filter((_, position) => position !== index))
              }
              className="absolute top-1.5 right-1.5 flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-[7px] bg-[#141412]/62 text-white hover:bg-[#A8543C]"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                size={13}
                color="currentColor"
                strokeWidth={2}
              />
            </button>
          </div>
        ))}

        {value.length < max && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex aspect-square cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#DCD6CB] bg-[#FBFAF7] text-[13px] text-[#8A857B] transition-colors hover:border-[#B8B1A4] hover:text-[#141412] disabled:cursor-not-allowed disabled:opacity-55",
            )}
          >
            + Add
          </button>
        )}
      </div>

      {error ? (
        <p className="mt-2 text-[13px] text-[#B4432B]">{error}</p>
      ) : (
        <p className="mt-2 text-[13px] text-[#8A857B]">
          Up to {max} photos · JPEG, PNG or WebP, 5MB each.
        </p>
      )}
    </div>
  );
};

export default PhotosPicker;
