import { NextResponse } from "next/server";
import { getJobForUser } from "@/lib/jobs";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const j = await getJobForUser((await params).id);

  if (!j.output_url) {
    return NextResponse.json(
      { error: "Video is not ready" },
      { status: 404 }
    );
  }

  return NextResponse.redirect(j.output_url);
}
