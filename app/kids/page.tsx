import type { Metadata } from "next";
import { Suspense } from "react";

import { kidsPageData } from "@/app/_data/kids";
import { KidsBoard } from "@/components/kids/KidsBoard";
import {
  CurrentUserMobileMenu,
  CurrentUserSidebar,
} from "@/components/layout/CurrentUserNavigation";

export const metadata: Metadata = {
  title: "Niños · OpenDayCare",
  description:
    "Listado de niños de la sala Soles: perfiles, alergias y padres vinculados.",
};

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={null}>
        <CurrentUserMobileMenu activeItem="kids" />
      </Suspense>

      <div className="md:flex">
        <Suspense fallback={null}>
          <CurrentUserSidebar
            activeItem="kids"
            className="sticky top-0 hidden h-screen w-[248px] shrink-0 md:flex"
          />
        </Suspense>

        <main className="min-w-0 flex-1 md:h-screen md:overflow-y-auto">
          <div className="mx-auto w-full max-w-[880px] px-4 pt-6 pb-16 sm:px-6 md:px-10 md:pt-[34px] md:pb-20">
            <KidsBoard data={kidsPageData} />
          </div>
        </main>
      </div>
    </div>
  );
}
