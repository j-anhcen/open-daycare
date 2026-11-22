import Link from "next/link";

import { Avatar } from "@/components/shared/Avatar";
import { ageLabel } from "@/lib/age";
import { avatarColorFor } from "@/lib/avatar";
import { reverseAllergyLabel } from "@/lib/allergies";

export type KidCardChild = {
  id: string;
  full_name: string;
  birth_date: string;
  room_id: string;
  allergy_tags: string[];
};

type KidCardProps = {
  child: KidCardChild;
};

const chipBaseClass =
  "flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold";

function KidCardTrailing({ child }: KidCardProps) {
  if (child.allergy_tags.length === 0) {
    return (
      <span className={`${chipBaseClass} bg-link-chip-bg text-link-chip-fg`}>
        VINCULAR
      </span>
    );
  }

  return (
    <span className="flex flex-none items-center gap-2">
      {child.allergy_tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className={`${chipBaseClass} bg-allergy-chip-bg text-allergy-chip-fg`}
        >
          {reverseAllergyLabel(tag).toUpperCase()}
        </span>
      ))}
    </span>
  );
}

export function KidCard({ child }: KidCardProps) {
  return (
    <Link
      href={`/kids/${child.id}`}
      className="flex min-w-0 items-center gap-[14px] rounded-[18px] border border-line bg-surface p-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition hover:-translate-y-[2px] hover:border-[#F2A78E]"
    >
      <Avatar
        initial={child.full_name.charAt(0).toUpperCase()}
        color={avatarColorFor(child.full_name)}
        size={48}
      />
      <div className="min-w-0 flex-1">
        <div className="font-display text-[16px] font-semibold text-ink">
          {child.full_name}
        </div>
        <div className="text-[13px] text-muted-light">
          {ageLabel(child.birth_date)} · sin padres vinculados
        </div>
      </div>
      <KidCardTrailing child={child} />
    </Link>
  );
}
