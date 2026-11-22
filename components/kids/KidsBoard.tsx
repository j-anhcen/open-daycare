"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { AddKidModal } from "@/components/kids/AddKidModal";
import { KidCard, type KidCardChild } from "@/components/kids/KidCard";
import { KidsHeader } from "@/components/kids/KidsHeader";
import { KidsSearch } from "@/components/kids/KidsSearch";

type KidsBoardRoom = {
  id: string;
  name: string;
};

type KidsBoardProps = {
  rooms: KidsBoardRoom[];
  kids: KidCardChild[];
};

function kidsCountLabel(count: number): string {
  return count === 1 ? "1 niño" : `${count} niños`;
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Mark}/gu, "").toLowerCase();
}

export function KidsBoard({ rooms, kids }: KidsBoardProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [isAddKidModalOpen, setIsAddKidModalOpen] = useState(false);
  const normalizedSearch = normalize(search.trim());

  const openAddKidModal = useCallback(() => setIsAddKidModalOpen(true), []);
  const closeAddKidModal = useCallback(
    () => setIsAddKidModalOpen(false),
    [],
  );
  const handleChildCreated = useCallback(() => {
    setIsAddKidModalOpen(false);
    router.refresh();
  }, [router]);

  const filteredChildren = normalizedSearch
    ? kids.filter((child) =>
        normalize(child.full_name).includes(normalizedSearch),
      )
    : kids;

  return (
    <div>
      <KidsHeader eyebrowLabel="GESTIÓN" onAddKid={openAddKidModal} />
      <KidsSearch
        placeholder="Buscar niño…"
        value={search}
        onChange={setSearch}
      />

      {rooms.map((room, index) => {
        const roomChildren = filteredChildren.filter(
          (child) => child.room_id === room.id,
        );

        return (
          <section
            key={room.id}
            className={index > 0 ? "mt-[28px]" : undefined}
          >
            <div className="mb-[14px] flex items-center gap-3">
              <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-ink">
                SALA {room.name.toUpperCase()}
              </span>
              <span className="text-[13px] text-muted-light">
                {kidsCountLabel(roomChildren.length)}
              </span>
              <span className="h-px flex-1 bg-[#E7DAC8]" />
            </div>
            {roomChildren.length === 0 ? (
              <p className="rounded-[18px] border border-dashed border-line bg-surface px-4 py-5 text-center text-[13px] text-muted-light">
                No hay niños en esta sala.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-[14px] md:grid-cols-2">
                {roomChildren.map((child) => (
                  <KidCard key={child.id} child={child} />
                ))}
              </div>
            )}
          </section>
        );
      })}

      <AddKidModal
        isOpen={isAddKidModalOpen}
        rooms={rooms}
        onClose={closeAddKidModal}
        onCreated={handleChildCreated}
      />
    </div>
  );
}
