import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  Truck,
  MapPin,
  Warehouse,
  Users,
  Wrench,
  ReceiptText,
  MessageSquare,
  Bell,
  Settings,
  ChevronDown,
  Sparkles,
  Printer,
  ShieldAlert,
  HelpCircle,
  Zap,
} from 'lucide-react';
import { ApsLogo } from './ApsLogo';

export type NavSection =
  | 'billing'
  | 'dashboard'
  | 'analytics'
  | 'workorders'
  | 'inventory'
  | 'clients'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  unreadMessages?: number;
  unreadNotifications?: number;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onQuickLetterhead: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  unreadMessages = 19,
  unreadNotifications = 5,
  isOpenMobile = false,
  onCloseMobile,
  onQuickLetterhead,
}) => {
  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'workorders' as NavSection, label: 'Work Orders', icon: Truck },
    { id: 'inventory' as NavSection, label: 'Parts & Catalog', icon: Warehouse },
    { id: 'clients' as NavSection, label: 'Clients & Stations', icon: Users },
    {
      id: 'billing' as NavSection,
      label: 'Invoices & Billing',
      icon: ReceiptText,
      isPrimary: true,
    },
    {
      id: 'messages',
      label: 'Message',
      icon: MessageSquare,
      badge: unreadMessages,
      isNavDisabled: true,
    },
    {
      id: 'notification',
      label: 'Notification',
      icon: Bell,
      badge: unreadNotifications,
      isNavDisabled: true,
    },
    { id: 'settings' as NavSection, label: 'Company Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header & User Profile */}
        <div className="space-y-4">
          {/* Logo Branding */}
          <div className="flex items-center gap-2.5 px-2 py-1">
            <ApsLogo size="md" showText={true} />
          </div>

          {/* User Profile Card matching Image 1 */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                EA
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  Engr. Agility
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Admin</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>

          {/* Navigation Menu */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    if (!item.isNavDisabled && item.id) {
                      onNavigate(item.id as NavSection);
                      if (onCloseMobile) onCloseMobile();
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-rose-50/80 text-rose-600 font-bold border border-rose-100 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 stroke-[2] ${
                        isActive ? 'text-rose-500' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[10px] font-bold bg-[#ff4d4f] text-white rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card matching Image 1 "Loving ShipNow Free? Go Pro Today" */}
        <div className="space-y-3 pt-4">
          <div className="p-4 rounded-2xl bg-[#171717] text-white space-y-2.5 relative overflow-hidden shadow-md">
            {/* Subtle background graphic pattern */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-rose-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />
              <span>Official APS Letterhead</span>
            </div>

            <p className="text-[11px] text-slate-300 leading-snug">
              Instant print & export vouchers on Agility Power System official pad.
            </p>

            <button
              onClick={onQuickLetterhead}
              className="w-full py-1.5 bg-white hover:bg-slate-100 text-slate-900 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-98 flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-700" />
              <span>Print Letterhead</span>
            </button>
          </div>

          <div className="px-2 text-[10px] text-slate-400 text-center">
            Copyright © {new Date().getFullYear()} Agility Power System
          </div>
        </div>
      </aside>
    </>
  );
};
