import Link from "next/link";
import type { Kid } from "@/app/_data/kids";
import { Avatar } from "@/components/shared/Avatar";
import { ChevronRightIcon } from "@/components/shared/icons";

type KidCardProps = {
  kid: Kid;
};

const chipBaseClass =
  "flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold";

function parentsCountLabel(count: number): string {
  if (count === 0) {
    return "sin padres vinculados";
  }

  if (count === 1) {
    return "1 padre vinculado";
  }

  return `${count} padres vinculados`;
}

function KidCardTrailing({ kid }: KidCardProps) {
  if (kid.parents.length > 0 && kid.allergyLabels.length === 0) {
    return (
      <ChevronRightIcon className="h-[18px] w-[18px] flex-none text-[#CBB89F]" />
    );
  }

  return (
    <span className="flex flex-none items-center gap-2">
      {kid.allergyLabels.map((label, index) => (
        <span
          key={`${label}-${index}`}
          className={`${chipBaseClass} bg-allergy-chip-bg text-allergy-chip-fg`}
        >
          {label}
        </span>
      ))}
      {kid.parents.length === 0 && (
        <span className={`${chipBaseClass} bg-link-chip-bg text-link-chip-fg`}>
          VINCULAR
        </span>
      )}
    </span>
  );
}

export function KidCard({ kid }: KidCardProps) {
  return (
    <Link
      href={`/kids/${kid.id}`}
      className="flex min-w-0 items-center gap-[14px] rounded-[18px] border border-line bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition hover:-translate-y-[2px] hover:border-[#F2A78E]"
    >
      <Avatar initial={kid.initial} color={kid.avatarColor} size={48} />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[16px] font-semibold text-ink">
          {kid.name}
        </div>
        <div className="text-[13px] text-muted-light">
          {kid.ageLabel} · {parentsCountLabel(kid.parents.length)}
        </div>
      </div>
      <KidCardTrailing kid={kid} />
    </Link>
  );
}
