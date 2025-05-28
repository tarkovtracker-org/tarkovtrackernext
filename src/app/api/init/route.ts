import { NextResponse } from 'next/server';
import { Team } from '@/lib/types';

// Declare global types to fix TypeScript errors
// eslint-disable-next-line no-var
declare global {
  // eslint-disable-next-line no-var
  var teams: Team[] | undefined;
  // eslint-disable-next-line no-var
  var inviteCodes: Map<string, string> | undefined;
}

// Initialize global storage for demo purposes
// In production, replace with proper database
if (typeof globalThis.teams === 'undefined') {
  globalThis.teams = [];
}

if (typeof globalThis.inviteCodes === 'undefined') {
  globalThis.inviteCodes = new Map();
}

export async function GET() {
  return NextResponse.json({ 
    message: 'API initialized',
    teamsCount: globalThis.teams?.length || 0,
    inviteCodesCount: globalThis.inviteCodes?.size || 0
  });
}