import { useId, type ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";

interface SelectProps extends ComponentProps<"select"> {
  label?: string;
  /** Hides the label visually but keeps it for screen readers. */
  hideLabel?: boolean;
  error?: string;
}

const Select = ({
  label,
  hideLabel,
  error,
  id,
  className,
  children,
  ...props
}: SelectProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div>
      {label && (
        <label
          htmlFor={fieldId}
          className={cn(
            "mb-2 block text-[14px] font-medium text-[#2A2822]",
            hideLabel && "sr-only",
          )}
        >
          {label}
        </label>
      )}

      <div className="relative">
        <select
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(
            "h-[48px] w-full cursor-pointer appearance-none rounded-full border bg-white pr-11 pl-5 text-[14px] text-[#2A2822] transition-colors focus:outline-none",
            error
              ? "border-[#C4553C]"
              : "border-[#DCD6CB] hover:border-[#B8B1A4] focus:border-[#141412]",
            className,
          )}
          {...props}
        >
          {children}
        </select>

        <span className="pointer-events-none absolute top-0 right-4 flex h-[48px] items-center text-[#8A857B]">
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            size={18}
            color="currentColor"
            strokeWidth={1.8}
          />
        </span>
      </div>

      {error && <p className="mt-2 text-[13px] text-[#B4432B]">{error}</p>}
    </div>
  );
};

export default Select;
