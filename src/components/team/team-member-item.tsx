"use client";

import { TeamMember } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/lib/context";
import { UserIcon, CrownIcon, TrashIcon } from "lucide-react";

interface TeamMemberItemProps {
  member: TeamMember;
  isLeader: boolean;
  canKick: boolean;
}

export function TeamMemberItem({ member, isLeader, canKick }: TeamMemberItemProps) {
  const { kickMember } = useAppContext();

  const handleKick = () => {
    if (canKick && !member.isSelf) {
      kickMember(member.id);
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
                <Badge variant="default" className="text-xs flex items-center gap-1">
                  <CrownIcon className="w-3 h-3" />
                  Leader
                </Badge>
              )}
            </div>
            <span className="text-sm text-muted-foreground">
              Joined {member.joinedAt.toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {canKick && !member.isSelf && !isLeader && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleKick}
            className="flex items-center gap-1"
          >
            <TrashIcon className="w-3 h-3" />
            Kick
          </Button>
        )}
      </CardContent>
    </Card>
  );
}