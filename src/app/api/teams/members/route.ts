import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { Team, TeamMember } from "@/lib/types";
import { teams } from "../route";

// POST /api/teams/members - Invite a member
export async function POST(request: NextRequest) {
  try {
    const { memberName, userId } = await request.json();

    if (!memberName || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const team = teams.find((t: Team) =>
      t.members.some(
        (member: TeamMember) => member.id === userId && member.id === t.leaderId
      )
    );

    if (!team) {
      return NextResponse.json(
        { error: "Team not found or user not leader" },
        { status: 404 }
      );
    }

    const newMember: TeamMember = {
      id: nanoid(),
      name: memberName,
      isSelf: false,
      joinedAt: new Date(),
    };

    team.members.push(newMember);
    team.lastUpdated = new Date();

    return NextResponse.json({ team }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/members - Remove a member
export async function DELETE(request: NextRequest) {
  try {
    const { memberId, userId } = await request.json();

    if (!memberId || !userId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const team = teams.find((t: Team) =>
      t.members.some((member: TeamMember) => member.id === userId)
    );

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const userMember = team.members.find(
      (member: TeamMember) => member.id === userId
    );
    const isLeader = userMember && userMember.id === team.leaderId;
    const isLeavingSelf = team.members.some(
      (member: TeamMember) => member.id === memberId && member.id === userId
    );

    // Check permissions
    if (!isLeader && !isLeavingSelf) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    // Remove member
    team.members = team.members.filter(
      (member: TeamMember) => member.id !== memberId
    );
    team.lastUpdated = new Date();

    return NextResponse.json({ team }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
