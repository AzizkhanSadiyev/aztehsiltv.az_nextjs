"use client";

import { 
  LucideIcon, 
  TrendingUp, 
  TrendingDown, 
  ArrowRight,
  FileText,
  FolderTree,
  Users,
  Image,
  BarChart3,
  Settings,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  ShoppingCart,
  CreditCard,
  Package,
  Bookmark,
  Star,
  Heart,
  Zap,
  Activity
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Map of icon names to icon components
const iconMap = {
  FileText,
  FolderTree,
  Users,
  Image,
  BarChart3,
  Settings,
  Mail,
  MessageSquare,
  Bell,
  Calendar,
  ShoppingCart,
  CreditCard,
  Package,
  Bookmark,
  Star,
  Heart,
  Zap,
  Activity,
  TrendingUp,
  TrendingDown
};

type IconName = keyof typeof iconMap;

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  iconName: IconName;
  trend?: "up" | "down";
  trendValue?: string;
  color?: "blue" | "purple" | "amber" | "green" | "red" | "indigo";
  href?: string;
}

function StatCard({ 
  title, 
  value, 
  description, 
  iconName, 
  trend, 
  trendValue, 
  color = "blue",
  href
}: StatCardProps) {
  const Icon = iconMap[iconName];
  const [displayValue, setDisplayValue] = useState(0);
  const numericValue = typeof value === 'string' ? parseInt(value) : value;

  useEffect(() => {
    if (typeof numericValue === 'number') {
      let start = 0;
      const end = numericValue;
      const duration = 1500;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [numericValue]);

  // Color mappings
  const colorMap = {
    blue: {
      light: "bg-blue-50 dark:bg-blue-950/40",
      icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      ring: "ring-blue-500/20",
      trend: {
        up: "text-blue-600 dark:text-blue-400",
        down: "text-red-600 dark:text-red-400"
      },
      hover: "hover:border-blue-200 dark:hover:border-blue-800"
    },
    purple: {
      light: "bg-purple-50 dark:bg-purple-950/40",
      icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      ring: "ring-purple-500/20",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400"
      },
      hover: "hover:border-purple-200 dark:hover:border-purple-800"
    },
    amber: {
      light: "bg-amber-50 dark:bg-amber-950/40",
      icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
      ring: "ring-amber-500/20",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400"
      },
      hover: "hover:border-amber-200 dark:hover:border-amber-800"
    },
    green: {
      light: "bg-green-50 dark:bg-green-950/40",
      icon: "bg-green-500/10 text-green-600 dark:text-green-400",
      ring: "ring-green-500/20",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400"
      },
      hover: "hover:border-green-200 dark:hover:border-green-800"
    },
    red: {
      light: "bg-red-50 dark:bg-red-950/40",
      icon: "bg-red-500/10 text-red-600 dark:text-red-400",
      ring: "ring-red-500/20",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400"
      },
      hover: "hover:border-red-200 dark:hover:border-red-800"
    },
    indigo: {
      light: "bg-indigo-50 dark:bg-indigo-950/40",
      icon: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
      ring: "ring-indigo-500/20",
      trend: {
        up: "text-green-600 dark:text-green-400",
        down: "text-red-600 dark:text-red-400"
      },
      hover: "hover:border-indigo-200 dark:hover:border-indigo-800"
    }
  };

  const selectedColor = colorMap[color];

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 group border-border/60",
      "hover:shadow-md dark:shadow-none",
      "hover:border-primary/20",
      selectedColor.hover
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          selectedColor.icon,
          selectedColor.ring,
          "ring-1 shadow-sm group-hover:scale-110 transition-transform"
        )}>
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">
          {typeof value === 'number' ? displayValue.toLocaleString() : value}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {trend && trendValue && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend === "up" ? selectedColor.trend.up : selectedColor.trend.down
            )}>
              {trend === "up" ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5" />
              )}
              <span>{trendValue}</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      </CardContent>
      
      {href && (
        <CardFooter className="p-2 pt-0">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between text-xs text-muted-foreground hover:text-primary group-hover:text-primary/80 transition-colors"
            asChild
          >
            <a href={href}>
              <span>View details</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

interface DashboardStatsProps {
  stats: StatCardProps[];
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const colors: (StatCardProps["color"])[] = [
    "blue", "purple", "amber", "green", "red", "indigo"
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-fade-in">
      {stats.map((stat, index) => (
        <StatCard 
          key={index} 
          {...stat} 
          color={stat.color || colors[index % colors.length]}
        />
      ))}
    </div>
  );
}
