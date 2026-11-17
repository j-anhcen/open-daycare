import Link from "next/link";

import type { ActivationPageData } from "@/app/_data/auth";
import { CheckIcon, SunIcon } from "@/components/shared/icons";

type ActivationPanelProps = {
  data: ActivationPageData;
};

const fieldLabelClassName =
  "mb-2 text-[12px] font-bold tracking-[0.7px] text-muted";

export function ActivationPanel({ data }: ActivationPanelProps) {
  return (
    <div className="w-full max-w-[440px]">
      <span className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
        <SunIcon className="h-[30px] w-[30px]" />
      </span>
      <h1 className="m-0 mb-2 font-display text-[32px] font-semibold leading-[1.15] text-ink">
        {data.title}
      </h1>
      <p className="m-0 mb-[26px] text-[15.5px] leading-[1.55] text-muted">
        {data.intro}
      </p>

      <div className="mb-[22px] flex items-center gap-[14px] rounded-[16px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px]">
        <span className="flex h-11 w-11 flex-none items-center justify-center rounded-full bg-avatar-blue-bg font-display text-[19px] font-semibold text-avatar-blue-fg">
          {data.childInitial}
        </span>
        <div>
          <div className="text-[13px] text-muted">{data.invitedToLabel}</div>
          <div className="font-display text-[17px] font-semibold text-ink">
            {data.childLabel}
          </div>
        </div>
      </div>

      <div className={fieldLabelClassName}>{data.codeLabel}</div>
      <input
        defaultValue={data.prefillCode}
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] font-display text-[18px] font-bold tracking-[3px] text-ink"
      />
      <div className={fieldLabelClassName}>{data.emailLabel}</div>
      <input
        type="email"
        defaultValue={data.prefillEmail}
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] text-[15px] text-ink"
      />
      <div className={fieldLabelClassName}>{data.passwordLabel}</div>
      <input
        type="password"
        defaultValue={data.prefillPassword}
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#F2A78E] bg-white px-4 py-[14px] text-[15px] text-ink"
      />

      <label className="mb-6 flex cursor-pointer items-start gap-3 rounded-[14px] bg-consent-box-bg px-4 py-[14px]">
        <input type="checkbox" defaultChecked className="peer sr-only" />
        <span className="mt-px flex h-6 w-6 flex-none items-center justify-center rounded-[8px] bg-white transition-colors peer-checked:bg-consent-check [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
          <CheckIcon className="h-[15px] w-[15px] text-white" />
        </span>
        <span className="text-[14px] leading-[1.45] text-consent-box-text">
          {data.consentLabel}
        </span>
      </label>

      <a
        href="#"
        className="block rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
      >
        {data.submitLabel}
      </a>
      <p className="m-0 mt-[22px] text-center text-[14.5px] text-muted">
        {data.loginQuestion}{" "}
        <Link
          href="/login"
          className="font-extrabold text-accent-strong"
        >
          {data.loginLinkLabel}
        </Link>
      </p>
    </div>
  );
}
