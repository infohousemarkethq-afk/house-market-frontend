import { cn } from "../../../utils/cn.util";
import { AMENITY_KEYS, AMENITY_LABEL, type Amenity } from "../units.types";

interface AmenityPickerProps {
  value: Amenity[];
  onChange: (value: Amenity[]) => void;
  disabled?: boolean;
  /** Off in the filter panel, where the count sits in the trigger instead. */
  showCount?: boolean;
}

/**
 * Amenities as toggleable tags — the same pill language the type filters and
 * the amenity chips on cards already use, so a chip means the same thing
 * whether you're reading it or setting it.
 *
 * Still real checkboxes underneath: multi-select is what a checkbox is for,
 * and it keeps native keyboard and form behaviour. The tag is the label.
 */
const AmenityPicker = ({
  value,
  onChange,
  disabled,
  showCount = true,
}: AmenityPickerProps) => {
  const toggle = (amenity: Amenity) => {
    onChange(
      value.includes(amenity)
        ? value.filter((item) => item !== amenity)
        : [...value, amenity],
    );
  };

  return (
    <div>
      {showCount && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <p className="text-[14px] font-medium text-[#2A2822]">Amenities</p>
          <p className="text-[13px] text-[#8A857B]">
            {value.length} of {AMENITY_KEYS.length} selected
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {AMENITY_KEYS.map((amenity) => {
          const checked = value.includes(amenity);

          return (
            <label
              key={amenity}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-[14px] font-medium transition-colors select-none",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#141412] has-[:focus-visible]:ring-offset-2",
                checked
                  ? "border-[#141412] bg-[#141412] text-[#F5F3EF]"
                  : "border-[#DCD6CB] bg-white text-[#2A2822] hover:border-[#B8B1A4]",
                disabled && "cursor-not-allowed opacity-55",
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => toggle(amenity)}
                className="sr-only"
              />
              {AMENITY_LABEL[amenity]}
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AmenityPicker;
