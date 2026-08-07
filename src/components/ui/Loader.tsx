import { cn } from "../../utils/cn.util";

interface LoaderProps {
  /** Announced to screen readers; the spinner itself is decorative. */
  label?: string;
  /** For route-level waits, where there is no page shape to fill yet. */
  fullScreen?: boolean;
  className?: string;
}

const Loader = ({
  label = "Loading",
  fullScreen = false,
  className,
}: LoaderProps) => (
  <div
    role="status"
    aria-live="polite"
    className={cn(
      "flex items-center justify-center",
      fullScreen ? "h-screen" : "py-20",
      className,
    )}
  >
    <span className="h-8 w-8 animate-spin rounded-full border-2 border-[#DCD6CB] border-t-[#141412]" />
    <span className="sr-only">{label}</span>
  </div>
);

export default Loader;
