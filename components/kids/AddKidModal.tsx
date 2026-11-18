"use client";

import { useEffect, useRef, useState } from "react";
import {
  addKidModalData,
  parseBirthDate,
  type AddKidFormValues,
  type AddKidModalData,
} from "@/app/_data/kids";
import { ChevronDownIcon } from "@/components/shared/icons";

type AddKidModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (values: AddKidFormValues) => void;
};

type AddKidFormErrors = {
  name?: string;
  birthDate?: string;
  room?: string;
};

const EMPTY_FORM_VALUES: AddKidFormValues = {
  name: "",
  birthDate: "",
  room: "",
  allergies: "",
  medicalNotes: "",
};

const EMPTY_FORM_ERRORS: AddKidFormErrors = {};

const fieldLabelClass =
  "mb-2 block text-xs font-extrabold tracking-[0.7px] text-muted";

const fieldInputClass =
  "w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-ink outline-none placeholder:text-input-placeholder";

const fieldErrorTextClass = "mt-2 text-[12.5px] text-input-error-text";

function fieldBorderClass(error: string | undefined): string {
  return error === undefined
    ? "border-input-border"
    : "border-input-error-border";
}

/**
 * Keeps the birth date input in the masked "dd/mm/aaaa" shape: digits only, at
 * most 8 of them, with slashes inserted after the 2nd and 5th digit. Pasted
 * content is sanitized by the same rules.
 */
function maskBirthDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter((part) => part.length > 0)
    .join("/");
}

function validateAddKidForm(
  values: AddKidFormValues,
  errorMessages: AddKidModalData["errorMessages"],
): AddKidFormErrors {
  const errors: AddKidFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = errorMessages.nameRequired;
  }

  const birthDate = parseBirthDate(values.birthDate);
  if (birthDate === null) {
    errors.birthDate = errorMessages.birthDateInvalid;
  } else if (birthDate.getTime() > Date.now()) {
    errors.birthDate = errorMessages.birthDateFuture;
  }

  if (values.room.length === 0) {
    errors.room = errorMessages.roomRequired;
  }

  return errors;
}

export function AddKidModal({ isOpen, onClose, onSave }: AddKidModalProps) {
  const [values, setValues] = useState<AddKidFormValues>(EMPTY_FORM_VALUES);
  const [errors, setErrors] = useState<AddKidFormErrors>(EMPTY_FORM_ERRORS);
  const data = addKidModalData;

  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const birthDateInputRef = useRef<HTMLInputElement | null>(null);
  const roomSelectRef = useRef<HTMLSelectElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  const handleSave = () => {
    const formErrors = validateAddKidForm(values, data.errorMessages);
    setErrors(formErrors);

    const isValid =
      formErrors.name === undefined &&
      formErrors.birthDate === undefined &&
      formErrors.room === undefined;

    if (!isValid) {
      if (formErrors.name !== undefined) {
        nameInputRef.current?.focus();
      } else if (formErrors.birthDate !== undefined) {
        birthDateInputRef.current?.focus();
      } else if (formErrors.room !== undefined) {
        roomSelectRef.current?.focus();
      }
      return;
    }

    onSave(values);
    setValues(EMPTY_FORM_VALUES);
    setErrors(EMPTY_FORM_ERRORS);
  };

  return (
    <div
      inert={!isOpen}
      className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
    >
      <div
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
        className={`absolute inset-0 flex overflow-y-auto bg-ink/35 p-4 transition-opacity duration-200 sm:px-6 sm:py-10 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-kid-modal-title"
          className={`m-auto w-full max-w-[520px] overflow-hidden rounded-3xl border border-line bg-modal-surface shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] transition-[opacity,scale] duration-200 ${
            isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-[26px] py-5">
            <button
              type="button"
              onClick={onClose}
              className="text-[15px] font-bold text-muted"
            >
              {data.cancelLabel}
            </button>
            <span
              id="add-kid-modal-title"
              className="font-display text-lg font-semibold text-ink"
            >
              {data.title}
            </span>
            <button
              type="button"
              onClick={handleSave}
              className="text-[15px] font-extrabold text-accent-label"
            >
              {data.saveLabel}
            </button>
          </div>

          <div className="px-[26px] py-6">
            <label htmlFor="add-kid-name" className={fieldLabelClass}>
              {data.nameLabel}
            </label>
            <div className="mb-[18px]">
              <input
                ref={nameInputRef}
                id="add-kid-name"
                type="text"
                value={values.name}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    name: event.target.value,
                  }));
                  setErrors((current) =>
                    current.name === undefined
                      ? current
                      : { ...current, name: undefined },
                  );
                }}
                placeholder={data.namePlaceholder}
                className={`${fieldInputClass} ${fieldBorderClass(errors.name)}`}
              />
              {errors.name !== undefined && (
                <p className={fieldErrorTextClass}>{errors.name}</p>
              )}
            </div>

            <div className="mb-[18px] flex flex-col gap-[14px] sm:flex-row">
              <div className="sm:flex-1">
                <label htmlFor="add-kid-birth-date" className={fieldLabelClass}>
                  {data.birthDateLabel}
                </label>
                <input
                  ref={birthDateInputRef}
                  id="add-kid-birth-date"
                  type="text"
                  inputMode="numeric"
                  value={values.birthDate}
                  onChange={(event) => {
                    setValues((current) => ({
                      ...current,
                      birthDate: maskBirthDateInput(event.target.value),
                    }));
                    setErrors((current) =>
                      current.birthDate === undefined
                        ? current
                        : { ...current, birthDate: undefined },
                    );
                  }}
                  placeholder={data.birthDatePlaceholder}
                  className={`${fieldInputClass} ${fieldBorderClass(errors.birthDate)}`}
                />
                {errors.birthDate !== undefined && (
                  <p className={fieldErrorTextClass}>{errors.birthDate}</p>
                )}
              </div>
              <div className="sm:flex-1">
                <label htmlFor="add-kid-room" className={fieldLabelClass}>
                  {data.roomFieldLabel}
                </label>
                <div className="relative">
                  <select
                    ref={roomSelectRef}
                    id="add-kid-room"
                    value={values.room}
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        room: event.target.value,
                      }));
                      setErrors((current) =>
                        current.room === undefined
                          ? current
                          : { ...current, room: undefined },
                      );
                    }}
                    className={`w-full appearance-none rounded-[14px] border-[1.5px] ${fieldBorderClass(errors.room)} bg-white py-[13px] pl-4 pr-10 text-[15px] outline-none ${
                      values.room === ""
                        ? "text-input-placeholder"
                        : "font-bold text-ink"
                    }`}
                  >
                    <option value="" disabled>
                      {data.roomPlaceholder}
                    </option>
                    {data.roomOptions.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-faint" />
                </div>
                {errors.room !== undefined && (
                  <p className={fieldErrorTextClass}>{errors.room}</p>
                )}
              </div>
            </div>

            <label htmlFor="add-kid-allergies" className={fieldLabelClass}>
              {data.allergiesLabel}
            </label>
            <input
              id="add-kid-allergies"
              type="text"
              value={values.allergies}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  allergies: event.target.value,
                }))
              }
              placeholder={data.allergiesPlaceholder}
              className={`${fieldInputClass} border-input-border mb-[18px]`}
            />

            <label htmlFor="add-kid-medical-notes" className={fieldLabelClass}>
              {data.medicalNotesLabel}
            </label>
            <textarea
              id="add-kid-medical-notes"
              value={values.medicalNotes}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  medicalNotes: event.target.value,
                }))
              }
              placeholder={data.medicalNotesPlaceholder}
              className={`${fieldInputClass} border-input-border min-h-[90px] resize-y leading-normal`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
