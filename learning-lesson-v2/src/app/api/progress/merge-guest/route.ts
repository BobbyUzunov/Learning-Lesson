import { NextResponse } from "next/server";
import { guestProgressClaimCookie, guestProgressClaimPath } from "@/lib/guest-progress-claim";
import { getKnownErrorCode } from "@/lib/http";
import { logServerError } from "@/lib/observability";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function readClaimCookie(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const encoded = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${guestProgressClaimCookie}=`))
    ?.slice(guestProgressClaimCookie.length + 1);

  if (!encoded) {
    return null;
  }

  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  // The legacy lessonIds body remains accepted for cached clients, but it is
  // deliberately ignored. Only the server-issued capability names a lesson.
  const claimToken = readClaimCookie(request);
  if (!claimToken) {
    return NextResponse.json({ error: "guest_proof_missing" }, { status: 409 });
  }

  const { data, error } = await supabase
    .rpc("redeem_guest_progress", { p_claim_token: claimToken })
    .single<{ ok: boolean; xp: number; level: number }>();

  if (error) {
    const code =
      getKnownErrorCode(error.message, ["guest_proof_invalid", "guest_proof_expired"]) ??
      "guest_merge_failed";

    if (code === "guest_merge_failed") {
      logServerError("redeem_guest_progress_failed", {
        detail: error.message.slice(0, 200)
      });
    }

    return NextResponse.json(
      { error: code },
      { status: code === "guest_merge_failed" ? 500 : 409 }
    );
  }

  if (!data?.ok || !Number.isInteger(data.xp) || !Number.isInteger(data.level)) {
    logServerError("redeem_guest_progress_invalid_result");
    return NextResponse.json({ error: "guest_merge_failed" }, { status: 500 });
  }

  const response = NextResponse.json(data);
  response.cookies.set(guestProgressClaimCookie, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: guestProgressClaimPath,
    maxAge: 0
  });
  return response;
}
