import { NextRequest, NextResponse } from "next/server";
import { getProfile } from "@/lib/store";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const profile = getProfile(userId);
  return NextResponse.json({ status: "seeded", profile });
}
