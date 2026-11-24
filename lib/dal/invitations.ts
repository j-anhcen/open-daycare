import 'server-only';

import { cache } from "react";

import type { InvitationDto, InvitationWithChildDto } from "@/lib/invitations";
import { createClient } from "@/lib/supabase/server";

type InvitationRow = {
  id: string;
  full_name: string;
  email: string;
  relationship: InvitationDto["relationship"];
  code: string;
  status: InvitationDto["status"];
  expires_at: string;
  created_at: string;
};

export const getInvitationsByChildId = cache(
  async (childId: string): Promise<InvitationDto[]> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("invitations")
      .select(
        "id, full_name, email, relationship, code, status, expires_at, created_at",
      )
      .eq("child_id", childId)
      .order("created_at", { ascending: false });

    return ((data ?? []) as InvitationRow[]).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      relationship: row.relationship,
      code: row.code,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }));
  },
);

type InvitationWithChildRow = {
  id: string;
  full_name: string;
  email: string;
  relationship: InvitationWithChildDto["relationship"];
  code: string;
  status: InvitationWithChildDto["status"];
  expires_at: string;
  child:
    | {
        id: string;
        full_name: string;
        room: { name: string; daycare_id: string } | { name: string; daycare_id: string }[] | null;
      }
    | {
        id: string;
        full_name: string;
        room: { name: string; daycare_id: string } | { name: string; daycare_id: string }[] | null;
      }[]
    | null;
};

function first<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export const getInvitationByCode = cache(
  async (code: string): Promise<InvitationWithChildDto | null> => {
    const supabase = await createClient();
    const { data } = await supabase
      .from("invitations")
      .select(
        "id, full_name, email, relationship, code, status, expires_at, " +
          "child:children(id, full_name, room:rooms(name, daycare_id))",
      )
      .eq("code", code)
      .maybeSingle();

    if (!data) return null;

    const row = data as unknown as InvitationWithChildRow;
    const child = first(row.child);
    const room = first(child?.room ?? null);
    if (!child || !room) return null;

    return {
      code: row.code,
      fullName: row.full_name,
      email: row.email,
      relationship: row.relationship,
      childId: child.id,
      childName: child.full_name,
      roomName: room.name,
      daycareId: room.daycare_id,
      status: row.status,
      expiresAt: row.expires_at,
    };
  },
);
