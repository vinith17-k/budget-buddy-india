import { NextRequest, NextResponse } from "next/server";
import { getStore, syncStore } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getStore());
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = syncStore(body);
    return NextResponse.json({ status: "synced", store: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
