"use client";

import { useCallback, useState } from "react";

import { LinkParentModal } from "@/components/kids/LinkParentModal";
import { LinkedParentsCard } from "@/components/kids/LinkedParentsCard";
import { SunIcon } from "@/components/shared/icons";
import {
  invitationsToParentRows,
  type InvitationDto,
} from "@/lib/invitations";

type KidProfileAsideProps = {
  childId: string;
  childName: string;
  invitations: InvitationDto[];
};

export function KidProfileAside({
  childId,
  childName,
  invitations,
}: KidProfileAsideProps) {
  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false);

  const closeLinkParentModal = useCallback(() => {
    setIsLinkParentOpen(false);
  }, []);

  const parents = invitationsToParentRows(invitations);

  return (
    <div className="flex w-[300px] flex-none flex-col gap-[14px]">
      <button
        type="button"
        className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-ink p-[13px] text-[15px] font-extrabold text-white"
      >
        <SunIcon className="h-[18px] w-[18px]" strokeWidth={2} />
        Resumen del día
      </button>

      <LinkedParentsCard
        parents={parents}
        onLinkParent={() => setIsLinkParentOpen(true)}
      />

      <LinkParentModal
        isOpen={isLinkParentOpen}
        childId={childId}
        childName={childName}
        onClose={closeLinkParentModal}
      />
    </div>
  );
}
