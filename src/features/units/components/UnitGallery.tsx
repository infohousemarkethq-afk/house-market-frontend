import { useRef, useState } from "react";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import {
  IMAGE_MAX_BYTES,
  IMAGE_MIME_TYPES,
} from "../../../components/ui/image.constants";
import { cn } from "../../../utils/cn.util";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { UnitImageSummary } from "../units.types";
import {
  useDeleteUnitImage,
  useReorderUnitImages,
  useUploadUnitImages,
} from "../hooks/useUnits";

/** Mirrors UPLOAD_LIMITS.UNIT_IMAGES_MAX in the backend. */
const MAX_IMAGES = 15;

interface UnitGalleryProps {
  unitId: string;
  images: UnitImageSummary[];
  /** Owners and managers read the gallery; only admins can change it. */
  canEdit: boolean;
}

const UnitGallery = ({ unitId, images, canEdit }: UnitGalleryProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIndex = useRef<number | null>(null);

  /** Local order so a drag lands instantly, before the server confirms. */
  const [order, setOrder] = useState(images);
  const [syncedIds, setSyncedIds] = useState(() =>
    images.map((image) => image.id).join(","),
  );
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const incomingIds = images.map((image) => image.id).join(",");
  if (incomingIds !== syncedIds) {
    setSyncedIds(incomingIds);
    setOrder(images);
  }

  const upload = useUploadUnitImages();
  const remove = useDeleteUnitImage();
  const reorder = useReorderUnitImages();

  const isBusy = upload.isPending || remove.isPending || reorder.isPending;

  const commitOrder = (next: UnitImageSummary[]) => {
    setOrder(next);
    reorder.mutate(
      { id: unitId, imageIds: next.map((image) => image.id) },
      {
        onError: (error) => {
          setOrder(images); // Put it back — the server never accepted it.
          toast.error(
            getApiErrorMessage(error, "We couldn't save the new order."),
          );
        },
      },
    );
  };

  const move = (from: number, to: number) => {
    if (from === to || to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commitOrder(next);
  };

  const onPick = (files: FileList | null) => {
    if (!files?.length) return;

    const picked = Array.from(files);
    const room = MAX_IMAGES - order.length;

    if (room <= 0) {
      toast.error(`This unit already has the maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const rejected = picked.find(
      (file) =>
        !IMAGE_MIME_TYPES.includes(file.type) || file.size > IMAGE_MAX_BYTES,
    );
    if (rejected) {
      toast.error(
        !IMAGE_MIME_TYPES.includes(rejected.type)
          ? `${rejected.name} isn't a JPEG, PNG or WebP.`
          : `${rejected.name} is over the 5MB limit.`,
      );
      return;
    }

    const accepted = picked.slice(0, room);
    if (accepted.length < picked.length) {
      toast.error(`Only ${room} more image${room === 1 ? "" : "s"} will fit.`);
    }

    upload.mutate(
      { id: unitId, files: accepted },
      {
        onSuccess: () =>
          toast.success(
            `${accepted.length} image${accepted.length === 1 ? "" : "s"} added`,
          ),
        onError: (error) =>
          toast.error(getApiErrorMessage(error, "We couldn't upload those.")),
      },
    );
  };

  return (
    <section className="rounded-[16px] border border-[#E7E3DA] bg-white p-7">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-[20px] font-semibold text-[#141412]">Gallery</h2>
        <p className="text-[13px] text-[#8A857B]">
          {order.length} of {MAX_IMAGES}
          {canEdit && " · drag to reorder · first slot is the cover"}
        </p>
      </div>

      {order.length === 0 && !canEdit ? (
        <p className="text-[15px] text-[#8A857B]">No images yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {order.map((image, index) => (
            <div
              key={image.id}
              draggable={canEdit && !isBusy}
              onDragStart={() => {
                dragIndex.current = index;
              }}
              onDragOver={(event) => {
                if (dragIndex.current === null) return;
                event.preventDefault();
                setOverIndex(index);
              }}
              onDragLeave={() => setOverIndex(null)}
              onDrop={(event) => {
                event.preventDefault();
                setOverIndex(null);
                if (dragIndex.current !== null) move(dragIndex.current, index);
                dragIndex.current = null;
              }}
              onDragEnd={() => {
                dragIndex.current = null;
                setOverIndex(null);
              }}
              className={cn(
                "group relative aspect-[4/3] overflow-hidden rounded-[10px] bg-[#EFEDE6]",
                canEdit && !isBusy && "cursor-grab active:cursor-grabbing",
                overIndex === index && "ring-2 ring-[#141412]",
              )}
            >
              <img
                src={image.url}
                alt={image.caption ?? ""}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover"
              />

              {index === 0 ? (
                <span className="absolute top-2 left-2 rounded-[6px] bg-[#141412] px-2 py-1 text-[11px] font-semibold text-[#F5F3EF]">
                  Cover
                </span>
              ) : (
                <span className="absolute top-2 left-2 rounded-[6px] bg-white/90 px-2 py-1 text-[11px] font-semibold text-[#141412]">
                  {index + 1}
                </span>
              )}

              {canEdit && (
                <>
                  <button
                    type="button"
                    disabled={isBusy}
                    aria-label={`Remove image ${index + 1}`}
                    onClick={() => {
                      remove.mutate(
                        { id: unitId, imageId: image.id },
                        {
                          onSuccess: () => toast.success("Image removed"),
                          onError: (error) =>
                            toast.error(
                              getApiErrorMessage(
                                error,
                                "We couldn't remove that image.",
                              ),
                            ),
                        },
                      );
                    }}
                    className="absolute top-2 right-2 flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full bg-[#141412]/80 text-white transition-colors hover:bg-[#141412] disabled:opacity-40"
                  >
                    <HugeiconsIcon
                      icon={Cancel01Icon}
                      size={13}
                      color="currentColor"
                      strokeWidth={2.5}
                    />
                  </button>

                  {/* Drag is mouse-only, so the highest-value reorder — picking
                      the cover — also gets a real, keyboard-reachable button. */}
                  {index > 0 && (
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => move(index, 0)}
                      className="absolute inset-x-2 bottom-2 cursor-pointer rounded-[6px] bg-white/95 py-1.5 text-[12px] font-medium text-[#141412] opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 disabled:opacity-40"
                    >
                      Make cover
                    </button>
                  )}
                </>
              )}
            </div>
          ))}

          {canEdit && order.length < MAX_IMAGES && (
            <>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept={IMAGE_MIME_TYPES.join(",")}
                className="sr-only"
                onChange={(event) => {
                  onPick(event.target.files);
                  event.target.value = "";
                }}
              />
              <button
                type="button"
                disabled={isBusy}
                onClick={() => inputRef.current?.click()}
                className="flex aspect-[4/3] cursor-pointer items-center justify-center rounded-[10px] border border-dashed border-[#DCD6CB] text-[14px] text-[#6B665C] transition-colors hover:border-[#B8B1A4] hover:text-[#141412] disabled:opacity-50"
              >
                {upload.isPending ? "Uploading…" : "+ Add images"}
              </button>
            </>
          )}
        </div>
      )}
    </section>
  );
};

export default UnitGallery;
