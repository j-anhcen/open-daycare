"use client";

import { useActionState, useState } from "react";

import {
  acceptInvitationAction,
  type AcceptInvitationState,
} from "@/app/actions/invitations";
import type { ActivationPageData } from "@/app/_data/auth";
import { CheckIcon } from "@/components/shared/icons";

type ActivationFormProps = {
  code: string;
  email: string;
  codeLabel: string;
  emailLabel: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  consentLabel: string;
  submitLabel: string;
  errorMessages: ActivationPageData["errorMessages"];
};

type FieldErrors = {
  password?: string;
  consent?: string;
};

const fieldLabelClassName =
  "mb-2 text-[12px] font-bold tracking-[0.7px] text-muted";

export function ActivationForm({
  code,
  email,
  codeLabel,
  emailLabel,
  passwordLabel,
  passwordPlaceholder,
  consentLabel,
  submitLabel,
  errorMessages,
}: ActivationFormProps) {
  const [state, formAction, pending] = useActionState<
    AcceptInvitationState | undefined,
    FormData
  >(acceptInvitationAction, undefined);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const consent = formData.get("consent");
    const nextErrors: FieldErrors = {};

    if (!password) {
      nextErrors.password = errorMessages.passwordRequired;
    } else if (password.length < 6) {
      nextErrors.password = errorMessages.passwordTooShort;
    }

    if (consent !== "on") {
      nextErrors.consent = errorMessages.consentRequired;
    }

    if (nextErrors.password || nextErrors.consent) {
      event.preventDefault();
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="code" value={code} />

      <div className={fieldLabelClassName}>{codeLabel}</div>
      <input
        name="displayCode"
        value={code}
        readOnly
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] font-display text-[18px] font-bold tracking-[3px] text-ink"
      />

      <div className={fieldLabelClassName}>{emailLabel}</div>
      <input
        type="email"
        name="email"
        defaultValue={email}
        autoComplete="email"
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] text-[15px] text-ink"
      />

      <div className={fieldLabelClassName}>{passwordLabel}</div>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder={passwordPlaceholder}
        aria-invalid={fieldErrors.password ? true : undefined}
        className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-ink placeholder:text-[#B6A99B]"
      />
      {fieldErrors.password ? (
        <p className="mb-[18px] text-[12.5px] text-input-error-text" role="alert">
          {fieldErrors.password}
        </p>
      ) : (
        <div className="mb-[8px]" />
      )}

      <label className="mb-2 flex cursor-pointer items-start gap-3 rounded-[14px] bg-consent-box-bg px-4 py-[14px]">
        <input type="checkbox" name="consent" className="peer sr-only" />
        <span className="mt-px flex h-6 w-6 flex-none items-center justify-center rounded-[8px] bg-white transition-colors peer-checked:bg-consent-check [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <CheckIcon className="h-[15px] w-[15px] text-white" />
        </span>
        <span className="text-[14px] leading-[1.45] text-consent-box-text">
          {consentLabel}
        </span>
      </label>
      {fieldErrors.consent ? (
        <p className="mb-6 text-[12.5px] text-input-error-text" role="alert">
          {fieldErrors.consent}
        </p>
      ) : (
        <div className="mb-4" />
      )}

      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-70"
      >
        {submitLabel}
      </button>
      {state?.error ? (
        <p className="mt-2 text-[12.5px] text-input-error-text" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
