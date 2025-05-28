import { NextResponse } from "next/server";
import { teams } from "../route";

// GET /api/teams/all - Get all teams (for debugging/admin purposes)
export async function GET() {
  try {
    return NextResponse.json({ teams });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
