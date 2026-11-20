import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/middleware";

const publicRoutes = ["/login", "/activar-cuenta"];

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createClient(request, response);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (!user && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (user && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
