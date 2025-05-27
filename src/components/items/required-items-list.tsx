"use client";

import { useState, useMemo } from "react";
import { useAppContext } from "@/lib/context";
import { AggregatedRequiredItemDisplay } from "./aggregated-required-item-display";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Package, Filter, SortAsc, SortDesc } from "lucide-react";

type SortOption = "name" | "needed" | "deficit" | "priority";
type SortDirection = "asc" | "desc";

export function RequiredItemsList() {
  const { getAggregatedRequiredItems, updateGlobalItemQuantity } = useAppContext();
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [showOnlyDeficit, setShowOnlyDeficit] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("all");

  const aggregatedItems = getAggregatedRequiredItems();

  const filteredAndSortedItems = useMemo(() => {
    let filtered = aggregatedItems;

    // Filter by deficit
    if (showOnlyDeficit) {
      filtered = filtered.filter(item => item.totalQuantityFound < item.totalQuantityNeeded);
    }

    // Filter by priority
    if (priorityFilter !== "all") {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Sort items
    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "needed":
          comparison = a.totalQuantityNeeded - b.totalQuantityNeeded;
          break;
        case "deficit":
          const deficitA = Math.max(0, a.totalQuantityNeeded - a.totalQuantityFound);
          const deficitB = Math.max(0, b.totalQuantityNeeded - b.totalQuantityFound);
          comparison = deficitA - deficitB;
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[b.priority as keyof typeof priorityOrder] - 
                      priorityOrder[a.priority as keyof typeof priorityOrder];
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sorted;
  }, [aggregatedItems, sortBy, sortDirection, showOnlyDeficit, priorityFilter]);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    updateGlobalItemQuantity(itemId, newQuantity);
  };

  const toggleSortDirection = () => {
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  const totalItems = aggregatedItems.length;
  const completedItems = aggregatedItems.filter(item => 
    item.totalQuantityFound >= item.totalQuantityNeeded
  ).length;
  const itemsWithDeficit = aggregatedItems.filter(item => 
    item.totalQuantityFound < item.totalQuantityNeeded
  ).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Card */}
      <Card className="glass tactical-panel border-tarkov">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tarkov-orange">
            <Package className="h-5 w-5" />
            Required Items Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded bg-tarkov-panel/50 border border-tarkov/30">
              <div className="text-2xl font-bold text-tarkov-orange">{totalItems}</div>
              <div className="text-sm text-muted-foreground">Total Items</div>
            </div>
            <div className="text-center p-4 rounded bg-green-500/10 border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">{completedItems}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center p-4 rounded bg-red-500/10 border border-red-500/30">
              <div className="text-2xl font-bold text-red-400">{itemsWithDeficit}</div>
              <div className="text-sm text-muted-foreground">Need Items</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sorting */}
      <Card className="glass tactical-panel border-tarkov">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-tarkov-orange">
            <Filter className="h-5 w-5" />
            Filters & Sorting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="sort-by">Sort by</Label>
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="bg-tarkov-panel border-tarkov">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="needed">Quantity Needed</SelectItem>
                  <SelectItem value="deficit">Deficit</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority-filter">Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="bg-tarkov-panel border-tarkov">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="show-deficit"
                checked={showOnlyDeficit}
                onCheckedChange={setShowOnlyDeficit}
              />
              <Label htmlFor="show-deficit" className="text-sm">
                Show only items with deficit
              </Label>
            </div>

            <Button
              variant="outline"
              onClick={toggleSortDirection}
              className="btn-tactical hover:glow-orange"
            >
              {sortDirection === "asc" ? (
                <SortAsc className="h-4 w-4 mr-2" />
              ) : (
                <SortDesc className="h-4 w-4 mr-2" />
              )}
              {sortDirection === "asc" ? "Ascending" : "Descending"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Items List */}
      <div className="space-y-4">
        {filteredAndSortedItems.length === 0 ? (
          <Card className="glass tactical-panel border-tarkov">
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No items found
              </h3>
              <p className="text-sm text-muted-foreground">
                {showOnlyDeficit 
                  ? "All required items have been found! Great job!"
                  : "No required items match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-tarkov-orange">
                Required Items ({filteredAndSortedItems.length})
              </h2>
              <Badge variant="outline" className="text-tarkov-orange border-tarkov-orange">
                {Math.round((completedItems / totalItems) * 100)}% Complete
              </Badge>
            </div>
            
            <div className="grid gap-4">
              {filteredAndSortedItems.map((item, index) => (
                <div
                  key={item.itemId}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <AggregatedRequiredItemDisplay
                    item={item}
                    onQuantityChange={handleQuantityChange}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}