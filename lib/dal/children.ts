import 'server-only';

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Child = {
  id: string;
  full_name: string;
  birth_date: string;
  enrolled_at: string;
  allergy_tags: string[];
  medical_notes: string | null;
  room_id: string;
  status: "active" | "archived";
};

export type ChildWithRoom = Child & {
  rooms: { name: string } | null;
};

export const getChildren = cache(async (): Promise<Child[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("children")
    .select(
      "id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room_id, status",
    )
    .eq("status", "active")
    .order("full_name");

  return (data ?? []) as Child[];
});

export const getChildrenByRoom = cache(
  async (roomId: string): Promise<Child[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("children")
      .select(
        "id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room_id, status",
      )
      .eq("room_id", roomId)
      .eq("status", "active")
      .order("full_name");

    return (data ?? []) as Child[];
  },
);

export const getChildById = cache(
  async (id: string): Promise<ChildWithRoom | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("children")
      .select(
        "id, full_name, birth_date, enrolled_at, allergy_tags, medical_notes, room_id, status, rooms(name)",
      )
      .eq("id", id)
      .single();

    return (data ?? null) as ChildWithRoom | null;
  },
);
