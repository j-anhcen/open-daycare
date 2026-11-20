"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/actions/auth";

type LoginFormProps = {
  emailLabel: string;
  passwordLabel: string;
  forgotPasswordLabel: string;
  submitLabel: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
};

const fieldLabelClassName =
  "mb-2 text-[12px] font-bold tracking-[0.7px] text-muted";

export function LoginForm({
  emailLabel,
  passwordLabel,
  forgotPasswordLabel,
  submitLabel,
  emailPlaceholder,
  passwordPlaceholder,
}: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);

  return (
    <form action={formAction}>
      <div className={fieldLabelClassName}>{emailLabel}</div>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder={emailPlaceholder}
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] text-[15px] text-ink placeholder:text-[#B6A99B]"
      />
      <div className={fieldLabelClassName}>{passwordLabel}</div>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder={passwordPlaceholder}
        className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] text-[15px] text-ink placeholder:text-[#B6A99B]"
      />
      <div className="mb-5 text-right">
        <a href="#" className="text-[13.5px] font-bold text-accent-strong">
          {forgotPasswordLabel}
        </a>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="block w-full rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)] disabled:opacity-70"
      >
        {submitLabel}
      </button>
      {state?.error && (
        <p className="mt-2 text-[12.5px] text-input-error-text" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
