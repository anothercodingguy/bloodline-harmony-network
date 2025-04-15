
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'approved':
      case 'fulfilled':
      case 'available':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'pending':
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      case 'rejected':
      case 'expired':
      case 'used':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'emergency':
        return 'bg-red-100 text-red-800 hover:bg-red-100 animate-pulse';
      case 'urgent':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
      case 'normal':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Badge 
      variant="outline" 
      className={cn(
        'font-medium border',
        getVariant(),
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
