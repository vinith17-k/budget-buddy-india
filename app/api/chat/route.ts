import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/agent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || "";
    const history = body.history || [];
    const userId = body.user_id || "default";

    const result = await chat(message, history, userId);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
