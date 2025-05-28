import { NextRequest, NextResponse } from "next/server";
import { Team, TeamMember } from "@/lib/types";
import { teams } from "../route";

// POST /api/teams/refresh - Get updated team data for a user
export async function POST(request: NextRequest) {
  try {
    const { userId, gameMode } = await request.json();

    if (!userId || !gameMode) {
      return NextResponse.json(
        { error: "User ID and game mode required" },
        { status: 400 }
      );
    }

    // Find the team that contains this user for the specific game mode
    const userTeam = teams.find(
      (team) =>
        team.gameMode === gameMode &&
        team.members.some((member: TeamMember) => member.id === userId)
    );

    if (!userTeam) {
      return NextResponse.json({ team: null });
    }

    // Mark the current user as self in the team data
    const updatedTeam = {
      ...userTeam,
      members: userTeam.members.map((member: TeamMember) => ({
        ...member,
        isSelf: member.id === userId,
      })),
    };

    return NextResponse.json({ team: updatedTeam });
  } catch (error) {
    console.error("Error refreshing team:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
