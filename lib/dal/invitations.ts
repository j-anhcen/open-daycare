import 'server-only';

import { cache } from "react";

import type { InvitationDto } from "@/lib/invitations";
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
