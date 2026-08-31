import React, { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Building2,
  Calendar,
  SlidersHorizontal,
  Trash2,
  Copy,
  ExternalLink,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface InvoiceListProps {
  invoices: Invoice[];
  selectedInvoiceId: string | null;
  onSelectInvoice: (invoice: Invoice) => void;
  onNewInvoice: () => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  currency: 'BDT' | 'USD';
  activeStatusFilter: InvoiceStatus | 'all';
  onStatusFilterChange: (status: InvoiceStatus | 'all') => void;
}

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  selectedInvoiceId,
  onSelectInvoice,
  onNewInvoice,
  onDeleteInvoice,
  onDuplicateInvoice,
  currency,
  activeStatusFilter,
  onStatusFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'date' | 'amount' | 'id'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice) => {
    const matchesStatus =
      activeStatusFilter === 'all' || invoice.status === activeStatusFilter;
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.client.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Sort invoices
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (sortField === 'amount') {
      return sortOrder === 'asc' ? a.total - b.total : b.total - a.total;
    }
    if (sortField === 'id') {
      return sortOrder === 'asc'
        ? a.invoiceNumber.localeCompare(b.invoiceNumber)
        : b.invoiceNumber.localeCompare(a.invoiceNumber);
    }
    // Default date sort
    return sortOrder === 'asc'
      ? new Date(a.issueDate).getTime() - new Date(b.issueDate).getTime()
      : new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime();
  });

  const handleSelectAll = () => {
    if (selectedIds.length === sortedInvoices.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedInvoices.map((inv) => inv.id));
    }
  };

  const handleToggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200/60">
            Unpaid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60">
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-red-600 border border-red-200/60">
            Overdue
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header matching Image 1 */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-slate-900">Invoices</h2>
          <span className="px-2 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full">
            {filteredInvoices.length}
          </span>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Search input with rounded pill styling */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="invoice-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices..."
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all"
            />
          </div>

          {/* Sort / Filter dropdown toggle */}
          <button
            id="filter-sort-btn"
            onClick={() => {
              setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
            }}
            title="Toggle sort order"
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* New Invoice Button (Black rounded button) */}
          <button
            id="new-invoice-btn"
            onClick={onNewInvoice}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all shrink-0 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Invoice</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs for quick toggle */}
      <div className="px-4 py-2 bg-slate-50/60 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Status:</span>
        {(['all', 'paid', 'unpaid', 'pending', 'overdue'] as const).map((st) => (
          <button
            key={st}
            id={`filter-tab-${st}`}
            onClick={() => onStatusFilterChange(st)}
            className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
              activeStatusFilter === st
                ? 'bg-white text-slate-900 shadow-2xs font-semibold border border-slate-200'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="flex-1 overflow-y-auto">
        {sortedInvoices.length === 0 ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <FileText className="w-10 h-10 stroke-[1.5] text-slate-300 mb-2" />
            <p className="text-sm font-medium text-slate-600">No invoices found</p>
            <p className="text-xs text-slate-400 mt-0.5">
              Try adjusting your search query or filter criteria.
            </p>
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/80 sticky top-0 z-10 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-2.5 pl-4 pr-2 w-8">
                  <button
                    onClick={handleSelectAll}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {selectedIds.length === sortedInvoices.length && sortedInvoices.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-rose-500" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-700"
                  onClick={() => {
                    setSortField('id');
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Invoice ID</span>
                    <span className="text-slate-300">↕</span>
                  </div>
                </th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3 hidden md:table-cell">Shipping / Ref ID</th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-700"
                  onClick={() => {
                    setSortField('date');
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <span className="text-slate-300">↕</span>
                  </div>
                </th>
                <th
                  className="py-2.5 px-3 cursor-pointer hover:text-slate-700 text-right"
                  onClick={() => {
                    setSortField('amount');
                    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                  }}
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <span className="text-slate-300">↕</span>
                  </div>
                </th>
                <th className="py-2.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedInvoices.map((inv) => {
                const isSelected = selectedInvoiceId === inv.id;
                const isRowChecked = selectedIds.includes(inv.id);

                return (
                  <tr
                    key={inv.id}
                    id={`invoice-row-${inv.id}`}
                    onClick={() => onSelectInvoice(inv)}
                    className={`cursor-pointer transition-colors group ${
                      isSelected
                        ? 'bg-rose-50/70 hover:bg-rose-50 text-slate-900 font-medium'
                        : 'hover:bg-slate-50/80 text-slate-700'
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 pl-4 pr-2">
                      <button
                        onClick={(e) => handleToggleSelectRow(inv.id, e)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        {isRowChecked || isSelected ? (
                          <CheckSquare className="w-4 h-4 text-rose-500" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    {/* Invoice ID */}
                    <td className="py-3 px-3 font-semibold text-rose-600">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 transition-colors" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                    </td>

                    {/* Company */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 border border-slate-200">
                          {inv.client.name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="truncate max-w-[130px] sm:max-w-[160px] font-medium text-slate-800">
                          {inv.client.name}
                        </span>
                      </div>
                    </td>

                    {/* Shipping ID / Ref ID */}
                    <td className="py-3 px-3 text-slate-500 font-mono text-[11px] hidden md:table-cell">
                      {inv.refNumber}
                    </td>

                    {/* Dates */}
                    <td className="py-3 px-3">
                      <div className="text-[11px] leading-tight">
                        <div className="text-slate-700 font-medium">
                          {formatDate(inv.issueDate)}{' '}
                          <span className="text-[9px] text-slate-400 font-normal">
                            (Issued)
                          </span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {formatDate(inv.dueDate)}{' '}
                          <span className="text-[9px] text-slate-400 font-normal">
                            (Due)
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(inv.total, currency)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Info bar */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div>
          Showing <span className="font-semibold">{sortedInvoices.length}</span> of{' '}
          <span className="font-semibold">{invoices.length}</span> records
        </div>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">
              {selectedIds.length} selected
            </span>
            <button
              onClick={() => {
                if (window.confirm(`Delete ${selectedIds.length} selected invoices?`)) {
                  selectedIds.forEach((id) => onDeleteInvoice(id));
                  setSelectedIds([]);
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium underline"
            >
              Delete Selected
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
