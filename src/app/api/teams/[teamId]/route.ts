import { NextRequest, NextResponse } from 'next/server';
import { TeamMember } from '@/lib/types';

// Import the in-memory data directly from the parent file
// This is a workaround for simplicity - in a real app, this would be a database
import { teams, inviteCodes } from '../route';

// DELETE /api/teams/[teamId] - Disband a specific team
export async function DELETE(
  request: NextRequest,
  context: { params: { teamId: string } }
) {
  try {
    // Properly await params in Next.js 13+
    const { teamId } = context.params;
    const body = await request.json();
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // First, find the team by ID
    const teamIndex = teams.findIndex((team) => team.id === teamId);
    
    if (teamIndex === -1) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }
    
    const team = teams[teamIndex];
    
    // Check if the user is the team leader (simpler validation for demo)
    const isLeader = team.members.some(
      (member: TeamMember) => member.id === userId
    );
    
    if (!isLeader) {
      return NextResponse.json({ error: 'User not authorized to disband team' }, { status: 403 });
    }
    inviteCodes.delete(team.inviteCode);
    teams.splice(teamIndex, 1);

    return NextResponse.json({ message: 'Team disbanded successfully' });
  } catch (error) {
    console.error('Error disbanding team:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
