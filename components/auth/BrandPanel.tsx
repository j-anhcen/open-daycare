import { SunIcon } from "@/components/shared/icons";

import type { LoginPageData } from "@/app/_data/auth";

type BrandPanelProps = {
  data: LoginPageData;
};

export function BrandPanel({ data }: BrandPanelProps) {
  // The mockup breaks the headline after the comma; splitting the
  // single-string copy reproduces that two-line composition.
  const [headlineStart, ...headlineRest] = data.headline.split(", ");
  const headlineEnd = headlineRest.join(", ");

  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-[linear-gradient(155deg,#F6A98E_0%,#F2937A_45%,#EC7E62_100%)] px-[60px] py-[56px] text-white md:flex">
      <div className="absolute -top-[140px] -right-[120px] h-[420px] w-[420px] rounded-full bg-white/12" />
      <div className="absolute -bottom-[110px] -left-[80px] h-[300px] w-[300px] rounded-full bg-white/10" />

      <div className="relative flex items-center gap-[13px]">
        <span className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-white/[.22]">
          <SunIcon className="h-[26px] w-[26px]" />
        </span>
        <span className="font-display text-[21px] font-semibold tracking-[0.5px]">
          {data.brandName}
        </span>
      </div>

      <div className="relative">
        <h1 className="m-0 mb-[18px] font-display text-[42px] font-semibold leading-[1.12]">
          {headlineStart},
          <br />
          {headlineEnd}
        </h1>
        <p className="m-0 max-w-[430px] text-[17px] leading-[1.6] text-white/[.92]">
          {data.tagline}
        </p>
      </div>

      <div className="relative text-[14px] text-white/[.90]">
        {data.roomFooterLabel}
      </div>
    </div>
  );
}
