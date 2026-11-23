"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";

import { sendInvitationAction } from "@/app/actions/invitations";
import { CloseIcon, InfoIcon, SendIcon } from "@/components/shared/icons";
import {
  linkParentModalData,
  type LinkParentFormValues,
  type LinkParentModalData,
} from "@/lib/link-parent";

type LinkParentModalProps = {
  isOpen: boolean;
  childId: string;
  childName: string;
  onClose: () => void;
};

type LinkParentFormErrors = {
  name?: string;
  email?: string;
};

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const EMPTY_FORM_VALUES: LinkParentFormValues = {
  name: "",
  email: "",
  relationship: "mother",
};

const EMPTY_FORM_ERRORS: LinkParentFormErrors = {};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const fieldLabelClass =
  "mb-2 block text-xs font-extrabold tracking-[0.7px] text-muted";

const relationshipLabelClass =
  "mb-[10px] block text-xs font-extrabold tracking-[0.7px] text-muted";

const fieldInputClass =
  "w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-ink outline-none placeholder:text-input-placeholder";

const fieldErrorTextClass = "mt-2 text-[12.5px] text-input-error-text";

function fieldBorderClass(error: string | undefined): string {
  return error === undefined
    ? "border-input-border"
    : "border-input-error-border";
}

function validateLinkParentForm(
  values: LinkParentFormValues,
  errorMessages: LinkParentModalData["errorMessages"],
): LinkParentFormErrors {
  const errors: LinkParentFormErrors = {};

  if (values.name.trim().length === 0) {
    errors.name = errorMessages.nameRequired;
  }

  const email = values.email.trim();
  if (email.length === 0) {
    errors.email = errorMessages.emailRequired;
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = errorMessages.emailInvalid;
  }

  return errors;
}

export function LinkParentModal({
  isOpen,
  childId,
  childName,
  onClose,
}: LinkParentModalProps) {
  const [values, setValues] = useState<LinkParentFormValues>(EMPTY_FORM_VALUES);
  const [errors, setErrors] = useState<LinkParentFormErrors>(EMPTY_FORM_ERRORS);
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const emailInputRef = useRef<HTMLInputElement | null>(null);
  const data = linkParentModalData;
  const firstName = childName.split(" ")[0];
  const isSubmitting = status === "submitting";

  const handleClose = useCallback(() => {
    setValues(EMPTY_FORM_VALUES);
    setErrors(EMPTY_FORM_ERRORS);
    setStatus("idle");
    setServerError(null);
    onClose();
  }, [onClose]);

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
    nameInputRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, handleClose]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setStatus("idle");
    setServerError(null);

    const formErrors = validateLinkParentForm(values, data.errorMessages);
    setErrors(formErrors);

    if (formErrors.name !== undefined) {
      nameInputRef.current?.focus();
      return;
    }
    if (formErrors.email !== undefined) {
      emailInputRef.current?.focus();
      return;
    }

    setStatus("submitting");
    setServerError(null);

    const result = await sendInvitationAction(childId, childName, values);

    if (result.error) {
      setStatus("error");
      setServerError(result.error);
      return;
    }

    setStatus("success");
    handleClose();
  };

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
        className={`absolute inset-0 flex overflow-y-auto bg-ink/35 p-4 transition-opacity duration-200 sm:px-6 sm:py-10 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="link-parent-modal-title"
          className={`m-auto w-full max-w-[480px] overflow-hidden rounded-[24px] border border-line bg-modal-surface shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)] transition-[opacity,scale] duration-200 ${
            isOpen ? "scale-100 opacity-100" : "scale-[0.98] opacity-0"
          }`}
        >
          <div className="flex items-center justify-between border-b border-line px-[26px] py-5">
            <div>
              <h2
                id="link-parent-modal-title"
                className="font-display text-[18px] font-semibold text-ink"
              >
                {data.title}
              </h2>
              <p className="text-[13px] text-muted-light">
                {data.subtitlePrefix}
                {childName}
              </p>
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar"
              className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-close-button-bg text-muted"
            >
              <CloseIcon className="h-[18px] w-[18px]" />
            </button>
          </div>

          <form noValidate onSubmit={handleSubmit} className="px-[26px] py-[22px]">
            <div className="mb-5 flex gap-[11px] rounded-[14px] bg-info-box-bg px-4 py-[13px]">
              <InfoIcon className="mt-px h-5 w-5 flex-none text-info-icon" />
              <p className="text-[13.5px] leading-[1.45] text-info-text">
                {data.infoText.replace("{firstName}", firstName)}
              </p>
            </div>

            <label htmlFor="link-parent-name" className={fieldLabelClass}>
              {data.nameLabel}
            </label>
            <div className="mb-[18px]">
              <input
                ref={nameInputRef}
                id="link-parent-name"
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

            <label htmlFor="link-parent-email" className={fieldLabelClass}>
              {data.emailLabel}
            </label>
            <div className="mb-[18px]">
              <input
                ref={emailInputRef}
                id="link-parent-email"
                type="email"
                value={values.email}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    email: event.target.value,
                  }));
                  setErrors((current) =>
                    current.email === undefined
                      ? current
                      : { ...current, email: undefined },
                  );
                }}
                placeholder={data.emailPlaceholder}
                className={`${fieldInputClass} ${fieldBorderClass(errors.email)}`}
              />
              {errors.email !== undefined && (
                <p className={fieldErrorTextClass}>{errors.email}</p>
              )}
            </div>

            <fieldset className="mb-5">
              <legend className={relationshipLabelClass}>
                {data.relationshipLabel}
              </legend>
              <div className="flex gap-[9px]">
                {data.relationshipOptions.map((option) => {
                  const isSelected = values.relationship === option.value;

                  return (
                    <label
                      key={option.value}
                      className={`flex flex-1 cursor-pointer items-center justify-center rounded-full border-[1.5px] p-[11px] text-[14px] font-extrabold ${
                        isSelected
                          ? "border-relationship-selected-border bg-relationship-selected-bg text-info-icon"
                          : "border-line bg-surface text-nav-muted"
                      }`}
                    >
                      <input
                        type="radio"
                        name="link-parent-relationship"
                        value={option.value}
                        checked={isSelected}
                        onChange={() =>
                          setValues((current) => ({
                            ...current,
                            relationship: option.value,
                          }))
                        }
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-[9px] rounded-[14px] p-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] [background:linear-gradient(180deg,#F4977E,#EE8164)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? (
                <span
                  aria-hidden="true"
                  className="h-[19px] w-[19px] animate-spin rounded-full border-2 border-white/40 border-t-white"
                />
              ) : (
                <SendIcon className="h-[19px] w-[19px]" />
              )}
              {isSubmitting ? "Enviando…" : data.submitLabel}
            </button>

            {status === "error" && serverError !== null && (
              <p role="alert" className={fieldErrorTextClass}>
                {serverError}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
