import React from 'react';
import { ShieldCheck, Receipt, Clock, AlertCircle } from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { formatShortCurrency } from '../utils/formatters';

interface HeaderStatsProps {
  invoices: Invoice[];
  activeFilter: InvoiceStatus | 'all';
  onFilterChange: (status: InvoiceStatus | 'all') => void;
  currency: 'BDT' | 'USD';
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  invoices,
  activeFilter,
  onFilterChange,
  currency,
}) => {
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid');
  const pendingInvoices = invoices.filter((i) => i.status === 'pending');
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');

  const paidTotal = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const unpaidTotal = unpaidInvoices.reduce((sum, i) => sum + i.total, 0);
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.total, 0);
  const overdueTotal = overdueInvoices.reduce((sum, i) => sum + i.total, 0);

  const stats = [
    {
      id: 'paid' as InvoiceStatus,
      label: 'Paid Invoices',
      amount: paidTotal,
      count: paidInvoices.length,
      icon: ShieldCheck,
      iconBg: 'bg-[#ff4d4f] text-white',
      badgeColor: 'text-emerald-600',
    },
    {
      id: 'unpaid' as InvoiceStatus,
      label: 'Unpaid Invoices',
      amount: unpaidTotal,
      count: unpaidInvoices.length,
      icon: Receipt,
      iconBg: 'bg-[#ff4d4f] text-white',
      badgeColor: 'text-rose-600',
    },
    {
      id: 'pending' as InvoiceStatus,
      label: 'Pending Invoices',
      amount: pendingTotal,
      count: pendingInvoices.length,
      icon: AlertCircle,
      iconBg: 'bg-[#ff4d4f] text-white',
      badgeColor: 'text-amber-600',
    },
    {
      id: 'overdue' as InvoiceStatus,
      label: 'Overdue Invoices',
      amount: overdueTotal,
      count: overdueInvoices.length,
      icon: Clock,
      iconBg: 'bg-[#ff4d4f] text-white',
      badgeColor: 'text-red-700',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const isSelected = activeFilter === stat.id;

        return (
          <button
            key={stat.id}
            id={`stat-card-${stat.id}`}
            onClick={() => onFilterChange(isSelected ? 'all' : stat.id)}
            className={`flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white transition-all text-left border ${
              isSelected
                ? 'border-rose-400 ring-2 ring-rose-100 shadow-sm'
                : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            {/* Red / Coral Icon rounded container matching Image 1 */}
            <div
              className={`w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.iconBg} shadow-xs`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate mb-0.5">
                {stat.label}
              </div>
              <div className="text-base sm:text-xl xl:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                {formatShortCurrency(stat.amount, currency)}
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                <span className="hidden sm:inline">from</span>
                <span className={`font-semibold ${stat.badgeColor}`}>
                  {stat.count} {stat.count === 1 ? 'Invoice' : 'Invoices'}
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
