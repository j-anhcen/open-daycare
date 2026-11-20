import Link from "next/link";

import { logoutAction } from "@/app/actions/auth";
import type { StaffUser } from "@/app/_data/mock";
import { ComposeButton } from "@/components/feed/ComposeButton";
import {
  BellIcon,
  ChildrenIcon,
  HomeIcon,
  LogoutIcon,
  SunIcon,
  UserIcon,
} from "@/components/shared/icons";

export type NavItemId = "feed" | "kids" | "notices" | "account";

const navigationItems = [
  { id: "feed", label: "Feed", href: "/", icon: HomeIcon },
  { id: "kids", label: "Niños", href: "/kids", icon: ChildrenIcon },
  { id: "notices", label: "Avisos", href: "/avisos", icon: BellIcon },
  { id: "account", label: "Mi cuenta", href: "/mi-cuenta", icon: UserIcon },
];

type SidebarProps = {
  currentUser: StaffUser;
  activeItem: NavItemId;
  className?: string;
  onNavigate?: () => void;
};

export function Sidebar({
  currentUser,
  activeItem,
  className = "",
  onNavigate,
}: SidebarProps) {
  return (
    <aside
      className={`flex flex-col border-r border-line bg-surface px-4 py-6 ${className}`}
    >
      <Link
        href="/"
        onNavigate={onNavigate}
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
      </Link>

      <ComposeButton onNavigate={onNavigate} />

      <nav className="flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === activeItem;

          const itemClassName = isActive
            ? "flex items-center gap-3 rounded-xl bg-accent-soft px-3 py-[11px] text-[14.5px] font-extrabold text-accent-label"
            : "flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] font-semibold text-nav-muted";

          return (
            <Link
              key={item.id}
              href={item.href}
              onNavigate={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={itemClassName}
            >
              <Icon className="h-[19px] w-[19px]" />
              {item.label}
            </Link>
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
          <form action={logoutAction}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-background text-muted"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
