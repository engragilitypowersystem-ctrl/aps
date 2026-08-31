import React from 'react';
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  PieChart,
  ShieldCheck,
  Clock,
  ArrowUpRight,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, formatShortCurrency } from '../utils/formatters';

interface AnalyticsViewProps {
  invoices: Invoice[];
  currency: 'BDT' | 'USD';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  invoices,
  currency,
}) => {
  const totalBilled = invoices.reduce((s, i) => s + i.total, 0);
  const paidInvoices = invoices.filter((i) => i.status === 'paid');
  const paidTotal = paidInvoices.reduce((s, i) => s + i.total, 0);
  const unpaidInvoices = invoices.filter(
    (i) => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'pending'
  );
  const unpaidTotal = unpaidInvoices.reduce((s, i) => s + i.total, 0);
  const collectionRate =
    totalBilled > 0 ? Math.round((paidTotal / totalBilled) * 100) : 0;

  // Breakdown by Service / Product Category
  const categoryMap: Record<string, number> = {};
  invoices.forEach((inv) => {
    inv.items.forEach((item) => {
      const cat = item.category || 'General Services';
      categoryMap[cat] = (categoryMap[cat] || 0) + item.amount;
    });
  });

  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-6">
      {/* Top Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Invoiced
            </span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {formatShortCurrency(totalBilled, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {invoices.length} total generated bills
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Realized / Paid
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">
            {formatShortCurrency(paidTotal, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {paidInvoices.length} settled vouchers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Receivables / Outstanding
            </span>
            <Clock className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">
            {formatShortCurrency(unpaidTotal, currency)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {unpaidInvoices.length} pending / overdue invoices
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Collection Rate
            </span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">
            {collectionRate}%
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Breakdown by Service Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Revenue by Service & Product Stream
          </h3>

          <div className="space-y-3.5">
            {categories.map(([cat, amount]) => {
              const pct = totalBilled > 0 ? Math.round((amount / totalBilled) * 100) : 0;
              return (
                <div key={cat} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="font-semibold">{cat}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatCurrency(amount, currency)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payment History */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Latest Cleared Invoices & Receipts
          </h3>

          <div className="divide-y divide-slate-100">
            {paidInvoices.slice(0, 5).map((inv) => (
              <div key={inv.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-slate-900">
                    {inv.client.name}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    #{inv.invoiceNumber} • {inv.refNumber}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-700 font-mono">
                    {formatCurrency(inv.total, currency)}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Paid on {inv.paidAt || inv.issueDate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
