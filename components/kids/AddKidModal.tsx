"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  AddChildForm,
  type RoomOption,
} from "@/components/kids/AddChildForm";

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
  const dialogRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    dialogRef.current
      ?.querySelector<HTMLInputElement>('input[name="full_name"]')
      ?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleClose]);

  return (
    <div
      inert={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            handleClose();
          }
        }}
        className={`absolute inset-0 flex items-start justify-center overflow-y-auto bg-ink/35 p-4 transition-opacity duration-200 sm:px-6 sm:py-10 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          ref={dialogRef}
          className={`m-auto w-full max-w-[520px] transition-[opacity,scale] duration-200 ${
            isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="add-child-form-title">
            <AddChildForm
              key={formKey}
              rooms={rooms}
              onCancel={handleClose}
              onCreated={handleCreated}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
