import type { Metadata } from "next";
import { connection } from "next/server";
import { Suspense } from "react";

import { AddChildForm } from "@/components/kids/AddChildForm";
import { getRooms } from "@/lib/dal/rooms";

export const metadata: Metadata = {
  title: "Agregar niño · OpenDayCare",
  description: "Cargá un nuevo niño y asignalo a una sala de la guardería.",
};

async function AddChildContent() {
  await connection();
  const rooms = await getRooms();

  return <AddChildForm rooms={rooms} />;
}

export default function NewChildPage() {
  return (
    <div className="flex min-h-screen items-start justify-center bg-background px-6 py-10">
      <Suspense fallback={null}>
        <AddChildContent />
      </Suspense>
    </div>
  );
}
