import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Printer,
  Download,
  Search,
  Building,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  DollarSign,
  ArrowDownRight,
  User,
  Phone,
  Layers,
  Trash2,
  Eye,
  Check,
  ChevronRight,
  TrendingUp,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { Invoice, Client, PaymentRecord, CompanyProfile, PaymentMethod } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { RecordPaymentModal } from './RecordPaymentModal';
import { PaymentReceiptModal } from './PaymentReceiptModal';

interface PaymentsViewProps {
  payments: PaymentRecord[];
  invoices: Invoice[];
  clients: Client[];
  company: CompanyProfile;
  currency: 'BDT' | 'USD';
  onAddPayment: (payment: PaymentRecord, updateInvoiceStatus?: boolean) => void;
  onDeletePayment: (paymentId: string) => void;
  onOpenInvoice?: (invoiceId: string) => void;
  onViewClientProfile?: (client: Client) => void;
}

type TabType = 'transactions' | 'customer_balances';
type DateFilterPreset = 'all' | 'today' | 'this_month' | 'last_month' | 'this_year' | 'custom';

export const PaymentsView: React.FC<PaymentsViewProps> = ({
  payments,
  invoices,
  clients,
  company,
  currency,
  onAddPayment,
  onDeletePayment,
  onOpenInvoice,
  onViewClientProfile,
}) => {
  // Navigation / Tabs
  const [activeTab, setActiveTab] = useState<TabType>('transactions');

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [datePreset, setDatePreset] = useState<DateFilterPreset>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [preselectedClientId, setPreselectedClientId] = useState<string | undefined>(undefined);
  const [preselectedInvoiceId, setPreselectedInvoiceId] = useState<string | undefined>(undefined);
  const [viewingReceipt, setViewingReceipt] = useState<PaymentRecord | null>(null);

  // Handle Date Preset Changes
  const handleDatePresetChange = (preset: DateFilterPreset) => {
    setDatePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (preset === 'today') {
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'this_month') {
      const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
    } else if (preset === 'last_month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
    } else if (preset === 'this_year') {
      const first = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const last = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      setStartDate(first);
      setEndDate(last);
    } else if (preset === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  // Filtered Payments List
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => {
        // Client filter
        if (selectedClientId !== 'all' && p.clientId !== selectedClientId) {
          return false;
        }

        // Method filter
        if (paymentMethodFilter !== 'all' && p.paymentMethod !== paymentMethodFilter) {
          return false;
        }

        // Date filter
        if (startDate && p.paymentDate < startDate) return false;
        if (endDate && p.paymentDate > endDate) return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchReceipt = p.receiptNumber.toLowerCase().includes(q);
          const matchClient = p.client.name.toLowerCase().includes(q);
          const matchRef = p.referenceNumber?.toLowerCase().includes(q) || false;
          const matchInv = p.invoiceNumber?.toLowerCase().includes(q) || false;
          const matchNotes = p.notes?.toLowerCase().includes(q) || false;
          if (!matchReceipt && !matchClient && !matchRef && !matchInv && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
  }, [payments, selectedClientId, paymentMethodFilter, startDate, endDate, searchQuery]);

  // Compute Client-Wise Balances & Summary (Billed, Paid, Due)
  const clientBalances = useMemo(() => {
    return clients.map((c) => {
      // Invoices for this client
      const clientInvoices = invoices.filter((i) => i.client.id === c.id);
      const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.total, 0);

      // Payments from payment logs or settled invoices
      const clientPayments = payments.filter((p) => p.clientId === c.id);
      const totalPaid = clientPayments.reduce((sum, p) => sum + p.amount, 0);

      // Fallback: If no explicit payment log, sum invoice paid totals
      const paidInvoiceSum = clientInvoices
        .filter((i) => i.status === 'paid')
        .reduce((sum, i) => sum + i.total, 0);

      const actualPaid = Math.max(totalPaid, paidInvoiceSum);
      const currentDue = Math.max(0, totalBilled - actualPaid);

      // Latest payment
      const latestPayment = clientPayments.sort(
        (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
      )[0];

      return {
        client: c,
        totalInvoices: clientInvoices.length,
        totalBilled,
        totalPaid: actualPaid,
        currentDue,
        latestPaymentDate: latestPayment?.paymentDate || null,
        latestPaymentAmount: latestPayment?.amount || 0,
        dueInvoiceCount: clientInvoices.filter((i) => i.status !== 'paid').length,
      };
    });
  }, [clients, invoices, payments]);

  // Overall Financial Stats
  const { totalCollected, totalDueOutstanding, thisMonthCollected, totalBilledAll } =
    useMemo(() => {
      const now = new Date();
      const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      let collectedSum = payments.reduce((sum, p) => sum + p.amount, 0);
      let monthSum = payments
        .filter((p) => p.paymentDate.startsWith(currentYearMonth))
        .reduce((sum, p) => sum + p.amount, 0);

      let billedSum = invoices.reduce((sum, i) => sum + i.total, 0);
      let dueSum = clientBalances.reduce((sum, c) => sum + c.currentDue, 0);

      return {
        totalCollected: collectedSum,
        totalDueOutstanding: dueSum,
        thisMonthCollected: monthSum,
        totalBilledAll: billedSum,
      };
    }, [payments, invoices, clientBalances]);

  // Handle Quick Record Payment for a specific client
  const handleOpenRecordForClient = (clientId: string) => {
    setPreselectedClientId(clientId);
    setPreselectedInvoiceId(undefined);
    setIsRecordModalOpen(true);
  };

  // Export CSV of payments
  const handleExportCSV = () => {
    const headers = [
      'Receipt #',
      'Date',
      'Customer Name',
      'Contact Person',
      'Invoice #',
      'Work Order Ref',
      'Amount Received (BDT)',
      'Payment Method',
      'Reference / Cheque #',
      'Bank Name',
      'Received By',
      'Notes',
    ];

    const rows = filteredPayments.map((p) => [
      `"${p.receiptNumber}"`,
      `"${p.paymentDate}"`,
      `"${p.client.name}"`,
      `"${p.client.contactPerson}"`,
      `"${p.invoiceNumber || 'On-Account'}"`,
      `"${p.refNumber || '-'}"`,
      p.amount,
      `"${p.paymentMethod}"`,
      `"${p.referenceNumber || '-'}"`,
      `"${p.bankName || '-'}"`,
      `"${p.receivedBy || '-'}"`,
      `"${p.notes || '-'}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `APS_Customer_Payments_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/70">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Customer Payments & Collection Ledger
            </h2>
            <p className="text-xs text-slate-500">
              Track date-wise customer payments received, money receipts, and outstanding dues
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            title="Download Payments CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={() => {
              setPreselectedClientId(undefined);
              setPreselectedInvoiceId(undefined);
              setIsRecordModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment (টাকা জমা)</span>
          </button>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Total Collected</span>
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-emerald-700 truncate">
            {formatCurrency(totalCollected, currency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-emerald-700 mt-1 font-medium flex items-center gap-1 truncate">
            <span>{payments.length} receipts recorded</span>
          </div>
        </div>

        {/* Total Due Outstanding */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-rose-200/80 shadow-2xs bg-gradient-to-br from-white to-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-rose-700 truncate">Outstanding Due</span>
            <div className="p-1.5 bg-rose-100 text-rose-700 rounded-lg shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-rose-600 truncate">
            {formatCurrency(totalDueOutstanding, currency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-rose-600 mt-1 font-medium truncate">
            Pending customer dues
          </div>
        </div>

        {/* Collected This Month */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">This Month</span>
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0">
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-blue-800 truncate">
            {formatCurrency(thisMonthCollected, currency)}
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-500 mt-1 truncate">
            Current month collection
          </div>
        </div>

        {/* Collection Ratio */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 truncate">Recovery Ratio</span>
            <div className="p-1.5 bg-purple-100 text-purple-700 rounded-lg shrink-0">
              <Receipt className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div className="mt-2 text-base sm:text-xl xl:text-2xl font-black text-slate-900 truncate">
            {totalBilledAll > 0
              ? `${Math.round((totalCollected / totalBilledAll) * 100)}%`
              : '100%'}
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all"
              style={{
                width: `${
                  totalBilledAll > 0 ? (totalCollected / totalBilledAll) * 100 : 100
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Main View Tabs: Transactions Log vs Customer Due Balances */}
      <div className="flex items-center justify-between border-b border-slate-200 gap-4 flex-wrap pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'transactions'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Payment Transactions Log ({filteredPayments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('customer_balances')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
              activeTab === 'customer_balances'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Customer Due & Paid Summary ({clients.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing: <strong className="text-slate-800">{activeTab === 'transactions' ? 'Date-wise Transactions' : 'Customer Account Ledgers'}</strong>
        </div>
      </div>

      {/* Filter and Search Bar (Used for both tabs) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search box */}
          <div className="sm:col-span-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search receipt #, customer, cheque #, invoice..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
              />
            </div>
          </div>

          {/* Customer filter */}
          <div className="sm:col-span-3">
            <div className="relative">
              <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
              >
                <option value="all">All Customers</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Method filter (for transactions) */}
          <div className="sm:col-span-2">
            <select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
            >
              <option value="all">All Methods</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
              <option value="bKash / Nagad">bKash / Nagad</option>
              <option value="Online / Card">Online / Card</option>
            </select>
          </div>

          {/* Date presets */}
          <div className="sm:col-span-3 flex items-center gap-1 overflow-x-auto text-[11px]">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'this_month', label: 'Month' },
              { id: 'this_year', label: '2026' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => handleDatePresetChange(p.id as DateFilterPreset)}
                className={`px-2.5 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                  datePreset === p.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TAB 1: Date-wise Payment Transactions Log */}
      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Received Payment Records ({filteredPayments.length})
              </h3>
            </div>
            <div className="text-xs text-slate-500">
              Total in filter: <strong className="text-emerald-700 font-mono">{formatCurrency(filteredPayments.reduce((s, p) => s + p.amount, 0), currency)}</strong>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No Payment Records Found</p>
              <p className="text-xs text-slate-500">
                Click "+ Record Payment" above to record received money.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Payment Date</th>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Customer / Station</th>
                    <th className="py-3 px-4">Invoice / Purpose</th>
                    <th className="py-3 px-4">Payment Mode & Ref</th>
                    <th className="py-3 px-4 text-right">Amount Received (৳)</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 font-mono">
                          {formatDate(payment.paymentDate)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(payment.createdAt || payment.paymentDate).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Receipt # */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => setViewingReceipt(payment)}
                          className="font-mono font-bold text-rose-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{payment.receiptNumber}</span>
                        </button>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          {payment.client.name}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {payment.client.contactPerson} • {payment.client.city}
                        </div>
                      </td>

                      {/* Invoice Link */}
                      <td className="py-3 px-4">
                        {payment.invoiceNumber ? (
                          <div>
                            <button
                              onClick={() => payment.invoiceId && onOpenInvoice && onOpenInvoice(payment.invoiceId)}
                              className="font-semibold text-blue-700 hover:underline"
                            >
                              Invoice #{payment.invoiceNumber}
                            </button>
                            {payment.refNumber && (
                              <span className="text-[10px] text-slate-400 block font-mono">
                                Ref: {payment.refNumber}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">On-Account Advance</span>
                        )}
                        {payment.notes && (
                          <div className="text-[10px] text-slate-500 truncate max-w-[200px]" title={payment.notes}>
                            {payment.notes}
                          </div>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          <span>{payment.paymentMethod}</span>
                        </div>
                        {payment.referenceNumber && (
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Ref: <strong>{payment.referenceNumber}</strong>
                          </div>
                        )}
                        {payment.bankName && (
                          <div className="text-[10px] text-slate-400">{payment.bankName}</div>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right font-mono font-black text-sm text-emerald-700 whitespace-nowrap">
                        {formatCurrency(payment.amount, currency)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingReceipt(payment)}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Print Money Receipt"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-600" />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete payment receipt ${payment.receiptNumber}?`)) {
                                onDeletePayment(payment.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                {/* Table Footer */}
                <tfoot className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={5} className="py-3 px-4 text-right uppercase tracking-wider">
                      Total Collected in Selected Range:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800 text-sm font-black">
                      {formatCurrency(
                        filteredPayments.reduce((s, p) => s + p.amount, 0),
                        currency
                      )}
                    </td>
                    <td className="py-3 px-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Customer Due & Payment Summary (কার কত টাকা জমা ও কত বকেয়া) */}
      {activeTab === 'customer_balances' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Customer Due & Payment Ledgers ({clientBalances.length} Clients)
                </h3>
              </div>
              <div className="text-xs text-slate-500">
                Total Due: <strong className="text-rose-600 font-mono">{formatCurrency(totalDueOutstanding, currency)}</strong>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Customer / Station</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4 text-right">Total Invoiced</th>
                    <th className="py-3 px-4 text-right">Total Paid</th>
                    <th className="py-3 px-4 text-right">Current Due</th>
                    <th className="py-3 px-4">Last Payment</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {clientBalances.map((item) => {
                    const hasDue = item.currentDue > 0;

                    return (
                      <tr key={item.client.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => onViewClientProfile && onViewClientProfile(item.client)}
                            className="font-bold text-slate-900 hover:text-rose-600 text-left block"
                          >
                            {item.client.name}
                          </button>
                          <div className="text-[10px] text-slate-400">
                            {item.client.industry || 'Industrial Plant'} • {item.totalInvoices} invoice(s)
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-3.5 px-4">
                          <div className="text-slate-700 font-medium">
                            {item.client.contactPerson}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.client.phone} • {item.client.city}
                          </div>
                        </td>

                        {/* Total Invoiced */}
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-800 whitespace-nowrap">
                          {formatCurrency(item.totalBilled, currency)}
                        </td>

                        {/* Total Paid */}
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700 whitespace-nowrap">
                          {formatCurrency(item.totalPaid, currency)}
                        </td>

                        {/* Current Due */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-sm whitespace-nowrap">
                          {hasDue ? (
                            <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-200/80">
                              {formatCurrency(item.currentDue, currency)}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">৳0 (Cleared)</span>
                          )}
                        </td>

                        {/* Last Payment */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {item.latestPaymentDate ? (
                            <div>
                              <span className="font-mono text-slate-700 font-medium">
                                {formatDate(item.latestPaymentDate)}
                              </span>
                              <span className="text-[10px] text-emerald-700 font-bold block font-mono">
                                +{formatCurrency(item.latestPaymentAmount, currency)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">No record</span>
                          )}
                        </td>

                        {/* Status badge */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          {hasDue ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <Clock className="w-3 h-3 text-rose-600" />
                              <span>{item.dueInvoiceCount} Due</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span>Cleared</span>
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenRecordForClient(item.client.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Receive Money</span>
                            </button>
                            {onViewClientProfile && (
                              <button
                                onClick={() => onViewClientProfile(item.client)}
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors"
                              >
                                Ledger
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                {/* Total Row */}
                <tfoot className="bg-slate-100 font-bold text-xs text-slate-900 border-t-2 border-slate-300">
                  <tr>
                    <td colSpan={2} className="py-3 px-4 uppercase tracking-wider">
                      Master Client Balances Total:
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-900">
                      {formatCurrency(totalBilledAll, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-800">
                      {formatCurrency(totalCollected, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-rose-700 text-sm font-black">
                      {formatCurrency(totalDueOutstanding, currency)}
                    </td>
                    <td colSpan={3}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSavePayment={onAddPayment}
        invoices={invoices}
        clients={clients}
        currency={currency}
        preselectedClientId={preselectedClientId}
        preselectedInvoiceId={preselectedInvoiceId}
      />

      {/* Official Printable Money Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        payment={viewingReceipt}
        company={company}
        currency={currency}
      />
    </div>
  );
};
