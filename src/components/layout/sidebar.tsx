"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Home,
  Trophy,
  Building,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LevelSelector } from "./level-selector";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
}

const navigation: NavigationItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: Trophy,
  },
  {
    name: "Hideout",
    href: "/hideout",
    icon: Building,
  },
  {
    name: "Items",
    href: "/items",
    icon: Package,
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        "flex flex-col border-r transition-all duration-300 animate-slide-in-left backdrop-blur-md h-full",
        collapsed ? "w-16" : "w-64"
      )}
      style={{
        backgroundColor: `hsl(var(--sidebar-bg))`,
        borderColor: `hsl(var(--sidebar-border))`,
      }}
    >
      <div
        className="flex h-16 items-center justify-between px-4 border-b"
        style={{
          borderColor: `hsl(var(--sidebar-border))`,
        }}
      >
        {!collapsed && (
          <h2 className="text-lg font-semibold text-tarkov-orange">
            Navigation
          </h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 btn-tactical hover:glow-orange"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4 text-tarkov-orange" />
          ) : (
            <ChevronLeft className="h-4 w-4 text-tarkov-orange" />
          )}
        </Button>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item, index) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={cn(
                "w-full justify-start transition-all duration-200 animate-fade-in",
                collapsed && "justify-center px-2",
                isActive
                  ? "route-active text-tarkov-orange"
                  : "border border-transparent cursor-pointer nav-item-hover"
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
              disabled={item.disabled}
              onClick={() => {
                if (!item.disabled && !isActive) {
                  router.push(item.href);
                }
              }}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  !collapsed && "mr-3",
                  isActive ? "text-tarkov-orange" : "text-muted-foreground"
                )}
              />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-muted text-muted-foreground border-muted-foreground"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Level Selector - only show when not collapsed */}
      {!collapsed && (
        <div
          className="p-4 border-t"
          style={{ borderColor: `hsl(var(--sidebar-border))` }}
        >
          <LevelSelector />
        </div>
      )}
    </div>
  );
}
