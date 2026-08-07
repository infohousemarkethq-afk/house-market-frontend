import { useId, useState, type ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ViewIcon, ViewOffSlashIcon } from "@hugeicons/core-free-icons";

import { cn } from "../../utils/cn.util";
import { inputClasses } from "./input.styles";

interface PasswordFieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

const PasswordField = ({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: PasswordFieldProps) => {
  const [visible, setVisible] = useState(false);
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-2 block text-[14px] font-medium text-[#2A2822]"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={fieldId}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          className={cn(inputClasses(Boolean(error)), "pr-12", className)}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute top-0 right-3 flex h-[52px] cursor-pointer items-center text-[#8A857B] hover:text-[#141412]"
        >
          <HugeiconsIcon
            icon={visible ? ViewOffSlashIcon : ViewIcon}
            size={20}
            color="currentColor"
            strokeWidth={1.5}
          />
        </button>
      </div>

      {error ? (
        <p className="mt-2 text-[13px] text-[#B4432B]">{error}</p>
      ) : (
        hint && <p className="mt-2 text-[13px] text-[#8A857B]">{hint}</p>
      )}
    </div>
  );
};

export default PasswordField;
