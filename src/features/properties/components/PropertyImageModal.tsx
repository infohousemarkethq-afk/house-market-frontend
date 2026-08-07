import { useState } from "react";
import toast from "react-hot-toast";

import Button from "../../../components/ui/Button";
import ImagePicker from "../../../components/ui/ImagePicker";
import Modal from "../../../components/ui/Modal";
import { getApiErrorMessage } from "../../../utils/apiError.util";
import type { PropertyDetail } from "../properties.types";
import {
  useDeletePropertyImage,
  useSetPropertyImage,
} from "../hooks/useProperties";

interface PropertyImageModalProps {
  onClose: () => void;
  property: PropertyDetail;
}

/** The image has its own endpoints, so it gets its own small dialog. */
const PropertyImageModal = ({ onClose, property }: PropertyImageModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const setImage = useSetPropertyImage();
  const deleteImage = useDeletePropertyImage();

  const isPending = setImage.isPending || deleteImage.isPending;

  const onSave = async () => {
    if (!file) return;

    try {
      await setImage.mutateAsync({ id: property.id, file });
      toast.success("Image updated");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't upload that image."));
    }
  };

  const onRemove = async () => {
    try {
      await deleteImage.mutateAsync(property.id);
      toast.success("Image removed");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "We couldn't remove the image."));
    }
  };

  return (
    <Modal
      onClose={onClose}
      dismissable={!isPending}
      title={property.imageUrl ? "Replace image" : "Add an image"}
      description="Replacing the image deletes the old file."
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          {property.imageUrl && (
            <Button
              variant="secondary"
              onClick={onRemove}
              disabled={isPending}
              className="mr-auto"
            >
              {deleteImage.isPending ? "Removing…" : "Remove image"}
            </Button>
          )}

          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isPending || !file} className="px-8">
            {setImage.isPending ? "Uploading…" : "Save image"}
          </Button>
        </div>
      }
    >
      <ImagePicker
        value={file}
        onChange={setFile}
        existingUrl={property.imageUrl}
        disabled={isPending}
      />
    </Modal>
  );
};

export default PropertyImageModal;
