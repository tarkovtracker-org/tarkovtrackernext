"use client";

import * as React from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppContext } from "@/lib/context";

// Custom styled dialog content component with forced background for PvP mode
const ThemedDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  React.ComponentPropsWithoutRef<typeof DialogContent> & { isPvP: boolean }
>(({ className, isPvP, ...props }, ref) => {
  return (
    <DialogContent
      ref={ref}
      className={cn(
        "border-2",
        isPvP ? "border-red-900" : "border-blue-900",
        className
      )}
      style={{ 
        backgroundColor: isPvP ? "#1f0505" : "#082f49",
        backgroundImage: "none" 
      }}
      {...props}
    />
  );
});
ThemedDialogContent.displayName = "ThemedDialogContent";

// PvP-themed dialog for disbanding team
export function DisbandTeamDialog({ 
  open, 
  onOpenChange, 
  onDisband 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onDisband: () => void;
}) {
  const { userProfile } = useAppContext();
  const isPvP = userProfile.currentGameMode === "pvp";
  const warningBgColor = "bg-red-500/10";
  const warningBorderColor = "border-red-500/30";
  const warningTextColor = isPvP ? "text-red-500" : "text-red-400";
  const buttonBgColor = "bg-red-600 hover:bg-red-700";
  const buttonBorderColor = "border-red-500";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ThemedDialogContent isPvP={isPvP}>
        <DialogHeader>
          <DialogTitle className={warningTextColor}>Warning: Disband Team</DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to disband the team? This action cannot be reversed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className={cn("p-3 rounded-md", warningBgColor, "border", warningBorderColor)}>
            <p className={cn("text-sm", warningTextColor)}>
              Disbanding the team will remove all members from the team and delete the team permanently.
              All members will need to create or join a new team if they wish to collaborate again.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className={cn(buttonBgColor, "border-2", buttonBorderColor, "text-white")}
            onClick={() => {
              onDisband();
              onOpenChange(false);
            }}
          >
            Disband Team
          </Button>
        </DialogFooter>
      </ThemedDialogContent>
    </Dialog>
  );
}

// PvP-themed dialog for leaving team
export function LeaveTeamDialog({ 
  open, 
  onOpenChange, 
  onLeave 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onLeave: () => void;
}) {
  const { userProfile } = useAppContext();
  const isPvP = userProfile.currentGameMode === "pvp";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <ThemedDialogContent isPvP={isPvP}>
        <DialogHeader>
          <DialogTitle className="text-gray-100">Confirm: Leave Team</DialogTitle>
          <DialogDescription className="text-gray-300">
            Are you sure you want to leave the team?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-md">
            <p className="text-sm text-yellow-500">
              If you leave the team, you will need to be invited back by a team member if you wish to rejoin.
              Your personal progress will not be affected.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => {
              onLeave();
              onOpenChange(false);
            }}
          >
            Leave Team
          </Button>
        </DialogFooter>
      </ThemedDialogContent>
    </Dialog>
  );
}
