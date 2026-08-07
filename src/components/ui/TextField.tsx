import { useId, type ComponentProps } from "react";

import { cn } from "../../utils/cn.util";
import { inputClasses } from "./input.styles";

interface TextFieldProps extends ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

const TextField = ({
  label,
  error,
  hint,
  id,
  className,
  ...props
}: TextFieldProps) => {
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

      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(inputClasses(Boolean(error)), className)}
        {...props}
      />

      {error ? (
        <p className="mt-2 text-[13px] text-[#B4432B]">{error}</p>
      ) : (
        hint && <p className="mt-2 text-[13px] text-[#8A857B]">{hint}</p>
      )}
    </div>
  );
};

export default TextField;
