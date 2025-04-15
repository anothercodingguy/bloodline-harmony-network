
import React from 'react';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="w-64">
          <Skeleton className="h-full w-full" />
        </div>
        <div className="flex-1 p-8">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <Skeleton className="h-[calc(100vh-144px)] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      
      <main className="flex-1 md:ml-64">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                {user.role === 'admin' ? 'Administrator' : 
                 user.role === 'donor' ? 'Donor' : 'Requester'}
              </span>
              <div className="h-8 w-8 rounded-full bg-blood-500 flex items-center justify-center text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
          
          {children}
        </div>
      </main>
    </div>
  );
}
