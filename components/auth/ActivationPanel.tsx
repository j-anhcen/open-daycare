import Link from "next/link";

import type { ActivationPageData } from "@/app/_data/auth";
import { ActivationForm } from "@/components/auth/ActivationForm";
import { SunIcon } from "@/components/shared/icons";

type ActivationPanelProps = {
  data: ActivationPageData;
  code: string;
  email: string;
  childName: string;
  roomName: string;
};

export function ActivationPanel({
  data,
  code,
  email,
  childName,
  roomName,
}: ActivationPanelProps) {
  const childInitial = childName.charAt(0).toUpperCase();
  const childLabel = `${childName} · Sala ${roomName}`;

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
          {childInitial}
        </span>
        <div>
          <div className="text-[13px] text-muted">{data.invitedToLabel}</div>
          <div className="font-display text-[17px] font-semibold text-ink">
            {childLabel}
          </div>
        </div>
      </div>

      <ActivationForm
        code={code}
        email={email}
        codeLabel={data.codeLabel}
        emailLabel={data.emailLabel}
        passwordLabel={data.passwordLabel}
        passwordPlaceholder={data.passwordPlaceholder}
        consentLabel={data.consentLabel}
        submitLabel={data.submitLabel}
        errorMessages={data.errorMessages}
      />

      <p className="m-0 mt-[22px] text-center text-[14.5px] text-muted">
        {data.loginQuestion}{" "}
        <Link href="/login" className="font-extrabold text-accent-strong">
          {data.loginLinkLabel}
        </Link>
      </p>
    </div>
  );
}
