import { Link, useParams } from "react-router";
import toast from "react-hot-toast";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Callout from "../components/ui/Callout";
import { Skeleton } from "../components/ui/SkeletonLoader";
import { getApiErrorMessage } from "../utils/apiError.util";
import AccessLog from "../features/documents/components/AccessLog";
import {
  useDocument,
  useDocumentAccessLog,
  useDocumentDownload,
} from "../features/documents/hooks/useDocument";
import {
  documentUnitLine,
  fileSizeLabel,
  fileTypeLabel,
} from "../features/documents/documents.utils";
import { DOCUMENT_CATEGORY_LABEL } from "../features/documents/document.type";

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[12px] text-[#8A857B]">{label}</p>
    <p className="mt-1 text-[15px] text-[#2A2822]">{value}</p>
  </div>
);

const DocumentDetail = () => {
  const { id } = useParams();
  const { data: document, isPending, isError, error } = useDocument(id);
  const download = useDocumentDownload();

  // Only sensitive documents are logged, so asking for the rest would always
  // come back empty.
  const accessLog = useDocumentAccessLog(id, Boolean(document?.isSensitive));

  const onDownload = async () => {
    if (!document) return;

    try {
      const link = await download.mutateAsync(document.id);
      window.open(link.downloadUrl, "_blank", "noopener,noreferrer");
    } catch (downloadError) {
      toast.error(
        getApiErrorMessage(downloadError, "We couldn't prepare that link."),
      );
    }
  };

  if (isPending) {
    return (
      <div className="mx-auto max-w-[1000px] space-y-6">
        <Skeleton className="h-[16px] w-[110px]" />
        <Skeleton className="h-[240px] rounded-[16px]" />
        <Skeleton className="h-[200px] rounded-[16px]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1000px]">
        <Callout tone="warning" title="We couldn't load this document">
          {getApiErrorMessage(error)}
        </Callout>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1000px]">
      <Link
        to="/documents"
        className="inline-flex items-center gap-2 text-[14px] text-[#6B665C] transition-colors hover:text-[#141412]"
      >
        <HugeiconsIcon
          icon={ArrowLeft01Icon}
          size={16}
          color="currentColor"
          strokeWidth={1.8}
        />
        Documents
      </Link>

      <section className="mt-6 rounded-[16px] border border-[#E7E3DA] bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-[26px] leading-tight text-[#141412] sm:text-[32px]">
                {document.documentName}
              </h1>
              {document.isSensitive && <Badge tone="warning">Logged</Badge>}
            </div>
            <p className="mt-1 text-[15px] text-[#6B665C]">
              {documentUnitLine(document)}
            </p>
          </div>

          <Button onClick={onDownload} disabled={download.isPending}>
            {download.isPending ? "Preparing link…" : "Get download link"}
          </Button>
        </div>

        <div className="mt-6 grid gap-5 border-t border-[#EDEAE2] pt-6 sm:grid-cols-4">
          <Detail
            label="Category"
            value={DOCUMENT_CATEGORY_LABEL[document.documentCategory]}
          />
          <Detail label="Type" value={fileTypeLabel(document.mimeType)} />
          <Detail label="Size" value={fileSizeLabel(document.fileSize)} />
          <Detail label="Uploaded by" value={document.uploadedBy.fullName} />
        </div>

        {document.isSensitive && (
          <Callout tone="warning" className="mt-6">
            Views and downloads of this document are logged. The owner can see
            who opened it.
          </Callout>
        )}

        <p className="mt-5 text-[13px] leading-relaxed text-[#8A857B]">
          Download links are generated on request and expire after five minutes.
          If you leave this page open, ask for a fresh one.
        </p>
      </section>

      <section className="mt-5 rounded-[16px] border border-[#E7E3DA] bg-white p-6 sm:p-7">
        <h2 className="text-[19px] font-semibold text-[#141412]">Access log</h2>

        <div className="mt-5">
          {document.isSensitive ? (
            <AccessLog
              entries={accessLog.data ?? []}
              isPending={accessLog.isPending}
              isError={accessLog.isError}
              error={accessLog.error}
            />
          ) : (
            <p className="text-[15px] leading-relaxed text-[#6B665C]">
              This document type isn't tracked. Only title, ID and
              proof-of-ownership documents record who looked at them.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default DocumentDetail;
