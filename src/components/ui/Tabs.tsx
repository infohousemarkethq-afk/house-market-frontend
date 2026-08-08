import { cn } from "../../utils/cn.util";

export interface TabOption<T extends string> {
  value: T;
  label: string;
  /** Rendered as a chip beside the label. Omit for tabs that don't count. */
  count?: number;
}

interface TabsProps<T extends string> {
  options: TabOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label?: string;
}

/** The underlined row that switches between views of one screen. */
function Tabs<T extends string>({
  options,
  value,
  onChange,
  label = "Views",
}: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-7 border-b border-[#E7E3DA]"
    >
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              "-mb-px flex cursor-pointer items-center gap-2 border-b-2 pb-3 text-[15px] transition-colors",
              selected
                ? "border-[#141412] font-semibold text-[#141412]"
                : "border-transparent text-[#8A857B] hover:text-[#4A463E]",
            )}
          >
            {option.label}

            {option.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[12px] font-medium",
                  selected
                    ? "bg-[#141412] text-[#F5F3EF]"
                    : "bg-[#EDEAE2] text-[#8A857B]",
                )}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
