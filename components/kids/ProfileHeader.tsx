import type { Kid } from "@/app/_data/kids";
import { Avatar } from "@/components/shared/Avatar";

type ProfileHeaderProps = {
  kid: Kid;
};

// Identity block only. The "Volver a Niños" link is rendered by the page
// above the two-column layout so this block can stay inside the left
// column, exactly as the mockup lays it out.
export function ProfileHeader({ kid }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-[18px]">
      <Avatar initial={kid.initial} color={kid.avatarColor} size={84} />
      <div className="min-w-0 flex-1">
        <h1 className="m-0 font-display text-[28px] font-semibold text-ink">
          {kid.name}
        </h1>
        <p className="m-0 mt-[3px] text-[15px] text-muted">
          {kid.ageLabel} · Sala {kid.roomLabel}
        </p>
      </div>
      <a
        href="#"
        className="flex-none rounded-[12px] border-[1.5px] border-line bg-surface px-4 py-[9px] text-[14px] font-bold text-nav-muted"
      >
        Editar
      </a>
    </div>
  );
}
