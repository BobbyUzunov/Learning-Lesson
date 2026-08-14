import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/classes/:path*",
    "/assessments/:path*",
    "/assignments/:path*",
    "/certificate/:path*",
    "/projects/:path*",
    "/verify-email/:path*",
    "/teacher/:path*",
    "/admin/:path*",
    "/lesson/:path*",
    "/paths",
    "/paths/:path*",
    "/missions/:path*",
    "/courses",
    "/courses/:path*"
  ]
};
