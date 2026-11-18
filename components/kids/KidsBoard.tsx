"use client";

import { useState } from "react";
import {
  addKidModalData,
  buildKidFromForm,
  type AddKidFormValues,
  type Kid,
  type KidsPageData,
} from "@/app/_data/kids";
import { AddKidModal } from "@/components/kids/AddKidModal";
import { KidCard } from "@/components/kids/KidCard";
import { KidsHeader } from "@/components/kids/KidsHeader";
import { KidsSearch } from "@/components/kids/KidsSearch";

type KidsBoardProps = {
  data: KidsPageData;
};

type KidsSection = {
  room: string;
  kids: Kid[];
};

function kidsCountLabel(count: number): string {
  return count === 1 ? "1 niño" : `${count} niños`;
}

// Sections follow the roomOptions order (Soles → Mar → Jardín) and only rooms
// with at least one kid render. Added kids (newest first) precede the mock kids.
function buildSections(addedKids: Kid[], kids: Kid[]): KidsSection[] {
  return addKidModalData.roomOptions
    .map((room) => ({
      room,
      kids: [
        ...addedKids.filter((kid) => kid.roomLabel === room),
        ...kids.filter((kid) => kid.roomLabel === room),
      ],
    }))
    .filter((section) => section.kids.length > 0);
}

export function KidsBoard({ data }: KidsBoardProps) {
  const [addedKids, setAddedKids] = useState<Kid[]>([]);
  const [isAddKidModalOpen, setIsAddKidModalOpen] = useState(false);

  const sections = buildSections(addedKids, data.kids);

  const openAddKidModal = () => setIsAddKidModalOpen(true);
  const closeAddKidModal = () => setIsAddKidModalOpen(false);

  const handleSaveKid = (values: AddKidFormValues) => {
    const kid = buildKidFromForm(
      values,
      [...data.kids, ...addedKids],
      addedKids.length,
    );
    setAddedKids((current) => [kid, ...current]);
    setIsAddKidModalOpen(false);
  };

  return (
    <div>
      <KidsHeader eyebrowLabel={data.eyebrowLabel} onAddKid={openAddKidModal} />
      <KidsSearch placeholder={data.searchPlaceholder} />

      {sections.map((section, index) => (
        <section
          key={section.room}
          className={index > 0 ? "mt-[28px]" : undefined}
        >
          <div className="mb-[14px] flex items-center gap-3">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
              SALA {section.room.toUpperCase()}
            </span>
            <span className="text-[13px] text-muted-light">
              {kidsCountLabel(section.kids.length)}
            </span>
            <span className="h-px flex-1 bg-[#E7DAC8]" />
          </div>
          <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
            {section.kids.map((kid) => (
              <KidCard key={kid.id} kid={kid} />
            ))}
          </div>
        </section>
      ))}

      <AddKidModal
        isOpen={isAddKidModalOpen}
        onClose={closeAddKidModal}
        onSave={handleSaveKid}
      />
    </div>
  );
}
