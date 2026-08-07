import { useId } from "react";

import { cn } from "../../utils/cn.util";

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const buttonClasses =
  "flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center rounded-[8px] border border-[#DCD6CB] bg-white text-[16px] leading-none text-[#2A2822] transition-colors hover:border-[#B8B1A4] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#DCD6CB]";

/** The − N + control from the unit form's "Rooms and capacity" row. */
const Stepper = ({
  label,
  value,
  onChange,
  min = 0,
  max = 50,
  disabled,
}: StepperProps) => {
  const id = useId();
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className="rounded-[10px] border border-[#DCD6CB] bg-white px-3 py-2.5">
      <label htmlFor={id} className="block text-[13px] text-[#6B665C]">
        {label}
      </label>

      <div className="mt-1.5 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          disabled={disabled || value <= min}
          onClick={() => onChange(clamp(value - 1))}
          className={cn(buttonClasses)}
        >
          −
        </button>

        <input
          id={id}
          type="text"
          inputMode="numeric"
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(event) => {
            const digits = event.target.value.replace(/[^0-9]/g, "");
            onChange(digits === "" ? min : clamp(Number(digits)));
          }}
          className="w-full min-w-0 border-0 bg-transparent text-center text-[17px] font-semibold text-[#141412] focus:outline-none"
        />

        <button
          type="button"
          aria-label={`Increase ${label}`}
          disabled={disabled || value >= max}
          onClick={() => onChange(clamp(value + 1))}
          className={cn(buttonClasses)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default Stepper;
