"use client";

import { useState } from "react";
import { TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/context";
import { UserIcon, CrownIcon, TrashIcon, LoaderIcon } from "lucide-react";

interface TeamMemberItemProps {
  member: TeamMember;
  isLeader: boolean;
  canKick: boolean;
}

export function TeamMemberItem({
  member,
  isLeader,
  canKick,
}: TeamMemberItemProps) {
  const { kickMember } = useAppContext();
  const [isKicking, setIsKicking] = useState(false);
  const [kickError, setKickError] = useState<string | null>(null);

  const handleKick = async () => {
    if (canKick && !member.isSelf && !isKicking) {
      setIsKicking(true);
      setKickError(null);

      try {
        await kickMember(member.id);
      } catch (error) {
        console.error("Failed to kick member:", error);
        setKickError(
          error instanceof Error ? error.message : "Failed to kick member"
        );

        // Clear error after 5 seconds
        setTimeout(() => setKickError(null), 5000);
      } finally {
        setIsKicking(false);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-muted rounded-full">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-medium">{member.name}</span>
              {member.isSelf && (
                <Badge variant="secondary" className="text-xs">
                  You
                </Badge>
              )}
              {isLeader && (
                <Badge
                  variant="default"
                  className="text-xs flex items-center gap-1"
                >
                  <CrownIcon className="w-3 h-3" />
                  Leader
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Joined {new Date(member.joinedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {canKick && !member.isSelf && !isLeader && (
          <div className="flex flex-col items-end gap-1">
            <Button
              variant="destructive"
              size="sm"
              onClick={handleKick}
              disabled={isKicking}
              className="flex items-center gap-1 relative"
            >
              {isKicking ? (
                <LoaderIcon className="w-3 h-3 animate-spin" />
              ) : (
                <TrashIcon className="w-3 h-3" />
              )}
              {isKicking ? "Kicking..." : "Kick"}
            </Button>
            {kickError && (
              <span className="text-xs text-red-500 max-w-32 text-right">
                {kickError}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
