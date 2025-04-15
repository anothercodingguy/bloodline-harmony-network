
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  DropletIcon,
  HomeIcon,
  PlusCircleIcon,
  SearchIcon,
  DatabaseIcon,
  ClipboardListIcon,
  HistoryIcon,
  MenuIcon,
  XIcon,
  LogOutIcon,
  UserIcon,
  ShieldIcon,
} from 'lucide-react';

type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  role: ('admin' | 'donor' | 'requester')[];
};

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    role: ['admin', 'donor', 'requester'],
  },
  {
    title: 'Admin Dashboard',
    href: '/admin',
    icon: ShieldIcon,
    role: ['admin'],
  },
  {
    title: 'Donor Registration',
    href: '/donor-registration',
    icon: PlusCircleIcon,
    role: ['admin', 'donor'],
  },
  {
    title: 'Blood Inventory',
    href: '/blood-inventory',
    icon: DatabaseIcon,
    role: ['admin', 'donor', 'requester'],
  },
  {
    title: 'Blood Requests',
    href: '/blood-requests',
    icon: ClipboardListIcon,
    role: ['admin', 'donor', 'requester'],
  },
  {
    title: 'Donation History',
    href: '/donation-history',
    icon: HistoryIcon,
    role: ['admin', 'donor'],
  },
  {
    title: 'Request History',
    href: '/request-history',
    icon: HistoryIcon,
    role: ['admin', 'requester'],
  },
  {
    title: 'Search',
    href: '/search',
    icon: SearchIcon,
    role: ['admin', 'donor', 'requester'],
  },
];

export function Sidebar() {
  const { role, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const closeSidebar = () => setIsOpen(false);

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    item => role && item.role.includes(role)
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white shadow-md"
        >
          <MenuIcon className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar flex flex-col fixed top-0 left-0 h-full z-40 w-64 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
            <DropletIcon className="h-6 w-6 text-blood-500" />
            <span className="text-lg font-semibold text-white">BloodBank</span>
          </Link>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-sidebar-foreground" 
            onClick={closeSidebar}
          >
            <XIcon className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto">
          <nav className="px-2 space-y-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-sidebar-accent text-blood-500"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.title}
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent/50"
            onClick={() => {
              logout();
              closeSidebar();
            }}
          >
            <LogOutIcon className="mr-2 h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
