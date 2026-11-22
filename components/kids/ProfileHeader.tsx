import type { ChildWithRoom } from "@/lib/dal/children";
import { ageLabel } from "@/lib/age";
import { avatarColorFor } from "@/lib/avatar";
import { Avatar } from "@/components/shared/Avatar";

type ProfileHeaderProps = {
  child: ChildWithRoom;
};

// Identity block only. The "Volver a Niños" link is rendered by the page
// above the two-column layout so this block can stay inside the left
// column, exactly as the mockup lays it out.
export function ProfileHeader({ child }: ProfileHeaderProps) {
  return (
    <div className="flex items-center gap-[18px]">
      <Avatar
        initial={child.full_name.charAt(0).toUpperCase()}
        color={avatarColorFor(child.full_name)}
        size={84}
      />
      <div className="min-w-0 flex-1">
        <h1 className="m-0 font-display text-[28px] font-semibold text-ink">
          {child.full_name}
        </h1>
        <p className="m-0 mt-[3px] text-[15px] text-muted">
          {ageLabel(child.birth_date)} · Sala {child.rooms?.name ?? ""}
        </p>
      </div>
      <button
        type="button"
        className="flex-none rounded-[12px] border-[1.5px] border-line bg-surface px-4 py-[9px] text-[14px] font-bold text-nav-muted"
      >
        Editar
      </button>
    </div>
  );
}
