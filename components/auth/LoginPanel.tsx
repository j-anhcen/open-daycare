import Link from "next/link";

import type { LoginPageData } from "@/app/_data/auth";

type LoginPanelProps = {
  data: LoginPageData;
};

const fieldLabelClassName =
  "mb-2 text-[12px] font-bold tracking-[0.7px] text-muted";

export function LoginPanel({ data }: LoginPanelProps) {
  return (
    <div className="w-full max-w-[392px]">
      <h2 className="m-0 mb-[6px] font-display text-[30px] font-semibold text-ink">
        {data.title}
      </h2>
      <p className="m-0 mb-[28px] text-[15px] text-muted">{data.subtitle}</p>

      <div className={fieldLabelClassName}>{data.emailLabel}</div>
      <input
        type="email"
        defaultValue={data.prefillEmail}
        className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] text-[15px] text-ink"
      />
      <div className={fieldLabelClassName}>{data.passwordLabel}</div>
      <input
        type="password"
        placeholder={data.passwordPlaceholder}
        className="mb-[10px] w-full rounded-[14px] border-[1.5px] border-auth-input-border bg-white px-4 py-[14px] text-[15px] text-ink placeholder:text-[#B6A99B]"
      />
      <div className="mb-5 text-right">
        <a
          href="#"
          className="text-[13.5px] font-bold text-accent-strong"
        >
          {data.forgotPasswordLabel}
        </a>
      </div>

      <a
        href="#"
        className="block rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
      >
        {data.submitLabel}
      </a>

      <p className="m-0 mt-6 text-center text-[14.5px] text-muted">
        {data.signupQuestion}{" "}
        <Link
          href="/activar-cuenta"
          className="font-extrabold text-accent-strong"
        >
          {data.signupLinkLabel}
        </Link>
      </p>
    </div>
  );
}
