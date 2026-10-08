import { NextRequest, NextResponse } from "next/server";
import { generateVideoPlan } from "@/ai/generate-script";

export async function POST(request: NextRequest) {
  try {
    const { topic } = await request.json();
    if (!topic?.trim()) return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    const plan = await generateVideoPlan(topic.trim());
    return NextResponse.json({ success: true, plan });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Script generation failed" }, { status: 500 });
  }
}
