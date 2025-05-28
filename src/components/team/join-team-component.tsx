"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppContext } from "@/lib/context";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function JoinTeamComponent() {
  const [inviteCode, setInviteCode] = useState("");
  const { joinTeam } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) return;

    setIsLoading(true);
    setErrorMessage(""); // Clear any previous errors

    try {
      const result = await joinTeam(inviteCode.trim());

      if (result === true) {
        setInviteCode("");
        // Success case - could add a success toast here if needed
      } else {
        // Check for specific error types
        if (typeof result === "object") {
          if (result.errorType === "gameModeMismatch") {
            // Use the detailed error message from the API if available
            setErrorMessage(
              result.errorMessage ||
                `Wrong game mode selected. Please switch to ${result.requiredMode.toUpperCase()} mode.`
            );
          } else if (result.errorType === "alreadyInTeam") {
            setErrorMessage(result.errorMessage || "You're already in a team");
          } else if (result.errorType === "invalidCode") {
            setErrorMessage(result.errorMessage || "Invalid invite code");
          } else {
            // Unknown error - use the error message if available
            setErrorMessage(
              result.errorMessage ||
                "Invalid invite code or you're already in a team"
            );
          }
        } else {
          // Fallback for unexpected result format
          setErrorMessage("Invalid invite code or you're already in a team");
        }
      }
    } catch (error) {
      setErrorMessage("Error joining team. Please try again.");
      console.error("Error joining team:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    !inviteCode.trim() ||
    inviteCode.length !== 6 ||
    !/^\d{6}$/.test(inviteCode);

  return (
    <div className="flex flex-col w-full max-w-md gap-2">
      <div className="flex items-center space-x-2 w-full">
        <Input
          value={inviteCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            // Only allow digits and limit to 6 characters
            const value = e.target.value.replace(/\D/g, "").slice(0, 6);
            setInviteCode(value);
            if (errorMessage) setErrorMessage(""); // Clear error when user types
          }}
          placeholder="Enter 6-digit code"
          className={cn(
            "flex-1 text-center font-mono tracking-wider",
            errorMessage && "border-red-500 focus-visible:ring-red-500"
          )}
          maxLength={6}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isButtonDisabled && !isLoading) {
              handleJoinTeam();
            }
          }}
        />
        <Button
          onClick={handleJoinTeam}
          disabled={isButtonDisabled || isLoading}
          className="whitespace-nowrap btn-success bg-green-600 hover:bg-green-700 border-2 border-green-500"
        >
          {isLoading ? "Joining..." : "Join A Team"}
        </Button>
      </div>

      {errorMessage && (
        <div className="flex items-center text-red-500 text-sm mt-1 gap-1.5">
          <AlertCircle className="h-4 w-4" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
