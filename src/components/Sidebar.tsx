import React from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Warehouse,
  Users,
  ReceiptText,
  Settings,
  ChevronDown,
  ShieldCheck,
  FileSpreadsheet,
  CreditCard,
  X,
  Plus,
} from 'lucide-react';
import { ApsLogo } from './ApsLogo';

export type NavSection =
  | 'billing'
  | 'dashboard'
  | 'payments'
  | 'statements'
  | 'warranties'
  | 'analytics'
  | 'inventory'
  | 'clients'
  | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onNavigate: (section: NavSection) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenCompanySettings?: () => void;
  onNewBill?: () => void;
  onQuickLetterhead?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile,
  onOpenCompanySettings,
  onNewBill,
}) => {
  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'billing' as NavSection,
      label: 'Invoices & Billing',
      icon: ReceiptText,
      isPrimary: true,
    },
    { id: 'payments' as NavSection, label: 'Payments & Collections', icon: CreditCard },
    { id: 'statements' as NavSection, label: 'Statement', icon: FileSpreadsheet },
    { id: 'warranties' as NavSection, label: 'Warranty', icon: ShieldCheck },
    { id: 'inventory' as NavSection, label: 'Product', icon: Warehouse },
    { id: 'clients' as NavSection, label: 'Clients', icon: Users },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'settings' as NavSection, label: 'Company Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 sm:w-72 lg:w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between p-4 transition-transform duration-200 ease-in-out shadow-2xl lg:shadow-none overflow-y-auto ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header & User Profile */}
        <div className="space-y-4">
          {/* Logo Branding & Mobile Close */}
          <div className="flex items-center justify-between px-2 py-1">
            <ApsLogo size="md" showText={true} />
            {isOpenMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg lg:hidden transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* User Profile Card */}
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
                    onNavigate(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
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
                </button>
              );
            })}

            {/* + New Bill Action Button (Circular, compact, fixed pop effect in light green) */}
            {onNewBill && (
              <div className="pt-3 flex justify-center">
                <button
                  id="nav-new-bill-btn"
                  onClick={() => {
                    onNewBill();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  title="Create New Bill / Invoice"
                  aria-label="Create New Bill / Invoice"
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-emerald-100 hover:bg-emerald-200 text-emerald-700 border border-emerald-300 shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-200 group"
                >
                  <Plus className="w-5 h-5 stroke-[2.5] text-emerald-700 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            )}
          </nav>
        </div>

        {/* Clean Sidebar Footer */}
        <div className="pt-4 border-t border-slate-100 mt-4">
          <div className="px-2 text-[10px] text-slate-400 text-center font-medium">
            Agility Power System © {new Date().getFullYear()}
          </div>
        </div>
      </aside>
    </>
  );
};
