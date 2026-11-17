import type { Kid, LinkedParent, ParentStatus } from "@/app/_data/kids";
import { Avatar } from "@/components/shared/Avatar";
import { PlusIcon } from "@/components/shared/icons";

type LinkedParentsCardProps = {
  kid: Kid;
};

const statusBadges: Record<
  ParentStatus,
  { label: string; className: string }
> = {
  active: {
    label: "ACTIVA",
    className: "bg-parent-status-active-bg text-parent-status-active-fg",
  },
  pending: {
    label: "PENDIENTE",
    className: "bg-parent-status-pending-bg text-parent-status-pending-fg",
  },
};

function ParentRow({ parent }: { parent: LinkedParent }) {
  const badge = statusBadges[parent.status];

  return (
    <div className="flex items-center gap-3">
      <Avatar
        initial={parent.initial}
        color={parent.avatarColor}
        size={40}
        variant="solid"
      />
      <div className="min-w-0 flex-1">
        <div className="text-[14.5px] font-extrabold text-ink">
          {parent.name}
        </div>
        <div className="text-[12.5px] text-muted-light">
          {parent.roleLabel} · {parent.statusLabel}
        </div>
      </div>
      <span
        className={`flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold ${badge.className}`}
      >
        {badge.label}
      </span>
    </div>
  );
}

export function LinkedParentsCard({ kid }: LinkedParentsCardProps) {
  return (
    <div className="rounded-[16px] border border-line bg-surface px-[18px] py-4">
      <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-muted-strong">
        PADRES VINCULADOS
      </div>
      <div className="flex flex-col gap-[14px]">
        {kid.parents.map((parent) => (
          <ParentRow key={parent.name} parent={parent} />
        ))}
        <a href="#" className="flex items-center gap-3 pt-2">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-muted-faint">
            <PlusIcon className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </span>
          <span className="text-[14.5px] font-extrabold text-accent-strong">
            Vincular otro padre
          </span>
        </a>
      </div>
    </div>
  );
}
