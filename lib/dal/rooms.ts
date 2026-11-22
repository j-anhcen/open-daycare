import 'server-only';

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type Room = {
  id: string;
  name: string;
  created_at: string;
};

export const getRooms = cache(async (): Promise<Room[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("rooms")
    .select("id, name, created_at")
    .order("name");

  return (data ?? []) as Room[];
});
