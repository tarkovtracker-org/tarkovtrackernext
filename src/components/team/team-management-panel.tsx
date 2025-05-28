"use client";

import { useState, useEffect } from "react";
import { useAppContext } from "@/lib/context";
import { TeamMember } from "@/lib/types";
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
import { JoinTeamComponent } from "./join-team-component";
import { DisbandTeamDialog, LeaveTeamDialog } from "./pvp-themed-dialog";
import {
  UsersIcon,
  PlusIcon,
  LogOutIcon,
  TrashIcon,
  RefreshCwIcon,
} from "lucide-react";

export function TeamManagementPanel() {
  const {
    getCurrentTeam,
    createTeam,
    inviteMember,
    leaveTeam,
    disbandTeam,
    generateNewInviteCode,
    refreshTeam,
    userProfile,
  } = useAppContext();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isDisbandDialogOpen, setIsDisbandDialogOpen] = useState(false);
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [memberName, setMemberName] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [codeError, setCodeError] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get game mode for theme styling
  const isPvP = userProfile.currentGameMode === "pvp";

  const currentTeam = getCurrentTeam();

  // Auto-refresh team data every 30 seconds when user is in a team (reduced from 10 seconds)
  useEffect(() => {
    if (!currentTeam?.id) return;

    const interval = setInterval(async () => {
      try {
        await refreshTeam();
      } catch (error) {
        console.error("Auto-refresh failed:", error);
      }
    }, 30000); // Refresh every 30 seconds instead of 10

    return () => clearInterval(interval);
  }, [currentTeam?.id, refreshTeam]); // Use team ID instead of full team object to reduce re-renders

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshTeam();
    } catch (error) {
      console.error("Manual refresh failed:", error);
    } finally {
      setIsRefreshing(false);
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

  const selfMember = currentTeam?.members.find((m: TeamMember) => m.isSelf);
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
            together, or join an existing team with an invite code.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Create Team Section */}
          <div className="flex justify-center">
            <Button
              size="lg"
              className="flex items-center gap-2 cursor-pointer hover:cursor-pointer btn-success bg-green-600 hover:bg-green-700 border-2 border-green-500"
              onClick={createTeam}
            >
              <PlusIcon className="w-4 h-4" />
              Create Team
            </Button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or
              </span>
            </div>
          </div>

          {/* Join Team Section */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-sm font-medium">Join Existing Team</h3>
              <p className="text-xs text-muted-foreground">
                Enter an invite code to join a team
              </p>
            </div>
            <div className="flex justify-center">
              <JoinTeamComponent />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card className="base-card">
        <CardHeader>
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-tarkov-orange">
                  <UsersIcon className="w-5 h-5" />
                  {currentTeam.name}
                </CardTitle>
                <CardDescription>
                  Created {new Date(currentTeam.createdAt).toLocaleDateString()}{" "}
                  • {currentTeam.members.length} member
                  {currentTeam.members.length !== 1 ? "s" : ""}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={handleManualRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCwIcon
                    className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Syncing..." : "Sync"}
                </Button>

                {isLeader && (
                  <Button
                    size="sm"
                    className="flex items-center gap-1 btn-danger"
                    onClick={() => setIsDisbandDialogOpen(true)}
                  >
                    <TrashIcon className="w-3 h-3" />
                    Disband Team
                  </Button>
                )}
              </div>
            </div>

            {/* Team Management Panel */}
            {isLeader &&
              currentTeam.inviteCode &&
              (() => {
                // Use the isPvP state from component scope
                const bgColor = isPvP ? "bg-red-900/30" : "bg-blue-900/30";
                const borderColor = isPvP
                  ? "border-red-800/50"
                  : "border-blue-800/50";
                const textColor = isPvP ? "text-red-300" : "text-blue-300";
                const hoverTextColor = isPvP
                  ? "hover:text-red-100"
                  : "hover:text-blue-100";
                const codeBgColor = isPvP ? "bg-red-950" : "bg-blue-950";
                const codeBorderColor = isPvP
                  ? "border-red-800"
                  : "border-blue-800";
                const buttonSuccessBg = isPvP ? "bg-red-600" : "bg-green-600";
                const buttonSuccessHover = isPvP
                  ? "hover:bg-red-700"
                  : "hover:bg-green-700";
                const buttonSuccessBorder = isPvP
                  ? "border-red-500"
                  : "border-green-500";

                return (
                  <div
                    className={`p-4 ${bgColor} border ${borderColor} rounded-md mb-6`}
                    data-component-name="TeamManagementPanel"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Team Invite Code Section */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className={`text-sm font-medium ${textColor}`}>
                            Team Invite Code
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className={`h-6 text-xs ${textColor} ${hoverTextColor} p-0 relative`}
                            onClick={async () => {
                              try {
                                setGeneratingCode(true);
                                setCodeError(false);
                                await generateNewInviteCode();
                              } catch (error) {
                                setCodeError(true);
                                console.error("Error generating code:", error);
                              } finally {
                                setGeneratingCode(false);
                              }
                            }}
                            disabled={generatingCode}
                          >
                            {generatingCode
                              ? "Generating..."
                              : "Generate New Code"}
                            {codeError && (
                              <span className="absolute -bottom-5 left-0 text-red-500 text-xs whitespace-nowrap">
                                Failed to generate
                              </span>
                            )}
                          </Button>
                        </div>
                        <div className="flex gap-2 items-center">
                          <div
                            className={`${codeBgColor} border ${codeBorderColor} rounded px-3 py-1.5 font-mono tracking-wider text-center flex-1`}
                          >
                            {currentTeam.inviteCode}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 relative"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                currentTeam.inviteCode
                              );
                              setCopySuccess(true);
                              setTimeout(() => setCopySuccess(false), 2000);
                            }}
                          >
                            {copySuccess ? "Copied!" : "Copy"}
                            {copySuccess && (
                              <span className="absolute -top-6 left-0 right-0 text-center text-xs text-green-500 whitespace-nowrap">
                                Copied to clipboard!
                              </span>
                            )}
                          </Button>
                        </div>
                        <p className={`text-xs ${textColor}`}>
                          Share this code with friends to let them join your
                          team.
                        </p>
                      </div>

                      {/* Direct Invite Section */}
                      <div className="space-y-3">
                        <h3 className={`text-sm font-medium ${textColor}`}>
                          Invite by Username
                        </h3>
                        <div className="flex flex-col gap-3">
                          <Dialog
                            open={isInviteDialogOpen}
                            onOpenChange={setIsInviteDialogOpen}
                          >
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                className={`flex items-center gap-1 border-2 ${buttonSuccessBg} ${buttonSuccessHover} ${buttonSuccessBorder}`}
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
                                <Label
                                  htmlFor="memberName"
                                  className="block mb-2"
                                >
                                  Member Name
                                </Label>
                                <Input
                                  id="memberName"
                                  value={memberName}
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => setMemberName(e.target.value)}
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
                          <p className={`text-xs ${textColor}`}>
                            Send a direct invite to another player by entering
                            their username.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

            {isLeader && (
              <DisbandTeamDialog
                open={isDisbandDialogOpen}
                onOpenChange={setIsDisbandDialogOpen}
                onDisband={handleDisbandTeam}
              />
            )}
            {!isLeader && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsLeaveDialogOpen(true)}
                >
                  <LogOutIcon className="w-3 h-3" />
                  Leave Team
                </Button>
                <LeaveTeamDialog
                  open={isLeaveDialogOpen}
                  onOpenChange={setIsLeaveDialogOpen}
                  onLeave={handleLeaveTeam}
                />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <h3 className="font-medium text-sm text-muted-foreground">
              Team Members
            </h3>
            <div className="space-y-2">
              {currentTeam.members.map((member: TeamMember) => (
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
