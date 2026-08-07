import { cn } from "../../utils/cn.util";

export interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface PillGroupProps<T extends string> {
  label?: string;
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  error?: string;
  /** Renders as a radio group; leave unset outside forms. */
  name?: string;
}

/**
 * A single-select row of pills. Every option stays visible, which is why the
 * type filter and the type field in the property form both use it instead of
 * a dropdown — seven options don't need to be hidden behind a click.
 */
function PillGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  name,
}: PillGroupProps<T>) {
  return (
    <div>
      {label && (
        <p className="mb-2 text-[14px] font-medium text-[#2A2822]">{label}</p>
      )}

      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={selected}
              name={name}
              onClick={() => onChange(option.value)}
              className={cn(
                "h-[42px] cursor-pointer rounded-full border px-5 text-[14px] font-medium transition-colors",
                selected
                  ? "border-[#141412] bg-[#141412] text-[#F5F3EF]"
                  : "border-[#DCD6CB] bg-white text-[#2A2822] hover:border-[#B8B1A4]",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {error && <p className="mt-2 text-[13px] text-[#B4432B]">{error}</p>}
    </div>
  );
}

export default PillGroup;
