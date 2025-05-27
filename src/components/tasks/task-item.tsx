"use client";

import { Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ObjectiveItem } from "./objective-item";
import { cn } from "@/lib/utils";
import { 
  Trophy, 
  MapPin, 
  User, 
  Clock, 
  CheckCircle, 
  Circle, 
  Lock,
  Play
} from "lucide-react";

interface TaskItemProps {
  task: Task;
  onUpdateStatus: (taskId: string, status: Task['status']) => void;
  onUpdateObjective: (taskId: string, objectiveId: string, completed: boolean) => void;
}

export function TaskItem({ task, onUpdateStatus, onUpdateObjective }: TaskItemProps) {
  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'active':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'available':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'locked':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'active':
        return <Play className="h-4 w-4" />;
      case 'available':
        return <Circle className="h-4 w-4" />;
      case 'locked':
        return <Lock className="h-4 w-4" />;
      default:
        return <Circle className="h-4 w-4" />;
    }
  };

  const completedObjectives = task.objectives.filter(obj => obj.completed).length;
  const totalObjectives = task.objectives.length;
  const progressPercentage = totalObjectives > 0 ? (completedObjectives / totalObjectives) * 100 : 0;

  const canStart = task.status === 'available';
  const canComplete = task.status === 'active' && completedObjectives === totalObjectives;

  return (
    <Card className={cn(
      "tactical-panel border-tarkov transition-all duration-200 hover:border-tarkov-orange/50",
      task.status === 'completed' && "opacity-75"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-tarkov-orange" />
              {task.name}
            </CardTitle>
            
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="text-tarkov-orange">{task.trader}</span>
              </div>
              
              {task.map && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span className="text-tarkov-orange">{task.map}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <span>Level {task.level}</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1", getStatusColor(task.status))}
            >
              {getStatusIcon(task.status)}
              {task.status}
            </Badge>
            
            {task.status === 'active' && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Started {task.startedAt?.toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
        
        {totalObjectives > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="text-tarkov-orange font-medium">
                {completedObjectives}/{totalObjectives}
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {task.objectives.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Objectives</h4>
            <div className="space-y-2">
              {task.objectives.map((objective) => (
                <ObjectiveItem
                  key={objective.id}
                  objective={objective}
                  onToggle={(objectiveId, completed) => onUpdateObjective(task.id, objectiveId, completed)}
                />
              ))}
            </div>
          </div>
        )}
        
        {task.requiredItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Required Items</h4>
            <div className="grid grid-cols-1 gap-2">
              {task.requiredItems.map((item) => (
                <div 
                  key={item.itemId}
                  className="flex justify-between items-center p-2 bg-tarkov-panel rounded border border-tarkov"
                >
                  <span className="text-sm">{item.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.quantityFound}/{item.quantityNeeded}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {task.rewards.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Rewards</h4>
            <div className="flex flex-wrap gap-2">
              {task.rewards.map((reward, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reward.type === 'xp' && `${reward.amount} XP`}
                  {reward.type === 'money' && `₽${reward.amount.toLocaleString()}`}
                  {reward.type === 'trader_rep' && `+${reward.amount} ${reward.trader} Rep`}
                  {reward.type === 'item' && reward.item}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          {canStart && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(task.id, 'active')}
              className="btn-tactical"
            >
              Start Task
            </Button>
          )}
          
          {canComplete && (
            <Button
              size="sm"
              onClick={() => onUpdateStatus(task.id, 'completed')}
              className="btn-tactical bg-green-600 hover:bg-green-700"
            >
              Complete Task
            </Button>
          )}
          
          {task.wiki && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(task.wiki, '_blank')}
              className="border-tarkov text-tarkov-orange hover:bg-tarkov-panel"
            >
              Wiki
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}