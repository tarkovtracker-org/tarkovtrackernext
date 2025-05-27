import { TeamManagementPanel } from "@/components/team/team-management-panel";

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight title-gold">Team</h1>
        <p className="text-muted-foreground">
          Manage your team and coordinate progress with other players.
        </p>
      </div>
      <TeamManagementPanel />
    </div>
  );
}
