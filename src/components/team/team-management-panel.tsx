"use client";

import { useState } from "react";
import { useAppContext } from "@/lib/context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TeamMemberItem } from "./team-member-item";
import { UsersIcon, PlusIcon, LogOutIcon, TrashIcon } from "lucide-react";

export function TeamManagementPanel() {
  const { getCurrentTeam, createTeam, inviteMember, leaveTeam, disbandTeam } =
    useAppContext();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [leaderName, setLeaderName] = useState("");
  const [memberName, setMemberName] = useState("");

  const currentTeam = getCurrentTeam();

  const handleCreateTeam = () => {
    if (teamName.trim() && leaderName.trim()) {
      createTeam(teamName.trim(), leaderName.trim());
      setTeamName("");
      setLeaderName("");
      setIsCreateDialogOpen(false);
    }
  };

  const handleInviteMember = () => {
    if (memberName.trim()) {
      inviteMember(memberName.trim());
      setMemberName("");
      setIsInviteDialogOpen(false);
    }
  };

  const handleLeaveTeam = () => {
    leaveTeam();
  };

  const handleDisbandTeam = () => {
    disbandTeam();
  };

  const selfMember = currentTeam?.members.find((m) => m.isSelf);
  const isLeader = selfMember?.id === currentTeam?.leaderId;

  if (!currentTeam) {
    return (
      <Card className="w-full max-w-2xl mx-auto base-card">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <UsersIcon className="w-12 h-12 text-muted-foreground" />
          </div>
          <CardTitle className="text-tarkov-orange">Team Management</CardTitle>
          <CardDescription>
            Create a team to coordinate with other players and track progress
            together.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={setIsCreateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <PlusIcon className="w-4 h-4" />
                Create Team
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Team</DialogTitle>
                <DialogDescription>
                  Set up a new team for coordinating your Tarkov progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="teamName">Team Name</Label>
                  <Input
                    id="teamName"
                    value={teamName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTeamName(e.target.value)
                    }
                    placeholder="Enter team name"
                  />
                </div>
                <div>
                  <Label htmlFor="leaderName">Your Name</Label>
                  <Input
                    id="leaderName"
                    value={leaderName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLeaderName(e.target.value)
                    }
                    placeholder="Enter your display name"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTeam}
                  disabled={!teamName.trim() || !leaderName.trim()}
                >
                  Create Team
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="base-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-tarkov-orange">
                <UsersIcon className="w-5 h-5" />
                {currentTeam.name}
              </CardTitle>
              <CardDescription>
                Created {currentTeam.createdAt.toLocaleDateString()} •{" "}
                {currentTeam.members.length} member
                {currentTeam.members.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {isLeader && (
                <>
                  <Dialog
                    open={isInviteDialogOpen}
                    onOpenChange={setIsInviteDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        className="flex items-center gap-1 btn-success"
                      >
                        <PlusIcon className="w-3 h-3" />
                        Invite Member
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                          Add a new member to your team.
                        </DialogDescription>
                      </DialogHeader>
                      <div>
                        <Label htmlFor="memberName">Member Name</Label>
                        <Input
                          id="memberName"
                          value={memberName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setMemberName(e.target.value)
                          }
                          placeholder="Enter member name"
                        />
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsInviteDialogOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleInviteMember}
                          disabled={!memberName.trim()}
                        >
                          Invite
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    onClick={handleDisbandTeam}
                    className="flex items-center gap-1 btn-danger"
                  >
                    <TrashIcon className="w-3 h-3" />
                    Disband Team
                  </Button>
                </>
              )}
              {!isLeader && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLeaveTeam}
                  className="flex items-center gap-1"
                >
                  <LogOutIcon className="w-3 h-3" />
                  Leave Team
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              Team Members
            </h3>
            <div className="space-y-2">
              {currentTeam.members.map((member) => (
                <TeamMemberItem
                  key={member.id}
                  member={member}
                  isLeader={member.id === currentTeam.leaderId}
                  canKick={isLeader}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
