import { NextRequest, NextResponse } from "next/server";
import { exchangeCode, encryptToken } from "@/lib/youtube";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const state = req.nextUrl.searchParams.get("state");
  const code = req.nextUrl.searchParams.get("code");

  const storedState = req.cookies.get("yt_oauth_state")?.value;

  // Validate OAuth state to prevent CSRF attacks
  if (!state || state !== storedState) {
    return new NextResponse("Invalid OAuth state", {
      status: 400,
    });
  }

  // Get authenticated Supabase user
  const db = await supabaseServer();

  const {
    data: { user },
  } = await db.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      new URL("/auth/login", req.url)
    );
  }

  // Google did not return an authorization code
  if (!code) {
    return new NextResponse("Missing code", {
      status: 400,
    });
  }

  // Exchange authorization code for YouTube refresh token
  const refresh = await exchangeCode(code);

  if (!refresh) {
    return new NextResponse(
      "No refresh token. Re-authorize with consent.",
      {
        status: 400,
      }
    );
  }

  // Encrypt refresh token before storing it
  const encryptedRefreshToken = encryptToken(refresh);

  const { error } = await supabaseAdmin()
    .from("youtube_tokens")
    .upsert(
      {
        user_id: user.id,
        encrypted_refresh_token: encryptedRefreshToken,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

  if (error) {
    console.error("Failed to save YouTube token:", error);

    return new NextResponse(
      "Failed to save YouTube connection",
      {
        status: 500,
      }
    );
  }

  // Redirect back to application
  const response = NextResponse.redirect(
    new URL("/?youtube=connected", req.url)
  );

  // Remove OAuth state cookie after successful authentication
  response.cookies.delete("yt_oauth_state");

  return response;
}