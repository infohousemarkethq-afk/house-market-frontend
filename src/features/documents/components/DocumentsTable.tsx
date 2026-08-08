import { useNavigate } from "react-router";

import Badge from "../../../components/ui/Badge";
import { formatApiDate } from "../../../utils/formatTime.util";
import {
  DOCUMENT_CATEGORY_LABEL,
  type DocumentSummary,
} from "../document.type";
import { documentUnitLine } from "../documents.utils";

const COLUMNS = "grid grid-cols-[2fr_1.4fr_1fr_1fr_90px] gap-4 px-6";

interface DocumentsTableProps {
  documents: DocumentSummary[];
}

const DocumentsTable = ({ documents }: DocumentsTableProps) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto rounded-[16px] border border-[#E7E3DA] bg-white">
      <div className="min-w-[780px]">
        <div
          className={`${COLUMNS} font-label border-b border-[#EDEAE2] bg-[#FBFAF7] py-3.5 text-[12px] tracking-[0.05em] text-[#8A857B] uppercase`}
        >
          <div>Document</div>
          <div>Unit</div>
          <div>Category</div>
          <div>Filed</div>
          <div />
        </div>

        {documents.map((document) => (
          <button
            key={document.id}
            type="button"
            onClick={() => navigate(`/documents/${document.id}`)}
            className={`${COLUMNS} w-full cursor-pointer items-center border-b border-[#F2F0EA] py-4 text-left transition-colors last:border-b-0 hover:bg-[#FBFAF7]`}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="truncate text-[15px] font-medium text-[#141412]">
                {document.documentName}
              </span>

              {/* Sensitivity is the server's call, never re-derived here. */}
              {document.isSensitive && <Badge tone="warning">Logged</Badge>}
            </div>

            <div className="truncate text-[14px] text-[#6B665C]">
              {documentUnitLine(document)}
            </div>

            <div>
              <Badge>{DOCUMENT_CATEGORY_LABEL[document.documentCategory]}</Badge>
            </div>

            <div className="text-[14px] text-[#6B665C]">
              {formatApiDate(document.createdAt)}
            </div>

            <div className="text-right text-[14px] font-medium text-[#3F7D5A]">
              Open
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocumentsTable;
