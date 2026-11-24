"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useActionState, type FormEvent } from "react";

import {
  sendInvitationAction,
  type SendInvitationResult,
} from "@/app/actions/invitations";
import { Modal } from "@/components/shared/Modal";
import { CloseIcon, InfoIcon, SendIcon } from "@/components/shared/icons";
import {
  isValidEmail,
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

type LinkParentFormProps = {
  childId: string;
  childName: string;
  onClose: () => void;
  onPendingChange: (isPending: boolean) => void;
};

type LinkParentFormErrors = {
  name?: string;
  email?: string;
};

const EMPTY_FORM_VALUES: LinkParentFormValues = {
  name: "",
  email: "",
  relationship: "mother",
};

const EMPTY_FORM_ERRORS: LinkParentFormErrors = {};

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
  } else if (!isValidEmail(email)) {
    errors.email = errorMessages.emailInvalid;
  }

  return errors;
}

/**
 * Dialog shell. The form is keyed and remounted on every close so the next
 * open starts fresh (no stale submission results, matching AddKidModal).
 * While the server action is pending the modal cannot be dismissed, so a
 * submission can never land on a hidden dialog.
 */
export function LinkParentModal({
  isOpen,
  childId,
  childName,
  onClose,
}: LinkParentModalProps) {
  const [formEpoch, setFormEpoch] = useState(0);
  const [isFormPending, setIsFormPending] = useState(false);

  const requestClose = useCallback(() => {
    if (isFormPending) {
      return;
    }
    setFormEpoch((current) => current + 1);
    setIsFormPending(false);
    onClose();
  }, [isFormPending, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={requestClose}
      dismissDisabled={isFormPending}
      titleId="link-parent-modal-title"
      panelClassName="m-auto max-w-[480px] overflow-hidden rounded-[24px] border border-line bg-modal-surface shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
      initialFocusSelector="#link-parent-name"
    >
      <LinkParentForm
        key={formEpoch}
        childId={childId}
        childName={childName}
        onClose={requestClose}
        onPendingChange={setIsFormPending}
      />
    </Modal>
  );
}

function LinkParentForm({
  childId,
  childName,
  onClose,
  onPendingChange,
}: LinkParentFormProps) {
  const [values, setValues] = useState<LinkParentFormValues>(EMPTY_FORM_VALUES);
  const [errors, setErrors] = useState<LinkParentFormErrors>(EMPTY_FORM_ERRORS);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [serverState, formAction, isPending] = useActionState<
    SendInvitationResult | undefined,
    FormData
  >(sendInvitationAction.bind(null, childId, childName), undefined);
  const data = linkParentModalData;
  const firstName = childName.split(" ")[0];

  // Keeps the dialog shell aware of in-flight submissions.
  useEffect(() => {
    onPendingChange(isPending);
  }, [isPending, onPendingChange]);

  // A successful submission closes the dialog (pattern of AddChildForm).
  useEffect(() => {
    if (serverState?.success) {
      onClose();
    }
  }, [serverState?.success, onClose]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    if (isPending) {
      event.preventDefault();
      return;
    }

    const formErrors = validateLinkParentForm(values, data.errorMessages);
    setErrors(formErrors);

    if (formErrors.name !== undefined || formErrors.email !== undefined) {
      event.preventDefault();
      if (formErrors.name !== undefined) {
        nameInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    }
  }

  return (
    <>
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
          onClick={onClose}
          aria-label="Cerrar"
          aria-disabled={isPending}
          className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-close-button-bg text-muted"
        >
          <CloseIcon className="h-[18px] w-[18px]" />
        </button>
      </div>

      <form
        noValidate
        action={formAction}
        onSubmit={handleSubmit}
        className="px-[26px] py-[22px]"
      >
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
            name="name"
            type="text"
            aria-invalid={errors.name !== undefined}
            aria-describedby={
              errors.name === undefined ? undefined : "link-parent-name-error"
            }
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
            <p id="link-parent-name-error" className={fieldErrorTextClass}>
              {errors.name}
            </p>
          )}
        </div>

        <label htmlFor="link-parent-email" className={fieldLabelClass}>
          {data.emailLabel}
        </label>
        <div className="mb-[18px]">
          <input
            ref={emailInputRef}
            id="link-parent-email"
            name="email"
            type="email"
            aria-invalid={errors.email !== undefined}
            aria-describedby={
              errors.email === undefined ? undefined : "link-parent-email-error"
            }
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
            <p id="link-parent-email-error" className={fieldErrorTextClass}>
              {errors.email}
            </p>
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
                  className={`flex flex-1 cursor-pointer items-center justify-center rounded-full border-[1.5px] p-[11px] text-[14px] font-extrabold has-focus-visible:ring-2 has-focus-visible:ring-ink/40 ${
                    isSelected
                      ? "border-relationship-selected-border bg-relationship-selected-bg text-info-icon"
                      : "border-line bg-surface text-nav-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="relationship"
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
          disabled={isPending}
          className="flex w-full items-center justify-center gap-[9px] rounded-[14px] p-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] [background:linear-gradient(180deg,#F4977E,#EE8164)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <span
              aria-hidden="true"
              className="h-[19px] w-[19px] animate-spin rounded-full border-2 border-white/40 border-t-white"
            />
          ) : (
            <SendIcon className="h-[19px] w-[19px]" />
          )}
          {isPending ? "Enviando…" : data.submitLabel}
        </button>

        {serverState?.error !== undefined && (
          <p role="alert" className={fieldErrorTextClass}>
            {serverState.error}
          </p>
        )}
      </form>
    </>
  );
}
