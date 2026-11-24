import 'server-only';

import { createServerClient, parseCookieHeader } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return parseCookieHeader(cookieStore.toString());
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // `setAll` ran inside a Server Component render, where cookies are
            // read-only. Safe to ignore: proxy.ts refreshes the session on every
            // request and writes the cookies for us.
          }
        },
      },
    },
  );
}
