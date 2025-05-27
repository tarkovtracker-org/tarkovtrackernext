"use client";

import { Objective } from "@/lib/types";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ObjectiveItemProps {
  objective: Objective;
  onToggle: (objectiveId: string, completed: boolean) => void;
}

export function ObjectiveItem({ objective, onToggle }: ObjectiveItemProps) {
  const getObjectiveTypeColor = (type: Objective['type']) => {
    switch (type) {
      case 'kill':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'find':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'extract':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'survive':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'skill':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className={cn(
      "flex items-start space-x-3 p-3 rounded-lg border transition-all duration-200",
      objective.completed 
        ? "bg-green-500/10 border-green-500/30" 
        : "bg-tarkov-panel border-tarkov hover:border-tarkov-orange/50"
    )}>
      <Checkbox
        id={objective.id}
        checked={objective.completed}
        onCheckedChange={(checked) => onToggle(objective.id, checked as boolean)}
        className="mt-0.5"
      />
      
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <label 
            htmlFor={objective.id}
            className={cn(
              "text-sm font-medium cursor-pointer transition-colors",
              objective.completed ? "text-green-400 line-through" : "text-foreground"
            )}
          >
            {objective.description}
          </label>
          
          <Badge 
            variant="outline" 
            className={cn("text-xs ml-2", getObjectiveTypeColor(objective.type))}
          >
            {objective.type}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
          {objective.target && (
            <span>Target: <span className="text-tarkov-orange">{objective.target}</span></span>
          )}
          {objective.count && (
            <span>Count: <span className="text-tarkov-orange">{objective.count}</span></span>
          )}
          {objective.location && (
            <span>Location: <span className="text-tarkov-orange">{objective.location}</span></span>
          )}
        </div>
      </div>
    </div>
  );
}