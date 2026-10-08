//export {POST} from '@/app/api/jobs/[id]/publish/route';
import { NextResponse } from "next/server";
import { getJobForUser } from "@/lib/jobs";
import { publishJobToYoutube } from "@/lib/youtube-publish";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body?.id;

    if (!id || typeof id !== "string") {
      return NextResponse.json(
        { error: "Missing job id" },
        { status: 400 }
      );
    }

    const job = await getJobForUser(id);
    const r = await publishJobToYoutube(job);

    return NextResponse.json(r);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      {
        status: e.message === "Unauthorized" ? 401 : 500,
      }
    );
  }
}

