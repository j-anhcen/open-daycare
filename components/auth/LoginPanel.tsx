import Link from "next/link";

import type { LoginPageData } from "@/app/_data/auth";
import { LoginForm } from "@/components/auth/LoginForm";

type LoginPanelProps = {
  data: LoginPageData;
};

export function LoginPanel({ data }: LoginPanelProps) {
  return (
    <div className="w-full max-w-[392px]">
      <h2 className="m-0 mb-[6px] font-display text-[30px] font-semibold text-ink">
        {data.title}
      </h2>
      <p className="m-0 mb-[28px] text-[15px] text-muted">{data.subtitle}</p>

      <LoginForm
        emailLabel={data.emailLabel}
        passwordLabel={data.passwordLabel}
        forgotPasswordLabel={data.forgotPasswordLabel}
        submitLabel={data.submitLabel}
        emailPlaceholder={data.emailPlaceholder}
        passwordPlaceholder={data.passwordPlaceholder}
      />

      <p className="m-0 mt-6 text-center text-[14.5px] text-muted">
        {data.signupQuestion}{" "}
        <Link
          href="/accept-invitation"
          className="font-extrabold text-accent-strong"
        >
          {data.signupLinkLabel}
        </Link>
      </p>
    </div>
  );
}
