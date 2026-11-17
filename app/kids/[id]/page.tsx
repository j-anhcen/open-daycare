import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getKidById, kidsPageData } from "@/app/_data/kids";
import { currentUser } from "@/app/_data/mock";
import { AllergyNoteCard } from "@/components/kids/AllergyNoteCard";
import { LinkedParentsCard } from "@/components/kids/LinkedParentsCard";
import { ProfileDetailsCard } from "@/components/kids/ProfileDetailsCard";
import { ProfileHeader } from "@/components/kids/ProfileHeader";
import { MobileMenu } from "@/components/layout/MobileMenu";
import { Sidebar } from "@/components/layout/Sidebar";
import { ArrowLeftIcon, SunIcon } from "@/components/shared/icons";

// Opt out of instant-navigation validation for this route: the page reads
// `params` at the render root (data is fully static and prerendered via
// generateStaticParams), so a blocking navigation is the intended behavior.
// Revisit with a <Suspense> shell if this route needs instant navigation.
export const instant = false;

export function generateStaticParams() {
  return kidsPageData.kids.map((kid) => ({ id: kid.id }));
}

export async function generateMetadata(
  props: PageProps<"/kids/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const kid = getKidById(id);

  if (!kid) {
    notFound();
  }

  return { title: `${kid.name} · OpenDayCare` };
}

export default async function KidProfilePage(props: PageProps<"/kids/[id]">) {
  const { id } = await props.params;
  const kid = getKidById(id);

  if (!kid) {
    notFound();
  }

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
          <div className="mx-auto w-full max-w-[820px] px-4 pt-6 pb-16 sm:px-6 md:px-10 md:pt-[34px] md:pb-20">
            <Link
              href="/kids"
              className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-muted"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" />
              Volver a Niños
            </Link>

            <div className="flex flex-wrap items-start gap-[26px]">
              <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
                <ProfileHeader kid={kid} />
                {kid.allergyNote ? (
                  <AllergyNoteCard note={kid.allergyNote} />
                ) : null}
                <ProfileDetailsCard kid={kid} />
              </div>

              <div className="flex w-[300px] flex-none flex-col gap-[14px]">
                <a
                  href="#"
                  className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-ink p-[13px] text-[15px] font-extrabold text-white"
                >
                  <SunIcon className="h-[18px] w-[18px]" strokeWidth={2} />
                  Resumen del día
                </a>
                <LinkedParentsCard kid={kid} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
