
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface ProgressCardProps {
  title: string;
  current: number;
  max: number;
  colorClass?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function ProgressCard({
  title,
  current,
  max,
  colorClass = 'bg-blood-500',
  formatValue = (value) => value.toString(),
  className,
}: ProgressCardProps) {
  const percentage = Math.round((current / max) * 100);
  
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold">{formatValue(current)}</span>
          <span className="text-sm text-muted-foreground">of {formatValue(max)}</span>
        </div>
        <div className="relative">
          <Progress 
            value={percentage} 
            className="h-2" 
            indicatorClassName={colorClass} 
          />
        </div>
      </CardContent>
    </Card>
  );
}
