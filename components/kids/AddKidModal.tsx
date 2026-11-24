"use client";

import { useCallback, useState } from "react";

import {
  AddChildForm,
  type RoomOption,
} from "@/components/kids/AddChildForm";
import { Modal } from "@/components/shared/Modal";

type AddKidModalProps = {
  isOpen: boolean;
  rooms: RoomOption[];
  onClose: () => void;
  onCreated: () => void;
};

export function AddKidModal({
  isOpen,
  rooms,
  onClose,
  onCreated,
}: AddKidModalProps) {
  const [formKey, setFormKey] = useState(0);

  const resetForm = useCallback(() => {
    setFormKey((current) => current + 1);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleCreated = useCallback(() => {
    resetForm();
    onCreated();
  }, [onCreated, resetForm]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      titleId="add-child-form-title"
      align="start"
      panelClassName="m-auto max-w-[520px]"
      initialFocusSelector='input[name="full_name"]'
    >
      <AddChildForm
        key={formKey}
        rooms={rooms}
        onCancel={handleClose}
        onCreated={handleCreated}
      />
    </Modal>
  );
}
