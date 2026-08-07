import { useEffect, useMemo, useRef, useState } from "react";

import Button from "./Button";
import { IMAGE_MAX_BYTES, IMAGE_MIME_TYPES } from "./image.constants";

interface ImagePickerProps {
  label?: string;
  /** The newly chosen file, owned by the parent so it can upload on submit. */
  value: File | null;
  onChange: (file: File | null) => void;
  /** An image the record already has, shown until a new one is picked. */
  existingUrl?: string | null;
  hint?: string;
  disabled?: boolean;
}

const PLACEHOLDER_STRIPES =
  "repeating-linear-gradient(135deg, #F0EDE5 0px, #F0EDE5 6px, #E7E3DA 6px, #E7E3DA 12px)";

const ImagePicker = ({
  label = "Image",
  value,
  onChange,
  existingUrl,
  hint = "One image per property. JPEG, PNG or WebP, up to 5MB. Replacing it later removes the old file.",
  disabled,
}: ImagePickerProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const previewUrl = useMemo(
    () => (value ? URL.createObjectURL(value) : null),
    [value],
  );

  // Object URLs pin the file in memory until they're revoked.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const onPick = (file: File | undefined) => {
    if (!file) return;

    if (!IMAGE_MIME_TYPES.includes(file.type)) {
      setError("That file type isn't supported. Use JPEG, PNG or WebP.");
      onChange(null);
      return;
    }

    if (file.size > IMAGE_MAX_BYTES) {
      const mb = (file.size / 1024 / 1024).toFixed(1);
      setError(`That image is ${mb}MB. The limit is 5MB.`);
      onChange(null);
      return;
    }

    setError(null);
    onChange(file);
  };

  const shownUrl = previewUrl ?? existingUrl ?? null;

  return (
    <div>
      <p className="mb-2 text-[14px] font-medium text-[#2A2822]">{label}</p>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          className="flex h-[150px] w-full shrink-0 items-center justify-center overflow-hidden rounded-[10px] sm:w-[190px]"
          style={shownUrl ? undefined : { backgroundImage: PLACEHOLDER_STRIPES }}
        >
          {shownUrl ? (
            <img
              src={shownUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="font-label text-[12px] text-[#9A9488]">
              no image yet
            </span>
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept={IMAGE_MIME_TYPES.join(",")}
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              onPick(event.target.files?.[0]);
              // Let the same file be re-picked after an error.
              event.target.value = "";
            }}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              disabled={disabled}
              onClick={() => inputRef.current?.click()}
            >
              {shownUrl ? "Change image" : "Choose image"}
            </Button>

            {value && (
              <Button
                variant="secondary"
                disabled={disabled}
                onClick={() => {
                  setError(null);
                  onChange(null);
                }}
              >
                Remove
              </Button>
            )}
          </div>

          {error ? (
            <p className="mt-3 text-[13px] text-[#B4432B]">{error}</p>
          ) : (
            <p className="mt-3 text-[13px] leading-relaxed text-[#8A857B]">
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImagePicker;
