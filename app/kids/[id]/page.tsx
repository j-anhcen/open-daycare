import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { AllergyNoteCard } from "@/components/kids/AllergyNoteCard";
import { KidProfileAside } from "@/components/kids/KidProfileAside";
import { ProfileDetailsCard } from "@/components/kids/ProfileDetailsCard";
import { ProfileHeader } from "@/components/kids/ProfileHeader";
import {
  CurrentUserMobileMenu,
  CurrentUserSidebar,
} from "@/components/layout/CurrentUserNavigation";
import { ArrowLeftIcon } from "@/components/shared/icons";
import { getChildById, type ChildWithRoom } from "@/lib/dal/children";
import { getInvitationsByChildId } from "@/lib/dal/invitations";
import { reverseAllergyLabel } from "@/lib/allergies";

// The shared layout contains a Client Component that reads usePathname()
// outside a Suspense boundary, and this route resolves a dynamic UUID param.
// Both need request-time rendering, so this segment stays blocking.
export const instant = false;

export async function generateMetadata(
  props: PageProps<"/kids/[id]">,
): Promise<Metadata> {
  await connection();
  const { id } = await props.params;
  const child = await getChildById(id);

  if (!child) {
    notFound();
  }

  return { title: `${child.full_name} · OpenDayCare` };
}

function buildAllergyNote(child: ChildWithRoom): string | null {
  const parts: string[] = [];

  if (child.allergy_tags.length > 0) {
    parts.push(
      `Alergias: ${child.allergy_tags.map(reverseAllergyLabel).join(", ")}`,
    );
  }
  if (child.medical_notes) {
    parts.push(child.medical_notes);
  }

  return parts.length > 0 ? parts.join(". ") : null;
}

async function KidProfileContent({ id }: { id: string }) {
  await connection();
  const child = await getChildById(id);

  if (!child) {
    notFound();
  }

  const allergyNote = buildAllergyNote(child);
  const invitations = await getInvitationsByChildId(child.id);

  return (
    <div className="flex flex-wrap items-start gap-[26px]">
      <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
        <ProfileHeader child={child} />
        {allergyNote ? <AllergyNoteCard note={allergyNote} /> : null}
        <ProfileDetailsCard child={child} />
      </div>

      <KidProfileAside
        childId={child.id}
        childName={child.full_name}
        invitations={invitations}
      />
    </div>
  );
}

export default async function KidProfilePage(props: PageProps<"/kids/[id]">) {
  const { id } = await props.params;

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
          <div className="mx-auto w-full max-w-[820px] px-4 pt-6 pb-16 sm:px-6 md:px-10 md:pt-[34px] md:pb-20">
            <Link
              href="/kids"
              className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-muted"
            >
              <ArrowLeftIcon className="h-[18px] w-[18px]" />
              Volver a Niños
            </Link>

            <Suspense fallback={null}>
              <KidProfileContent id={id} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
