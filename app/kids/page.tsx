import type { Metadata } from "next";
import { kidsPageData } from "@/app/_data/kids";
import { currentUser } from "@/app/_data/mock";
import { KidCard } from "@/components/kids/KidCard";
import { KidsHeader } from "@/components/kids/KidsHeader";
import { KidsSearch } from "@/components/kids/KidsSearch";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Sidebar } from "@/components/layout/Sidebar";

export const metadata: Metadata = {
  title: "Niños · OpenDayCare",
  description:
    "Listado de niños de la sala Soles: perfiles, alergias y padres vinculados.",
};

export default function KidsPage() {
  const { eyebrowLabel, searchPlaceholder, roomLabel, kidsCountLabel, kids } =
    kidsPageData;

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
            <KidsHeader eyebrowLabel={eyebrowLabel} />
            <KidsSearch placeholder={searchPlaceholder} />

            <div className="mb-[14px] flex items-center gap-3">
              <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
                {roomLabel}
              </span>
              <span className="text-[13px] text-muted-light">
                {kidsCountLabel}
              </span>
              <span className="h-px flex-1 bg-[#E7DAC8]" />
            </div>

            <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
              {kids.map((kid) => (
                <KidCard key={kid.id} kid={kid} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
