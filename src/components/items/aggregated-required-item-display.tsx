"use client";

import { useState } from "react";
import { AggregatedRequiredItem } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AggregatedRequiredItemDisplayProps {
  item: AggregatedRequiredItem;
  onQuantityChange: (itemId: string, newQuantity: number) => void;
}

export function AggregatedRequiredItemDisplay({ 
  item, 
  onQuantityChange 
}: AggregatedRequiredItemDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const progressPercentage = item.totalQuantityNeeded > 0 
    ? Math.min((item.totalQuantityFound / item.totalQuantityNeeded) * 100, 100)
    : 0;
  
  const isComplete = item.totalQuantityFound >= item.totalQuantityNeeded;
  const deficit = Math.max(0, item.totalQuantityNeeded - item.totalQuantityFound);

  const handleIncrement = () => {
    const newQuantity = Math.min(item.totalQuantityFound + 1, item.totalQuantityNeeded);
    onQuantityChange(item.itemId, newQuantity);
  };

  const handleDecrement = () => {
    const newQuantity = Math.max(0, item.totalQuantityFound - 1);
    onQuantityChange(item.itemId, newQuantity);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-green-400 border-green-400';
      default: return 'text-muted-foreground border-muted-foreground';
    }
  };

  return (
    <Card className={cn(
      "glass tactical-panel border-tarkov transition-all duration-200 animate-fade-in",
      isComplete && "border-green-500/50 bg-green-500/5"
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-tarkov-orange flex items-center gap-2">
            {item.name}
            {item.fir && (
              <Badge variant="outline" className="text-xs bg-blue-500/20 text-blue-400 border-blue-400">
                FIR
              </Badge>
            )}
            <Badge variant="outline" className={cn("text-xs", getPriorityColor(item.priority))}>
              {item.priority.toUpperCase()}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-medium",
              isComplete ? "text-green-400" : "text-muted-foreground"
            )}>
              {item.totalQuantityFound} / {item.totalQuantityNeeded}
            </span>
            {deficit > 0 && (
              <Badge variant="destructive" className="text-xs">
                Need {deficit}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={progressPercentage} 
            className="h-2"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 btn-tactical hover:glow-orange"
                onClick={handleDecrement}
                disabled={item.totalQuantityFound <= 0}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 btn-tactical hover:glow-orange"
                onClick={handleIncrement}
                disabled={item.totalQuantityFound >= item.totalQuantityNeeded}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="hover:bg-tarkov-panel">
                  <span className="text-xs text-muted-foreground mr-1">
                    {item.sources.length} source{item.sources.length !== 1 ? 's' : ''}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-3">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Required by:</h4>
                  {item.sources.map((source, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded bg-tarkov-panel/50 border border-tarkov/30"
                    >
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            source.type === 'task' 
                              ? "bg-blue-500/20 text-blue-400 border-blue-400"
                              : "bg-purple-500/20 text-purple-400 border-purple-400"
                          )}
                        >
                          {source.type.toUpperCase()}
                        </Badge>
                        <span className="text-sm">{source.sourceName}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {source.quantityFoundForSource} / {source.quantityForSource}
                      </span>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}