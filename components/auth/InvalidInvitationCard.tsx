import Link from "next/link";

import { SunIcon } from "@/components/shared/icons";

type InvalidInvitationCardProps = {
  title: string;
  message: string;
  loginLinkLabel: string;
};

export function InvalidInvitationCard({
  title,
  message,
  loginLinkLabel,
}: InvalidInvitationCardProps) {
  return (
    <div className="w-full max-w-[440px]">
      <span className="mb-[22px] flex h-[58px] w-[58px] items-center justify-center rounded-[18px] bg-[linear-gradient(155deg,#F8C3A8,#F2937A)] shadow-[0_12px_26px_-10px_rgba(238,129,100,0.65)]">
        <SunIcon className="h-[30px] w-[30px]" />
      </span>
      <h1 className="m-0 mb-2 font-display text-[32px] font-semibold leading-[1.15] text-ink">
        {title}
      </h1>
      <p className="m-0 mb-[26px] text-[15.5px] leading-[1.55] text-muted">
        {message}
      </p>

      <Link
        href="/login"
        className="block rounded-[15px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[15px] py-[15px] text-center text-[16px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
      >
        {loginLinkLabel}
      </Link>
    </div>
  );
}
