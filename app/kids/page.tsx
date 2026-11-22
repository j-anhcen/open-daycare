import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { KidsBoard } from "@/components/kids/KidsBoard";
import {
  CurrentUserMobileMenu,
  CurrentUserSidebar,
} from "@/components/layout/CurrentUserNavigation";
import { getChildren } from "@/lib/dal/children";
import { getRooms } from "@/lib/dal/rooms";

export const metadata: Metadata = {
  title: "Niños · OpenDayCare",
  description:
    "Listado de niños de la guardería: perfiles, alergias y padres vinculados.",
};

async function KidsContent() {
  // Supabase's client reads the clock, so this subtree must render at request
  // time rather than during prerendering.
  await connection();
  const [rooms, children] = await Promise.all([getRooms(), getChildren()]);

  return <KidsBoard rooms={rooms} kids={children} />;
}

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
            <Suspense fallback={null}>
              <KidsContent />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
