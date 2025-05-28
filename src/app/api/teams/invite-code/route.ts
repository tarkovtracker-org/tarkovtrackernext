import { NextRequest, NextResponse } from "next/server";
import { Team, TeamMember } from "@/lib/types";
// Import the in-memory data from the parent file
import { teams, inviteCodes } from "../route";

// Helper function to generate 6-digit invite code
function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POST /api/teams/invite-code - Generate new invite code
export async function POST(request: NextRequest) {
  try {
    const { userId, gameMode } = await request.json();

    if (!userId || !gameMode) {
      return NextResponse.json(
        { error: "User ID and game mode required" },
        { status: 400 }
      );
    }

    // Using the imported teams and inviteCodes instead of accessing globalThis directly
    const team = teams.find((t: Team) => {
      const userMember = t.members.find(
        (member: TeamMember) => member.id === userId
      );
      return (
        t.gameMode === gameMode && userMember && userMember.id === t.leaderId
      );
    });

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or user not leader" },
        { status: 404 }
      );
    }

    // Remove old invite code
    inviteCodes.delete(team.inviteCode);

    // Generate new invite code
    const newInviteCode = generateInviteCode();
    team.inviteCode = newInviteCode;
    team.lastUpdated = new Date();

    // Store new invite code
    inviteCodes.set(newInviteCode, team.id);

    return NextResponse.json({ inviteCode: newInviteCode }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
