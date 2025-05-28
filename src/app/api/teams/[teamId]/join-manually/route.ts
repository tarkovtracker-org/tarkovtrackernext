import { NextRequest, NextResponse } from 'next/server';
import { Team, TeamMember } from '@/lib/types';
import { teams } from '../../route';

// POST /api/teams/[teamId]/join-manually - Manually join a user to a team by ID
export async function POST(
  request: NextRequest,
  { params }: { params: { teamId: string } }
) {
  try {
    const teamId = params.teamId;
    const { userName, userId } = await request.json();
    
    if (!teamId || !userName || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log(`Attempting manual join: User ${userId} to team ${teamId}`);
    
    // Find the team by ID
    const team = teams.find((t: Team) => t.id === teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // Check if user is already in a team
    const userInAnyTeam = teams.some((t: Team) => 
      t.members.some((member: TeamMember) => member.id === userId)
    );
    
    if (userInAnyTeam) {
      return NextResponse.json({ error: 'User already in a team' }, { status: 400 });
    }

    // Check if the team is full (max 5 members)
    if (team.members.length >= 5) {
      return NextResponse.json({ error: 'Team is full' }, { status: 400 });
    }

    // Check if user is already in this team
    const userInTeam = team.members.some((member: TeamMember) => member.id === userId);
    if (userInTeam) {
      return NextResponse.json({ error: 'User already in this team' }, { status: 400 });
    }

    // Add user to team
    const newMember: TeamMember = {
      id: userId,
      name: userName,
      isSelf: false, // Client will set this flag appropriately
      joinedAt: new Date(),
    };
    
    console.log('Adding new member to team:', newMember);

    team.members.push(newMember);
    team.lastUpdated = new Date();

    console.log('Updated team:', team);
    return NextResponse.json({ 
      success: true,
      team: team 
    }, { status: 200 });
  } catch (error) {
    console.error('Error in manual join route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
