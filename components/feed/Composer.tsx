import { CameraIcon } from "@/components/shared/icons";

type ComposerProps = {
  currentUserInitial: string;
  placeholder: string;
};

export function Composer({ currentUserInitial, placeholder }: ComposerProps) {
  return (
    <a
      href="#"
      className="mb-6 flex items-center gap-[14px] rounded-[18px] border border-line bg-surface px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]"
    >
      <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-staff-avatar font-display text-[16px] font-semibold text-white">
        {currentUserInitial}
      </span>
      <span className="flex-1 text-[15px] text-muted-light">{placeholder}</span>
      <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-accent-soft text-accent">
        <CameraIcon className="h-[19px] w-[19px]" />
      </span>
    </a>
  );
}
