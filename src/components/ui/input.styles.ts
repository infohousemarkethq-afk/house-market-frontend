import { cn } from "../../utils/cn.util";

/** Shared field styling, so TextField and PasswordField stay identical. */
export const inputClasses = (hasError?: boolean) =>
  cn(
    "h-[52px] w-full rounded-[10px] border bg-white px-4 text-[15px] text-[#141412] transition-colors placeholder:text-[#A8A296]",
    hasError ? "border-[#C4553C]" : "border-[#DCD6CB] focus:border-[#141412]",
  );
