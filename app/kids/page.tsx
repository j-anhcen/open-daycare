import type { Metadata } from "next";
import { kidsPageData } from "@/app/_data/kids";
import { currentUser } from "@/app/_data/mock";
import { KidsBoard } from "@/components/kids/KidsBoard";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Niños · OpenDayCare",
  description:
    "Listado de niños de la sala Soles: perfiles, alergias y padres vinculados.",
};

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileMenu currentUser={currentUser} activeItem="kids" />

      <div className="md:flex">
        <Sidebar
          currentUser={currentUser}
          activeItem="kids"
          className="sticky top-0 hidden h-screen w-[248px] shrink-0 md:flex"
        />

        <main className="min-w-0 flex-1 md:h-screen md:overflow-y-auto">
          <div className="mx-auto w-full max-w-[880px] px-4 pt-6 pb-16 sm:px-6 md:px-10 md:pt-[34px] md:pb-20">
            <KidsBoard data={kidsPageData} />
          </div>
        </main>
      </div>
    </div>
  );
}
