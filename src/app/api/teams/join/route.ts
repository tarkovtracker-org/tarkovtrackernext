import { NextRequest, NextResponse } from "next/server";
import { Team, TeamMember } from "@/lib/types";
import { teams, inviteCodes } from "../route";

// Import the same in-memory storage (in production, use a database)
export async function POST(request: NextRequest) {
  try {
    const { inviteCode, userName, userId, gameMode } = await request.json();

    if (!inviteCode || !userName || !userId || !gameMode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate invite code format
    if (!/^\d{6}$/.test(inviteCode)) {
      return NextResponse.json(
        { error: "Invalid invite code format" },
        { status: 400 }
      );
    }

    // Log the inviteCode for debugging
    console.log("Attempting to join with code:", inviteCode);
    console.log("Available invite codes:", Array.from(inviteCodes.entries()));

    const teamId = inviteCodes.get(inviteCode);
    if (!teamId) {
      return NextResponse.json(
        { error: "Invalid invite code" },
        { status: 400 }
      );
    }

    const team = teams.find((t: Team) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check if the team is for the correct game mode
    if (team.gameMode !== gameMode) {
      return NextResponse.json(
        {
          error: `This invite code is for ${team.gameMode.toUpperCase()} mode, but you're in ${gameMode.toUpperCase()} mode`,
        },
        { status: 400 }
      );
    }

    // Check if user is already in a team for this game mode
    const userInGameModeTeam = teams.some(
      (t: Team) =>
        t.gameMode === gameMode &&
        t.members.some((member: TeamMember) => member.id === userId)
    );

    if (userInGameModeTeam) {
      return NextResponse.json(
        { error: `User already in a ${gameMode.toUpperCase()} team` },
        { status: 400 }
      );
    }

    // Check if the team is full (max 5 members)
    if (team.members.length >= 5) {
      return NextResponse.json({ error: "Team is full" }, { status: 400 });
    }

    // Check if user is already in this team
    const userInTeam = team.members.some(
      (member: TeamMember) => member.id === userId
    );
    if (userInTeam) {
      return NextResponse.json(
        { error: "User already in this team" },
        { status: 400 }
      );
    }

    // Add user to team
    const newMember: TeamMember = {
      id: userId, // Use the provided userId instead of generating a new one
      name: userName,
      isSelf: false, // This is not the team creator
      joinedAt: new Date(),
    };

    console.log("Adding new member to team:", newMember);

    team.members.push(newMember);
    team.lastUpdated = new Date();

    console.log("Updated team:", team);
    return NextResponse.json(
      {
        success: true,
        team: team,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in join route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
