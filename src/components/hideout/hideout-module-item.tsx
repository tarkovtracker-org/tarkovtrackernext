"use client";

import { HideoutModule } from "@/lib/types";
import { useAppContext } from "@/lib/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Shield,
  Wrench,
  Heart,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  ArrowUp,
} from "lucide-react";

interface HideoutModuleItemProps {
  module: HideoutModule;
}

const iconMap = {
  shield: Shield,
  wrench: Wrench,
  heart: Heart,
  home: Home,
};

export function HideoutModuleItem({ module }: HideoutModuleItemProps) {
  const { upgradeHideoutModule, updateRequiredItemQuantity, canUpgradeModule } =
    useAppContext();

  const Icon = iconMap[module.icon as keyof typeof iconMap] || Home;
  const progress = (module.currentLevel / module.maxLevel) * 100;
  const nextLevel = module.currentLevel + 1;
  const nextLevelRequirements = module.requirementsPerLevel[nextLevel];
  const canUpgrade = canUpgradeModule(module.id);
  const isMaxLevel = module.currentLevel >= module.maxLevel;

  const handleUpgrade = () => {
    if (canUpgrade) {
      upgradeHideoutModule(module.id);
    }
  };

  const handleItemQuantityChange = (itemId: string, quantityFound: number) => {
    updateRequiredItemQuantity(module.id, nextLevel, itemId, quantityFound);
  };

  return (
    <Card className="glass tactical-panel weathered animate-fade-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-tarkov-panel border border-tarkov">
              <Icon className="h-6 w-6 text-tarkov-orange" />
            </div>
            <div>
              <CardTitle className="text-xl text-foreground">
                {module.name}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {module.description}
              </CardDescription>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-tarkov-orange">
              {module.currentLevel}/{module.maxLevel}
            </div>
            <div className="text-sm text-muted-foreground">Level</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Level Benefits */}
        {module.bonuses.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-muted-foreground mb-2">
              Current Benefits
            </h4>
            <div className="flex flex-wrap gap-2">
              {module.bonuses
                .slice(0, module.currentLevel)
                .map((bonus, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {bonus}
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Upgrade Section */}
        {!isMaxLevel && nextLevelRequirements && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-foreground">
                Upgrade to Level {nextLevel}
              </h4>
              {module.constructionTime && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-1" />
                  {module.constructionTime}
                </div>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="requirements" className="border-tarkov">
                <AccordionTrigger className="text-sm hover:text-tarkov-orange">
                  Requirements ({nextLevelRequirements.requiredItems.length}{" "}
                  items)
                </AccordionTrigger>
                <AccordionContent className="space-y-3">
                  {/* Required Items */}
                  {nextLevelRequirements.requiredItems.map((item) => {
                    const isComplete =
                      item.quantityFound >= item.quantityNeeded;
                    return (
                      <div
                        key={item.itemId}
                        className="flex items-center justify-between p-3 rounded-lg bg-tarkov-panel border border-tarkov"
                      >
                        <div className="flex items-center space-x-3">
                          {isComplete ? (
                            <CheckCircle className="h-5 w-5 text-success" />
                          ) : (
                            <XCircle className="h-5 w-5 text-destructive" />
                          )}
                          <div>
                            <div className="font-medium text-foreground">
                              {item.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.quantityFound}/{item.quantityNeeded}
                              {item.fir && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-xs"
                                >
                                  FIR
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleItemQuantityChange(
                                item.itemId,
                                Math.max(0, item.quantityFound - 1)
                              )
                            }
                            disabled={item.quantityFound <= 0}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center text-sm">
                            {item.quantityFound}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleItemQuantityChange(
                                item.itemId,
                                Math.min(
                                  item.quantityNeeded,
                                  item.quantityFound + 1
                                )
                              )
                            }
                            disabled={item.quantityFound >= item.quantityNeeded}
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Required Modules */}
                  {nextLevelRequirements.requiredModules.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm text-muted-foreground">
                        Required Modules
                      </h5>
                      {nextLevelRequirements.requiredModules.map(
                        (reqModule) => (
                          <div
                            key={reqModule.moduleId}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <CheckCircle className="h-4 w-4 text-success" />
                            <span className="text-foreground">
                              {reqModule.moduleId} Level {reqModule.level}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <Button
              onClick={handleUpgrade}
              disabled={!canUpgrade}
              className={`w-full ${
                canUpgrade ? "btn-success" : "btn-tactical"
              }`}
              variant={canUpgrade ? "default" : "secondary"}
            >
              <ArrowUp className="h-4 w-4 mr-2" />
              {canUpgrade
                ? `Upgrade to Level ${nextLevel}`
                : "Requirements Not Met"}
            </Button>
          </div>
        )}

        {isMaxLevel && (
          <div className="text-center py-4">
            <Badge variant="secondary" className="text-success border-success">
              <CheckCircle className="h-4 w-4 mr-1" />
              Max Level Reached
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
