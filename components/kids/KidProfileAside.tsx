"use client";

import { useCallback, useState } from "react";

import { LinkParentModal } from "@/components/kids/LinkParentModal";
import { LinkedParentsCard } from "@/components/kids/LinkedParentsCard";
import { SunIcon } from "@/components/shared/icons";
import {
  buildLinkedParentFromForm,
  type LinkedParent,
  type LinkParentFormValues,
} from "@/lib/link-parent";

type KidProfileAsideProps = {
  childName: string;
};

export function KidProfileAside({ childName }: KidProfileAsideProps) {
  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false);
  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>([]);

  const closeLinkParentModal = useCallback(() => {
    setIsLinkParentOpen(false);
  }, []);

  const handleSubmitLinkParent = (values: LinkParentFormValues) => {
    setLinkedParents((current) => [...current, buildLinkedParentFromForm(values)]);
  };

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
        parents={linkedParents}
        onLinkParent={() => setIsLinkParentOpen(true)}
      />

      <LinkParentModal
        isOpen={isLinkParentOpen}
        childName={childName}
        onClose={closeLinkParentModal}
        onSubmit={handleSubmitLinkParent}
      />
    </div>
  );
}
