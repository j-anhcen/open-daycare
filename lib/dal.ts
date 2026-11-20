import 'server-only';

import { cache } from "react";
import { io } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const verifySession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return { isAuth: true, userId: user.id, email: user.email };
});

export type CurrentUserProfile = {
  fullName: string;
  initial: string;
};

export const getCurrentUserProfile = cache(
  async (): Promise<CurrentUserProfile> => {
    await io();
    const { userId, email } = await verifySession();
    const supabase = await createClient();

    const { data } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();

    const fullName =
      data?.full_name?.trim() || email?.split("@")[0] || "Usuario";

    return {
      fullName,
      initial: fullName.charAt(0).toUpperCase(),
    };
  },
);
