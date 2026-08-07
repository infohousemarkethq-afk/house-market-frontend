import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";

interface ModalProps {
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Pinned below the scrolling body, so long forms keep their actions in view. */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  /** Off while a request is in flight, so a stray Esc can't orphan the mutation. */
  dismissable?: boolean;
}

const SIZES = {
  sm: "sm:max-w-[440px]",
  md: "sm:max-w-[560px]",
  lg: "sm:max-w-[720px]",
} as const;

/**
 * Mounting is opening — render this conditionally rather than toggling a prop.
 * That way the contents get fresh state every time it appears, instead of each
 * caller having to remember to reset on open.
 */
const Modal = ({
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissable = true,
}: ModalProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    // Restore focus to whatever opened the modal, not to the top of the page.
    const opener = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  useEffect(() => {
    if (!dismissable) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, dismissable]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#141412]/45 sm:items-center sm:p-6"
      onMouseDown={(event) => {
        // mousedown, not click: a drag that starts inside the panel and ends on
        // the backdrop shouldn't close the form the user is filling in.
        if (event.target === event.currentTarget && dismissable) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={cn(
          "flex max-h-full w-full flex-col bg-white font-mono outline-none",
          "h-full rounded-none sm:h-auto sm:max-h-[calc(100vh-3rem)] sm:rounded-[16px]",
          SIZES[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6 sm:px-8 sm:pt-8">
          <div>
            <h2
              id={titleId}
              className="font-serif text-[28px] leading-tight text-[#141412]"
            >
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="mt-1 text-[14px] text-[#6B665C]">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={!dismissable}
            aria-label="Close"
            className="-mr-2 cursor-pointer p-2 text-[#8A857B] hover:text-[#141412] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={20}
              color="currentColor"
              strokeWidth={1.8}
            />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {children}
        </div>

        {footer && (
          <div className="border-t border-[#EDEAE2] px-6 py-4 sm:px-8">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default Modal;
