import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import FilePicker from "../../../components/ui/FilePicker";
import Modal from "../../../components/ui/Modal";
import Select from "../../../components/ui/Select";
import TextField from "../../../components/ui/TextField";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { ViewRole } from "../../auth/auth.types";
import type { UnitSummary } from "../../units/units.types";
import {
  DocumentUploadSchema,
  type DocumentUploadValues,
} from "../documents.schema";
import { uploadCategoriesFor, uploadHintFor } from "../documents.utils";
import { DOCUMENT_CATEGORY_LABEL } from "../document.type";
import { useUploadDocument } from "../hooks/useDocument";

interface UploadDocumentModalProps {
  onClose: () => void;
  units: UnitSummary[];
  role: ViewRole;
  /** Preselected when the form is opened from a unit's screen. */
  unitId?: string;
}

const UploadDocumentModal = ({
  onClose,
  units,
  role,
  unitId,
}: UploadDocumentModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const uploadDocument = useUploadDocument();
  const categories = uploadCategoriesFor(role);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DocumentUploadValues>({
    resolver: zodResolver(DocumentUploadSchema),
    mode: "onTouched",
    defaultValues: {
      unitId: unitId ?? units[0]?.id ?? "",
      documentName: "",
      documentCategory: categories[0],
    },
  });

  const onSubmit = async (values: DocumentUploadValues) => {
    if (!file) {
      setFileError("Choose a file to upload");
      return;
    }

    try {
      const document = await uploadDocument.mutateAsync({ ...values, file });
      toast.success(`${document.documentName} filed`);
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't file this document."));
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!uploadDocument.isPending}
      title="Upload a document"
      description={uploadHintFor(role)}
      footer={
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={uploadDocument.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="document-form"
            disabled={uploadDocument.isPending}
          >
            {uploadDocument.isPending ? "Uploading…" : "Save document"}
          </Button>
        </div>
      }
    >
      <form id="document-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="space-y-5">
          <FilePicker
            value={file}
            error={fileError ?? undefined}
            disabled={uploadDocument.isPending}
            onChange={(next) => {
              setFile(next);
              setFileError(null);
            }}
          />

          <Select
            label="Unit"
            error={errors.unitId?.message}
            {...register("unitId")}
          >
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unitName} — {unit.property.propertyName}
              </option>
            ))}
          </Select>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Document name"
              placeholder="Title Deed"
              error={errors.documentName?.message}
              {...register("documentName")}
            />

            <Select
              label="Category"
              error={errors.documentCategory?.message}
              {...register("documentCategory")}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {DOCUMENT_CATEGORY_LABEL[category]}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UploadDocumentModal;
