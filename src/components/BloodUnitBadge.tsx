
import React from 'react';
import { cn } from '@/lib/utils';
import { BloodGroup } from '@/models/types';

interface BloodUnitBadgeProps {
  bloodGroup: BloodGroup;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BloodUnitBadge({ 
  bloodGroup, 
  size = 'md', 
  className 
}: BloodUnitBadgeProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-1';
      case 'lg':
        return 'text-base px-4 py-2';
      default:
        return 'text-sm px-3 py-1.5';
    }
  };

  const getColorClasses = () => {
    switch (bloodGroup) {
      case 'A+':
      case 'A-':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'B+':
      case 'B-':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'AB+':
      case 'AB-':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'O+':
      case 'O-':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center justify-center rounded-full border font-medium',
      getSizeClasses(),
      getColorClasses(),
      className
    )}>
      {bloodGroup}
    </span>
  );
}
