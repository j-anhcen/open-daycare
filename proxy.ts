import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/middleware";

const publicRoutes = ["/login", "/accept-invitation", "/pokemon"];

export default async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !publicRoutes.includes(pathname)) {
    return withSessionCookies(
      NextResponse.redirect(new URL("/login", request.url)),
      getResponse(),
    );
  }

  if (user && pathname === "/login") {
    return withSessionCookies(
      NextResponse.redirect(new URL("/", request.url)),
      getResponse(),
    );
  }

  return getResponse();
}

/**
 * Copies the session cookies and cache headers written by `setAll` onto a
 * response built outside of it, so refreshed (or cleared) cookies still reach
 * the browser.
 */
function withSessionCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
  return target;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
