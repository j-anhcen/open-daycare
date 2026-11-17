"use client";

import { useEffect, useState } from "react";
import type { FeedPageData } from "@/app/_data/mock";
import { CloseIcon, MenuIcon, SunIcon } from "@/components/shared/icons";
import { Sidebar } from "./Sidebar";

type MobileMenuProps = {
  currentUser: FeedPageData["currentUser"];
};

export function MobileMenu({ currentUser }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-surface px-4 py-3">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Abrir menú"
          aria-expanded={isOpen}
          aria-controls="mobile-navigation-drawer"
          className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-background text-ink"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
        <a href="#" className="flex items-center gap-[11px]">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
            <SunIcon className="h-5 w-5 text-white" />
          </span>
          <span>
            <span className="block font-display text-[16px] font-semibold leading-none text-ink">
              OpenDayCare
            </span>
            <span className="mt-0.5 block text-[11px] text-muted-light">
              Sala Soles
            </span>
          </span>
        </a>
      </header>

      <div
        id="mobile-navigation-drawer"
        inert={!isOpen}
        className={`fixed inset-0 z-50 ${isOpen ? "" : "pointer-events-none"}`}
      >
        <button
          type="button"
          tabIndex={isOpen ? 0 : -1}
          onClick={close}
          aria-label="Cerrar menú"
          className={`absolute inset-0 bg-ink/35 transition-opacity duration-200 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[248px] max-w-[85vw] bg-surface shadow-2xl transition-transform duration-200 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar currentUser={currentUser} className="h-full w-full" />
          <button
            type="button"
            onClick={close}
            tabIndex={isOpen ? 0 : -1}
            aria-label="Cerrar menú"
            className="absolute right-3 top-4 flex h-8 w-8 items-center justify-center rounded-[10px] bg-background text-muted"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
