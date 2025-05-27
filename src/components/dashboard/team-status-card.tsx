"use client";

import { useAppContext } from "@/lib/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

export function TeamStatusCard() {
  const { getCurrentTeam } = useAppContext();
  const currentTeam = getCurrentTeam();

  return (
    <Card className="base-card animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-tarkov-orange flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Status
          </CardTitle>
          <CardDescription className="text-muted-foreground mt-1">Current team information</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {currentTeam ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border">
              <div className="font-semibold text-tarkov-orange">
                {currentTeam.name}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentTeam.members.length} member
                {currentTeam.members.length !== 1 ? "s" : ""}
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">
                Members:
              </h4>
              {currentTeam.members.slice(0, 3).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    {member.name}
                    {member.isSelf && (
                      <Badge variant="secondary" className="text-xs">
                        You
                      </Badge>
                    )}
                    {member.id === currentTeam.leaderId && (
                      <Badge variant="default" className="text-xs">
                        Leader
                      </Badge>
                    )}
                  </span>
                </div>
              ))}
              {currentTeam.members.length > 3 && (
                <div className="text-xs text-muted-foreground">
                  +{currentTeam.members.length - 3} more members
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-3">No team</p>
            <p className="text-xs text-muted-foreground">
              Create or join a team to coordinate with other players
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
