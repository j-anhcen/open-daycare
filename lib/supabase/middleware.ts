import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export function createClient(request: NextRequest) {
  // `setAll` rebuilds this response whenever Supabase refreshes the session.
  // The proxy must always return the response `getResponse()` yields: only the
  // last-built response carries the refreshed cookies to both the page and the
  // browser. Next snapshots the request headers when
  // `NextResponse.next({ request })` is constructed, so mutating
  // `request.cookies` on an earlier response never reaches the page.
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  return { supabase, getResponse: () => response };
}
