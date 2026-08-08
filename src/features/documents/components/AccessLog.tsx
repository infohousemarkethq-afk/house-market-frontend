import Callout from "../../../components/ui/Callout";
import { Skeleton } from "../../../components/ui/SkeletonLoader";
import { cn } from "../../../utils/cn.util";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import { formatApiDateTime } from "../../../utils/formatTime.util";
import {
  ACCESS_ACTION_LABEL,
  type DocumentAccessAction,
  type DocumentAccessLogEntry,
} from "../document.type";

const DOT_TONES: Record<DocumentAccessAction, string> = {
  UPLOADED: "bg-[#3F7D5A]",
  VIEWED: "bg-[#141412]",
  DOWNLOADED: "bg-[#B98A5E]",
};

interface AccessLogProps {
  entries: DocumentAccessLogEntry[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
}

/** Who opened a sensitive document, newest first. */
const AccessLog = ({ entries, isPending, isError, error }: AccessLogProps) => {
  if (isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[16px] w-2/3" />
        <Skeleton className="h-[16px] w-1/2" />
        <Skeleton className="h-[16px] w-3/5" />
      </div>
    );
  }

  if (isError) {
    return (
      <Callout tone="warning" title="We couldn't load the access log">
        {getApiErrorMessage(error)}
      </Callout>
    );
  }

  if (entries.length === 0) {
    return (
      <p className="text-[15px] leading-relaxed text-[#6B665C]">
        Nothing recorded yet. The first view or download will appear here.
      </p>
    );
  }

  return (
    <ol className="space-y-5">
      {entries.map((entry, index) => (
        <li key={entry.id} className="grid grid-cols-[16px_1fr_auto] gap-4">
          <div className="flex flex-col items-center">
            <span
              aria-hidden="true"
              className={cn(
                "mt-1.5 h-[9px] w-[9px] shrink-0 rounded-full",
                DOT_TONES[entry.action],
              )}
            />
            {index < entries.length - 1 && (
              <span
                aria-hidden="true"
                className="mt-1 w-px flex-1 bg-[#EDEAE2]"
              />
            )}
          </div>

          <div>
            <p className="text-[15px] text-[#2A2822]">
              <span className="font-semibold">{entry.user.fullName}</span>{" "}
              {ACCESS_ACTION_LABEL[entry.action]}
            </p>
            <p className="font-label mt-1 text-[13px] text-[#8A857B]">
              {entry.ipAddress ?? "no address recorded"} · {entry.user.email}
            </p>
          </div>

          <p className="text-[13px] whitespace-nowrap text-[#8A857B]">
            {formatApiDateTime(entry.occurredAt)}
          </p>
        </li>
      ))}
    </ol>
  );
};

export default AccessLog;
