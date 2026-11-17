import type { FeedPageData } from "@/app/_data/mock";
import {
  BellIcon,
  ChildrenIcon,
  HomeIcon,
  LogoutIcon,
  PlusIcon,
  SunIcon,
  UserIcon,
} from "@/components/shared/icons";

const navigationItems = [
  { label: "Feed", href: "#", icon: HomeIcon, active: true },
  { label: "Niños", href: "#", icon: ChildrenIcon, active: false },
  { label: "Avisos", href: "#", icon: BellIcon, active: false },
  { label: "Mi cuenta", href: "#", icon: UserIcon, active: false },
];

type SidebarProps = {
  currentUser: FeedPageData["currentUser"];
  className?: string;
};

export function Sidebar({ currentUser, className = "" }: SidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-line bg-surface px-4 py-6 ${className}`}
    >
      <a
        href="#"
        className="flex items-center gap-[11px] px-2 pt-1 pb-[22px]"
      >
        <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <SunIcon className="h-[21px] w-[21px] text-white" />
        </span>
        <span>
          <span className="block font-display text-[17px] font-semibold leading-none text-ink">
            OpenDayCare
          </span>
          <span className="mt-0.5 block text-[11.5px] text-muted-light">
            Sala Soles
          </span>
        </span>
      </a>

      <a
        href="#"
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] p-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <PlusIcon className="h-[17px] w-[17px]" />
        Nueva publicación
      </a>

      <nav className="flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          return (
            <a
              key={item.label}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={
                item.active
                  ? "flex items-center gap-3 rounded-xl bg-accent-soft px-3 py-[11px] text-[14.5px] font-extrabold text-accent-label"
                  : "flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] font-semibold text-nav-muted"
              }
            >
              <Icon className="h-[19px] w-[19px]" />
              {item.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-[10px] border-t border-line pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-1.5">
          <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full bg-staff-avatar font-display text-[16px] font-semibold text-white">
            {currentUser.initial}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-extrabold text-ink">
              {currentUser.name}
            </div>
            <div className="text-[12px] text-muted-light">
              {currentUser.roleLabel}
            </div>
          </div>
          <a
            href="#"
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
            className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-background text-muted"
          >
            <LogoutIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
    </aside>
  );
}
