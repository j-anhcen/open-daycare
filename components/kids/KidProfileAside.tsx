"use client";

import { useCallback, useState } from "react";
import {
  buildLinkedParentFromForm,
  type Kid,
  type LinkedParent,
  type LinkParentFormValues,
} from "@/app/_data/kids";
import { LinkParentModal } from "@/components/kids/LinkParentModal";
import { LinkedParentsCard } from "@/components/kids/LinkedParentsCard";
import { SunIcon } from "@/components/shared/icons";

type KidProfileAsideProps = {
  kid: Kid;
};

export function KidProfileAside({ kid }: KidProfileAsideProps) {
  const [isLinkParentOpen, setIsLinkParentOpen] = useState(false);
  const [linkedParents, setLinkedParents] = useState<LinkedParent[]>(kid.parents);

  const closeLinkParentModal = useCallback(() => {
    setIsLinkParentOpen(false);
  }, []);

  const handleSubmitLinkParent = (values: LinkParentFormValues) => {
    const parent = buildLinkedParentFromForm(values, kid);
    setLinkedParents((current) => [...current, parent]);
  };

  return (
    <div className="flex w-[300px] flex-none flex-col gap-[14px]">
      <a
        href="#"
        className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-ink p-[13px] text-[15px] font-extrabold text-white"
      >
        <SunIcon className="h-[18px] w-[18px]" strokeWidth={2} />
        Resumen del día
      </a>

      <LinkedParentsCard
        kid={{ ...kid, parents: linkedParents }}
        onLinkParent={() => setIsLinkParentOpen(true)}
      />

      <LinkParentModal
        isOpen={isLinkParentOpen}
        kid={kid}
        onClose={closeLinkParentModal}
        onSubmit={handleSubmitLinkParent}
      />
    </div>
  );
}
