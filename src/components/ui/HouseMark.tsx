const STROKE = "#7A7263";
const WINDOW = "#7C5E35";

/** The line-art terrace on the auth panel. */
const HouseMark = ({ className }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 330 140"
      role="presentation"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke={STROKE}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* pitched-roof house */}
      <path d="M5 55 L85 3 L165 55" />
      <path d="M5 55 V138" />
      <path d="M165 55 V138" />
      <rect x="70" y="90" width="36" height="48" />

      {/* flat-roof blocks stepping down to the right */}
      <path d="M165 79 H246 V138" />
      <path d="M246 99 H327 V138" />

      {/* ground */}
      <path d="M5 138 H327" />

      <g fill={WINDOW} stroke="none">
        <rect x="42" y="64" width="21" height="21" />
        <rect x="112" y="64" width="21" height="21" />
        <rect x="178" y="90" width="18" height="18" />
        <rect x="208" y="90" width="18" height="18" />
        <rect x="260" y="110" width="16" height="16" />
        <rect x="292" y="110" width="16" height="16" />
      </g>
    </svg>
  );
};

export default HouseMark;
