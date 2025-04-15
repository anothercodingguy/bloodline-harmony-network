
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {icon && <div className="text-blood-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold">{value}</div>
          {trend && (
            <div
              className={cn(
                "ml-2 text-sm font-medium flex items-center",
                trend.isPositive ? "text-green-600" : "text-destructive"
              )}
            >
              <span className={trend.isPositive ? "text-green-600" : "text-destructive"}>
                {trend.isPositive ? "↑" : "↓"}
              </span>
              <span className="ml-1">{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
