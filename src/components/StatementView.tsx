import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Download,
  Calendar,
  Filter,
  Search,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  CreditCard,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Invoice, Client, CompanyProfile, InvoiceStatus } from '../types';
import { formatCurrency, formatDate, numberToTakaWords } from '../utils/formatters';
import { ApsLogo } from './ApsLogo';

interface StatementViewProps {
  invoices: Invoice[];
  clients: Client[];
  company: CompanyProfile;
  currency: 'BDT' | 'USD';
  onOpenInvoice?: (invoiceId: string) => void;
  onViewClientProfile?: (client: Client) => void;
}

type PeriodPreset = 'all' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export const StatementView: React.FC<StatementViewProps> = ({
  invoices,
  clients,
  company,
  currency,
  onOpenInvoice,
  onViewClientProfile,
}) => {
  // State
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'interactive' | 'print_preview'>('interactive');
  const [expandedInvoiceId, setExpandedInvoiceId] = useState<string | null>(null);

  // Set date ranges when preset changes
  const handlePresetChange = (preset: PeriodPreset) => {
    setPeriodPreset(preset);
    const now = new Date();
    if (preset === 'this_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        .toISOString()
        .split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'last_month') {
      const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        .toISOString()
        .split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth(), 0)
        .toISOString()
        .split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'this_year') {
      const firstDay = new Date(now.getFullYear(), 0, 1)
        .toISOString()
        .split('T')[0];
      const lastDay = new Date(now.getFullYear(), 11, 31)
        .toISOString()
        .split('T')[0];
      setStartDate(firstDay);
      setEndDate(lastDay);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Selected client object if specific
  const selectedClient = useMemo(() => {
    if (selectedClientId === 'all') return null;
    return clients.find((c) => c.id === selectedClientId) || null;
  }, [clients, selectedClientId]);

  // Filter invoices based on selection
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => {
        // Client filter
        if (selectedClientId !== 'all' && inv.client.id !== selectedClientId) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'unpaid' && (inv.status === 'unpaid' || inv.status === 'overdue' || inv.status === 'pending')) {
            // Include all unpaid variants
          } else if (inv.status !== statusFilter) {
            return false;
          }
        }

        // Date range filter
        const invDate = inv.issueDate || inv.createdAt;
        if (startDate && invDate < startDate) return false;
        if (endDate && invDate > endDate) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchNum = inv.invoiceNumber.toLowerCase().includes(q);
          const matchRef = inv.refNumber.toLowerCase().includes(q);
          const matchClient = inv.client.name.toLowerCase().includes(q);
          const matchItems = inv.items.some((it) =>
            it.description.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)
          );
          if (!matchNum && !matchRef && !matchClient && !matchItems) return false;
        }

        return true;
      })
      .sort((a, b) => new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()); // Chronological for statement
  }, [invoices, selectedClientId, statusFilter, startDate, endDate, searchQuery]);

  // Calculate Ledger Running Balances and Totals
  const { ledgerEntries, totalBilled, totalPaid, totalDue, paidCount, dueCount } = useMemo(() => {
    let runningBalance = 0;
    let billedSum = 0;
    let paidSum = 0;
    let dueSum = 0;
    let pCount = 0;
    let dCount = 0;

    const entries = filteredInvoices.map((inv) => {
      const isPaid = inv.status === 'paid';
      const invoicedAmount = inv.total;
      const paidAmount = isPaid ? inv.total : 0;
      const dueAmount = isPaid ? 0 : inv.total;

      billedSum += invoicedAmount;
      paidSum += paidAmount;
      dueSum += dueAmount;

      if (isPaid) pCount++;
      else dCount++;

      runningBalance += dueAmount;

      return {
        ...inv,
        invoicedAmount,
        paidAmount,
        dueAmount,
        runningBalance,
      };
    });

    return {
      ledgerEntries: entries,
      totalBilled: billedSum,
      totalPaid: paidSum,
      totalDue: dueSum,
      paidCount: pCount,
      dueCount: dCount,
    };
  }, [filteredInvoices]);

  // Print Statement Handler
  const handlePrint = () => {
    window.print();
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const title = selectedClient
      ? `Statement_${selectedClient.name.replace(/[^a-zA-Z0-9]/g, '_')}`
      : 'APS_Master_Account_Statement';

    const headers = [
      'Date',
      'Invoice #',
      'Ref / Work Order',
      'Client Name',
      'Services / Items',
      'Invoiced Amount (BDT)',
      'Paid Amount (BDT)',
      'Due Balance (BDT)',
      'Status',
    ];

    const rows = ledgerEntries.map((e) => [
      `"${e.issueDate}"`,
      `"${e.invoiceNumber}"`,
      `"${e.refNumber}"`,
      `"${e.client.name}"`,
      `"${e.items.map((i) => i.description).join('; ')}"`,
      e.invoicedAmount,
      e.paidAmount,
      e.dueAmount,
      `"${e.status.toUpperCase()}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${title}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Period label string
  const periodLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} – ${formatDate(endDate)}`;
    }
    if (startDate) return `From ${formatDate(startDate)}`;
    if (endDate) return `Until ${formatDate(endDate)}`;
    return 'All Time / Complete Fiscal Record';
  }, [startDate, endDate]);

  return (
    <div className="space-y-6">
      {/* Top Action & Mode Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs no-print">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/70">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Account Statement & Ledger
            </h2>
            <p className="text-xs text-slate-500">
              {selectedClient
                ? `Financial statement for ${selectedClient.name}`
                : 'Master financial statement and transaction ledger for all clients'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setViewMode('interactive')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                viewMode === 'interactive'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interactive Table
            </button>
            <button
              onClick={() => setViewMode('print_preview')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                viewMode === 'print_preview'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Official Print Pad</span>
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Download Statement as CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV Export</span>
          </button>

          {/* Direct Print Button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#171717] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Printer className="w-4 h-4" />
            <span>Print Statement</span>
          </button>
        </div>
      </div>

      {/* Filter and Configuration Controls (Hidden during print) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 no-print">
        {/* Row 1: Client Selector & Period Presets */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Client dropdown */}
          <div className="md:col-span-4">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Select Client / Account
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all truncate"
              >
                <option value="all">🏢 All Clients (Master Statement)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period presets */}
          <div className="md:col-span-5">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Statement Period Preset
            </label>
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl overflow-x-auto text-xs">
              {[
                { id: 'all', label: 'All Time' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_month', label: 'Last Month' },
                { id: 'this_year', label: '2026' },
                { id: 'custom', label: 'Custom' },
              ].map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetChange(preset.id as PeriodPreset)}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
                    periodPreset === preset.id
                      ? 'bg-white text-slate-900 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status filter */}
          <div className="md:col-span-3">
            <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-1">
              Payment Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | InvoiceStatus)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
            >
              <option value="all">All Invoices & Vouchers</option>
              <option value="unpaid">Due / Unpaid Only</option>
              <option value="paid">Paid & Settled Only</option>
              <option value="overdue">Overdue Invoices</option>
            </select>
          </div>
        </div>

        {/* Row 2: Custom Date Pickers (if custom or needed) & Search */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 items-center">
          <div className="sm:col-span-6 flex items-center gap-2">
            <div className="flex-1">
              <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">From Date:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">To Date:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPeriodPreset('custom');
                }}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-700"
              />
            </div>
          </div>

          <div className="sm:col-span-6">
            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">Quick Search:</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search invoice #, work order #, service description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 no-print">
        {/* Total Billed */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Invoiced</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg shrink-0">
              <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-slate-900 truncate">
            {formatCurrency(totalBilled, currency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 flex items-center gap-1 truncate">
            <span>{ledgerEntries.length} invoice(s)</span>
          </div>
        </div>

        {/* Total Received / Paid */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Cleared</span>
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-emerald-700 truncate">
            {formatCurrency(totalPaid, currency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 mt-1 font-medium truncate">
            {paidCount} settled invoice(s)
          </div>
        </div>

        {/* Net Due / Outstanding */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-200/80 shadow-2xs bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-rose-700 truncate">Outstanding Due</span>
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-rose-600 truncate">
            {formatCurrency(totalDue, currency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-rose-600 mt-1 font-medium truncate">
            {dueCount} pending payment(s)
          </div>
        </div>

        {/* Collection Ratio */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Collection Rate</span>
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-blue-800 truncate">
            {totalBilled > 0 ? `${Math.round((totalPaid / totalBilled) * 100)}%` : '100%'}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{ width: `${totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Selected Client Card Details if filtering for specific client */}
      {selectedClient && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-800 font-bold shadow-2xs">
              <Building className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  {selectedClient.name}
                </h3>
                {selectedClient.industry && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-semibold">
                    {selectedClient.industry}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
                <span>Contact: <strong>{selectedClient.contactPerson}</strong></span>
                <span>• Phone: <strong>{selectedClient.phone}</strong></span>
                <span>• Location: <strong>{selectedClient.city}</strong></span>
              </div>
            </div>
          </div>

          {onViewClientProfile && (
            <button
              onClick={() => onViewClientProfile(selectedClient)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-colors self-start sm:self-auto shadow-2xs"
            >
              View Station Profile →
            </button>
          )}
        </div>
      )}

      {/* View Mode 1: Interactive Table View */}
      {viewMode === 'interactive' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden no-print">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Transaction Statement Ledger ({ledgerEntries.length} Records)
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Period: <span className="font-semibold text-slate-800">{periodLabel}</span>
            </div>
          </div>

          {ledgerEntries.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Transactions in Selected Period</p>
              <p className="text-xs text-slate-500">Try choosing a different date range or client filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Invoice / Ref #</th>
                    <th className="py-3 px-4">Client / Station</th>
                    <th className="py-3 px-4">Services / Items</th>
                    <th className="py-3 px-4 text-right">Invoiced (Debit)</th>
                    <th className="py-3 px-4 text-right">Paid (Credit)</th>
                    <th className="py-3 px-4 text-right">Due Balance</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry) => {
                    const isExpanded = expandedInvoiceId === entry.id;
                    const isPaid = entry.status === 'paid';

                    return (
                      <React.Fragment key={entry.id}>
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono text-slate-700 whitespace-nowrap">
                            {formatDate(entry.issueDate)}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <button
                              onClick={() => onOpenInvoice && onOpenInvoice(entry.id)}
                              className="font-bold text-rose-600 hover:underline block"
                            >
                              {entry.invoiceNumber}
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {entry.refNumber}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900">{entry.client.name}</div>
                            <div className="text-[10px] text-slate-400">{entry.client.city}</div>
                          </td>
                          <td className="py-3 px-4 max-w-[220px]">
                            <div className="truncate text-slate-700 font-medium">
                              {entry.items[0]?.description || 'Equipment & Service'}
                            </div>
                            {entry.items.length > 1 && (
                              <button
                                onClick={() =>
                                  setExpandedInvoiceId(isExpanded ? null : entry.id)
                                }
                                className="text-[10px] text-blue-600 font-semibold hover:underline flex items-center gap-0.5 mt-0.5"
                              >
                                <span>+{entry.items.length - 1} more items</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-2.5 h-2.5" />
                                ) : (
                                  <ChevronDown className="w-2.5 h-2.5" />
                                )}
                              </button>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {formatCurrency(entry.invoicedAmount, currency)}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-semibold text-emerald-700 whitespace-nowrap">
                            {entry.paidAmount > 0 ? formatCurrency(entry.paidAmount, currency) : '-'}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                            {entry.dueAmount > 0 ? (
                              <span className="text-rose-600">{formatCurrency(entry.dueAmount, currency)}</span>
                            ) : (
                              <span className="text-slate-400">৳0.00</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {isPaid ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>PAID</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <Clock className="w-3 h-3 text-rose-600" />
                                <span>DUE</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => onOpenInvoice && onOpenInvoice(entry.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            >
                              View
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Item Sub-rows */}
                        {isExpanded && (
                          <tr className="bg-slate-50/70">
                            <td colSpan={9} className="p-3 pl-12 border-t border-b border-slate-200">
                              <div className="space-y-1 text-xs">
                                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                  Invoice Line Items Breakdown:
                                </div>
                                <div className="divide-y divide-slate-200/60 bg-white rounded-lg border border-slate-200 p-2">
                                  {entry.items.map((it, idx) => (
                                    <div
                                      key={idx}
                                      className="py-1.5 flex items-center justify-between text-xs"
                                    >
                                      <div>
                                        <span className="font-semibold text-slate-800">
                                          {it.description}
                                        </span>
                                        <span className="text-[10px] text-slate-400 ml-2">
                                          ({it.category})
                                        </span>
                                        {it.warrantyPeriod && it.warrantyPeriod !== 'None' && (
                                          <span className="text-[10px] text-emerald-700 font-bold ml-2 bg-emerald-50 px-1.5 py-0.5 rounded">
                                            Warranty: {it.warrantyPeriod}
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-mono text-slate-700 font-medium">
                                        {it.quantity} {it.unit || 'unit'} × ৳{it.unitPrice.toLocaleString()} ={' '}
                                        <strong className="text-slate-900">
                                          ৳{it.amount.toLocaleString()}
                                        </strong>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
                {/* Table Footer Totals */}
                <tfoot className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-right uppercase tracking-wider">
                      Statement Grand Totals:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900">
                      {formatCurrency(totalBilled, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800">
                      {formatCurrency(totalPaid, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-700">
                      {formatCurrency(totalDue, currency)}
                    </td>
                    <td colSpan={2} className="py-3 px-4 text-center text-[11px] text-slate-600">
                      {dueCount === 0 ? 'Fully Cleared ✓' : `${dueCount} Bill(s) Unsettled`}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View Mode 2 & Print Template: Official A4 Statement Pad Layout */}
      <div
        className={`${
          viewMode === 'print_preview' ? 'block' : 'hidden print:block'
        } bg-white shadow-xl rounded-xl border border-slate-300 max-w-4xl mx-auto overflow-hidden relative print:shadow-none print:border-0 print:m-0 print:max-w-full`}
      >
        {/* Background Watermark for Official Print */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
          <ApsLogo size="watermark" />
        </div>

        <div className="p-6 sm:p-10 relative z-10 space-y-6">
          {/* Official Letterhead Header */}
          <div className="border-b-2 border-slate-800 pb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-14 shrink-0">
                  <ApsLogo size="lg" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-black tracking-tight flex items-center flex-wrap">
                    <span className="text-[#1b5e20]">AGILITY </span>
                    <span className="text-[#b71c1c] ml-1.5">POWER </span>
                    <span className="text-[#1b5e20] ml-1.5">SYSTEM</span>
                  </h1>
                  <p className="text-[10px] font-semibold text-slate-700 tracking-tight">
                    {company.tagline}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    {company.officeAddress} | Mob: {company.phones.join(', ')} | Email: {company.email}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-[11px] font-black uppercase tracking-widest">
                  STATEMENT OF ACCOUNT
                </span>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Date: {formatDate(new Date().toISOString())}
                </div>
              </div>
            </div>
          </div>

          {/* Statement Account Details Box */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Account / Client Details
              </div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                {selectedClient ? selectedClient.name : 'ALL STATIONS & CLIENTS MASTER LEDGER'}
              </div>
              {selectedClient ? (
                <div className="text-[11px] text-slate-600 mt-0.5 space-y-0.5">
                  <div>{selectedClient.address}, {selectedClient.city}</div>
                  <div>Attn: <strong>{selectedClient.contactPerson}</strong> ({selectedClient.phone})</div>
                  <div>Email: {selectedClient.email}</div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Consolidated Statement of all Agility Power System industrial billing operations.
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Statement Parameters
              </div>
              <div className="text-xs font-semibold text-slate-800">
                Period: <span className="font-bold">{periodLabel}</span>
              </div>
              <div className="text-[11px] text-slate-600">
                Total Invoiced: <strong className="font-mono">{formatCurrency(totalBilled, currency)}</strong>
              </div>
              <div className="text-[11px] text-emerald-700">
                Total Cleared: <strong className="font-mono">{formatCurrency(totalPaid, currency)}</strong>
              </div>
              <div className="text-xs font-black text-rose-700 pt-1 border-t border-slate-200">
                Net Outstanding Due: <span className="font-mono text-sm">{formatCurrency(totalDue, currency)}</span>
              </div>
            </div>
          </div>

          {/* Statement Ledger Table */}
          <div>
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Itemized Invoicing & Payment History</span>
              <span className="text-[10px] text-slate-500 font-normal">
                Amounts expressed in Bangladeshi Taka ({currency})
              </span>
            </div>

            <table className="w-full text-left text-[11px] border-collapse border border-slate-300">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-300">
                <tr>
                  <th className="py-2 px-2.5 border-r border-slate-300">Date</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Invoice #</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Work Order / Ref</th>
                  <th className="py-2 px-2.5 border-r border-slate-300">Description / Job Scope</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 text-right">Debit (৳)</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 text-right">Credit (৳)</th>
                  <th className="py-2 px-2.5 border-r border-slate-300 text-right">Due (৳)</th>
                  <th className="py-2 px-2.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {ledgerEntries.map((e, idx) => (
                  <tr key={e.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-1.5 px-2.5 font-mono border-r border-slate-200 whitespace-nowrap">
                      {formatDate(e.issueDate)}
                    </td>
                    <td className="py-1.5 px-2.5 font-bold font-mono border-r border-slate-200 whitespace-nowrap">
                      {e.invoiceNumber}
                    </td>
                    <td className="py-1.5 px-2.5 font-mono text-slate-600 border-r border-slate-200 whitespace-nowrap">
                      {e.refNumber}
                    </td>
                    <td className="py-1.5 px-2.5 border-r border-slate-200">
                      <div className="font-semibold text-slate-800">
                        {e.items[0]?.description || 'Equipment Spare & Service'}
                      </div>
                      <div className="text-[9px] text-slate-500">
                        {e.client.name} ({e.items.length} item{e.items.length > 1 ? 's' : ''})
                      </div>
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-semibold border-r border-slate-200 whitespace-nowrap">
                      ৳{e.invoicedAmount.toLocaleString()}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-semibold text-emerald-700 border-r border-slate-200 whitespace-nowrap">
                      {e.paidAmount > 0 ? `৳${e.paidAmount.toLocaleString()}` : '-'}
                    </td>
                    <td className="py-1.5 px-2.5 text-right font-mono font-bold text-rose-700 border-r border-slate-200 whitespace-nowrap">
                      {e.dueAmount > 0 ? `৳${e.dueAmount.toLocaleString()}` : '৳0'}
                    </td>
                    <td className="py-1.5 px-2.5 text-center font-bold text-[10px] whitespace-nowrap">
                      {e.status === 'paid' ? (
                        <span className="text-emerald-700">PAID</span>
                      ) : (
                        <span className="text-rose-600">UNPAID</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-400 text-slate-900">
                <tr>
                  <td colSpan={4} className="py-2.5 px-2.5 text-right uppercase tracking-wider border-r border-slate-300">
                    Grand Total Balance:
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono border-r border-slate-300">
                    ৳{totalBilled.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-emerald-800 border-r border-slate-300">
                    ৳{totalPaid.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-right font-mono text-rose-700 border-r border-slate-300 text-xs">
                    ৳{totalDue.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-2.5 text-center text-[10px] text-slate-600">
                    {dueCount} Due
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Amount In Words */}
          {totalDue > 0 && (
            <div className="bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 text-xs text-rose-900">
              <span className="font-bold">Total Outstanding in Words: </span>
              <span className="italic">{numberToTakaWords(totalDue)}</span>
            </div>
          )}

          {/* Bank Payment Information Box */}
          {company.bankDetails && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-700">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">
                APS Bank Settlement & Payment Account Details
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-400 block">Bank Name:</span>
                  <span className="font-semibold text-slate-800">{company.bankDetails.bankName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Account Title:</span>
                  <span className="font-semibold text-slate-800">{company.bankDetails.accountName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Account Number:</span>
                  <span className="font-mono font-bold text-slate-900">{company.bankDetails.accountNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Branch & Routing:</span>
                  <span className="font-semibold text-slate-800">
                    {company.bankDetails.branch} {company.bankDetails.routingNumber ? `(${company.bankDetails.routingNumber})` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Authorized Signature Block */}
          <div className="pt-8 flex justify-between items-end text-xs">
            <div className="text-center">
              <div className="w-40 border-b border-slate-300 pb-1 text-[10px] text-slate-400">
                Customer Acknowledgment
              </div>
              <div className="text-[10px] text-slate-500 mt-1 font-medium">
                Verified & Accepted
              </div>
            </div>

            <div className="text-center">
              <div className="text-emerald-700 font-bold text-xs italic mb-1 font-serif">
                Engr. Agility Power System
              </div>
              <div className="w-48 border-b-2 border-slate-900 pb-1 text-[11px] font-bold text-slate-900">
                Authorized Finance Officer
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Agility Power System (APS)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
