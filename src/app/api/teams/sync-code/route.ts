import { NextRequest, NextResponse } from "next/server";
import { teams, inviteCodes } from "../route";

// POST /api/teams/sync-code - Sync a client-generated invite code with the server
export async function POST(request: NextRequest) {
  try {
    const { userId, inviteCode, gameMode } = await request.json();

    if (!userId || !inviteCode || !gameMode) {
      return NextResponse.json(
        { error: "User ID, invite code, and game mode required" },
        { status: 400 }
      );
    }

    console.log(
      `Attempting to sync code: ${inviteCode} for user: ${userId} in ${gameMode} mode`
    );
    console.log(`Current invite codes:`, Array.from(inviteCodes.entries()));

    // Find the team with the given invite code
    const existingTeamId = inviteCodes.get(inviteCode);
    if (existingTeamId) {
      const existingTeam = teams.find((t) => t.id === existingTeamId);
      if (existingTeam && existingTeam.gameMode === gameMode) {
        console.log(
          `Code ${inviteCode} is already registered to team ${existingTeamId} in ${gameMode} mode`
        );
        return NextResponse.json(
          { success: true, inviteCode },
          { status: 200 }
        );
      }
    }

    // Find the user's team for this game mode
    const team = teams.find((t) => {
      return (
        t.gameMode === gameMode &&
        t.members.some((member) => member.id === userId)
      );
    });

    if (!team) {
      console.log(`No ${gameMode} team found for user ${userId}`);
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if user is leader
    const isLeader = team.leaderId === userId;
    if (!isLeader) {
      console.log(`User ${userId} is not the leader of team ${team.id}`);
      return NextResponse.json(
        { error: "User is not team leader" },
        { status: 403 }
      );
    }

    // Check if old invite code exists and remove it
    if (team.inviteCode && team.inviteCode !== inviteCode) {
      console.log(`Removing old code ${team.inviteCode}`);
      inviteCodes.delete(team.inviteCode);
    }

    // Update the team's invite code
    team.inviteCode = inviteCode;
    team.lastUpdated = new Date();

    // Register the new code
    inviteCodes.set(inviteCode, team.id);
    console.log(
      `Registered code ${inviteCode} for team ${team.id} in ${gameMode} mode`
    );

    return NextResponse.json({ success: true, inviteCode }, { status: 200 });
  } catch (error) {
    console.error("Error syncing invite code:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
