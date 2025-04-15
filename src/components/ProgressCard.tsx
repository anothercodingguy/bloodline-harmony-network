
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProgressCardProps {
  title: string;
  current: number;
  max: number;
  colorClass?: string;
}

export function ProgressCard({ title, current, max, colorClass = "bg-primary" }: ProgressCardProps) {
  const percentage = Math.round((current / max) * 100);
  
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">{title}</span>
          <span className="text-sm text-muted-foreground">
            {current} / {max} units
          </span>
        </div>
        <Progress
          value={percentage}
          className="h-2"
          // Use the Progress component's built-in className prop for styling
          style={{ 
            '--progress-background': `var(--${colorClass.replace('bg-', '')})` 
          } as React.CSSProperties}
        />
      </CardContent>
    </Card>
  );
}
