import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { Team, TeamMember } from "@/lib/types";

// In-memory storage for demo (replace with database in production)
export const teams: Team[] = [];
export const inviteCodes: Map<string, string> = new Map(); // inviteCode -> teamId

// Helper function to generate 6-digit invite code
function generateInviteCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// GET /api/teams - Get user's current team
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const gameMode = searchParams.get("gameMode");

    if (!userId || !gameMode) {
      return NextResponse.json(
        { error: "User ID and game mode required" },
        { status: 400 }
      );
    }

    const userTeam = teams.find(
      (team) =>
        team.gameMode === gameMode &&
        team.members.some((member: TeamMember) => member.id === userId)
    );

    return NextResponse.json({ team: userTeam || null });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/teams - Create a new team
export async function POST(request: NextRequest) {
  try {
    const { teamName, leaderName, userId, gameMode, initialInviteCode } =
      await request.json();

    if (!teamName || !leaderName || !userId || !gameMode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user is already in a team for this specific game mode
    const existingTeam = teams.find(
      (team) =>
        team.gameMode === gameMode &&
        team.members.some((member: TeamMember) => member.id === userId)
    );

    if (existingTeam) {
      return NextResponse.json(
        { error: `User already in a ${gameMode.toUpperCase()} team` },
        { status: 400 }
      );
    }

    // Use provided invite code or generate a new one
    const inviteCode = initialInviteCode || generateInviteCode();

    // Check if the invite code is already in use for this game mode
    if (
      initialInviteCode &&
      teams.some(
        (team) =>
          team.gameMode === gameMode && team.inviteCode === initialInviteCode
      )
    ) {
      return NextResponse.json(
        { error: "Invite code already in use for this game mode" },
        { status: 400 }
      );
    }

    const teamId = nanoid();
    const leaderId = userId; // Use the actual user ID instead of creating a new one

    const newTeam: Team = {
      id: teamId,
      name: teamName,
      members: [
        {
          id: leaderId,
          name: leaderName,
          isSelf: true,
          joinedAt: new Date(),
        },
      ],
      leaderId: leaderId,
      inviteCode: inviteCode,
      gameMode: gameMode,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    teams.push(newTeam);
    inviteCodes.set(inviteCode, teamId);

    return NextResponse.json({ team: newTeam }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/teams - Disband team
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const gameMode = searchParams.get("gameMode");

    console.log(
      `🔥 DELETE /api/teams called with userId: ${userId}, gameMode: ${gameMode}`
    );
    console.log(`📊 Current teams count: ${teams.length}`);
    console.log(
      `📊 Teams:`,
      teams.map((t) => ({
        id: t.id,
        name: t.name,
        gameMode: t.gameMode,
        leaderId: t.leaderId,
        memberCount: t.members.length,
      }))
    );

    if (!userId || !gameMode) {
      return NextResponse.json(
        { error: "User ID and game mode required" },
        { status: 400 }
      );
    }

    // First, let's find if the user is in any team for this game mode
    const userTeam = teams.find((team) => {
      return (
        team.gameMode === gameMode &&
        team.members.some((member: TeamMember) => member.id === userId)
      );
    });

    console.log(
      `🔍 User team found:`,
      userTeam
        ? { id: userTeam.id, name: userTeam.name, leaderId: userTeam.leaderId }
        : null
    );

    if (!userTeam) {
      console.log(`❌ User ${userId} not found in any ${gameMode} team`);
      return NextResponse.json(
        { error: "User not found in any team for this game mode" },
        { status: 404 }
      );
    }

    // Check if user is the leader
    if (userTeam.leaderId !== userId) {
      console.log(
        `❌ User ${userId} is not the leader of team ${userTeam.id}. Leader is: ${userTeam.leaderId}`
      );
      return NextResponse.json(
        { error: "User is not the team leader" },
        { status: 403 }
      );
    }

    // Find the team index for removal
    const teamIndex = teams.findIndex((team) => team.id === userTeam.id);

    if (teamIndex === -1) {
      console.log(`❌ Team index not found for team ${userTeam.id}`);
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const team = teams[teamIndex];
    console.log(`✅ Disbanding team: ${team.name} (${team.id})`);

    inviteCodes.delete(team.inviteCode);
    teams.splice(teamIndex, 1);

    console.log(
      `✅ Team disbanded successfully. Remaining teams: ${teams.length}`
    );
    return NextResponse.json({ message: "Team disbanded successfully" });
  } catch (error) {
    console.error("❌ Error in DELETE /api/teams:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
