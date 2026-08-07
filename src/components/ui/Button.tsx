import type { ComponentProps } from "react";

import { cn } from "../../utils/cn.util";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "secondary";
  size?: "md" | "sm";
}

const VARIANTS = {
  primary: "bg-[#141412] text-[#F5F3EF] hover:bg-[#2B2924]",
  secondary:
    "bg-white text-[#141412] border border-[#DCD6CB] hover:bg-[#EDEAE2]",
} as const;

const SIZES = {
  md: "h-[52px] px-6 text-[15px] rounded-[10px]",
  sm: "h-[38px] px-4 text-[13px] rounded-[8px]",
} as const;

const Button = ({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-55",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
};

export default Button;
