import React from 'react';
import {
  Edit3,
  Send,
  Printer,
  FileCheck,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { Invoice, CompanyProfile, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface InvoiceDetailPaneProps {
  invoice: Invoice | null;
  company: CompanyProfile;
  currency: 'BDT' | 'USD';
  onEdit: (invoice: Invoice) => void;
  onToggleStatus: (invoiceId: string, newStatus: InvoiceStatus) => void;
  onOpenLetterheadView: (invoice: Invoice) => void;
  onSendInvoice: (invoice: Invoice) => void;
}

export const InvoiceDetailPane: React.FC<InvoiceDetailPaneProps> = ({
  invoice,
  company,
  currency,
  onEdit,
  onToggleStatus,
  onOpenLetterheadView,
  onSendInvoice,
}) => {
  if (!invoice) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 h-full flex flex-col items-center justify-center text-center text-slate-400">
        <FileSpreadsheet className="w-12 h-12 stroke-[1.5] text-slate-300 mb-3" />
        <h3 className="text-base font-semibold text-slate-700">No Invoice Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Select an invoice from the list on the left to view full billing details, breakdown, and letterhead voucher.
        </p>
      </div>
    );
  }

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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200/60">
            Overdue
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Top Header Controls matching Image 1 */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-white">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          Invoice Details
        </h2>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Edit button */}
          <button
            id="detail-edit-btn"
            onClick={() => onEdit(invoice)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          {/* Quick status toggle button */}
          {invoice.status === 'paid' ? (
            <button
              id="detail-mark-unpaid-btn"
              onClick={() => onToggleStatus(invoice.id, 'unpaid')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Mark Unpaid</span>
            </button>
          ) : (
            <button
              id="detail-mark-paid-btn"
              onClick={() => onToggleStatus(invoice.id, 'paid')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Mark Paid</span>
            </button>
          )}

          {/* Official Letterhead Pad Button */}
          <button
            id="detail-pad-view-btn"
            onClick={() => onOpenLetterheadView(invoice)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300/80 rounded-lg transition-colors"
            title="Open official company letterhead pad view"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>Letterhead Pad</span>
          </button>

          {/* Send Invoice Button (Black rounded button) */}
          <button
            id="detail-send-invoice-btn"
            onClick={() => onSendInvoice(invoice)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Invoice</span>
          </button>
        </div>
      </div>

      {/* Main Scrollable Invoice Pane Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {/* Invoice Number & Dates Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-rose-600">
                Invoice #{invoice.invoiceNumber}
              </span>
              {getStatusBadge(invoice.status)}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              Ref: {invoice.refNumber}
            </div>
          </div>

          <div className="text-right sm:text-right text-xs">
            <div className="text-slate-500">
              <span className="text-slate-400">Issue Date: </span>
              <span className="font-semibold text-slate-800">
                {formatDate(invoice.issueDate)}
              </span>
            </div>
            <div className="text-slate-500 mt-0.5">
              <span className="text-slate-400">Due Date: </span>
              <span className="font-semibold text-slate-800">
                {formatDate(invoice.dueDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Bill From & Bill To Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
          {/* Bill From */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Bill From
            </span>
            <h4 className="text-sm font-bold text-slate-900">{company.name}</h4>
            <p className="text-[11px] text-slate-600">{company.email}</p>
            <p className="text-[11px] text-slate-500 leading-tight">
              {company.officeAddress}
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              Mob: {company.phones.join(', ')}
            </p>
          </div>

          {/* Bill To */}
          <div className="space-y-1 sm:text-right">
            <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Bill To
            </span>
            <h4 className="text-sm font-bold text-slate-900">
              {invoice.client.name}
            </h4>
            <p className="text-[11px] text-slate-600">{invoice.client.email}</p>
            <p className="text-[11px] text-slate-500 leading-tight">
              {invoice.client.address}, {invoice.client.city}
            </p>
            <p className="text-[11px] text-slate-600 font-medium">
              Tel: {invoice.client.phone}
            </p>
          </div>
        </div>

        {/* Package Summary / Services Table matching Screenshot 1 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Package Summary
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {invoice.items.length} {invoice.items.length === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          <div className="border border-slate-200/80 rounded-xl overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Description ↕</th>
                  <th className="py-2.5 px-3 hidden sm:table-cell">Shipment / Service Type ↕</th>
                  <th className="py-2.5 px-3 text-right">Price ↕</th>
                  <th className="py-2.5 px-3 text-center">Qty ↕</th>
                  <th className="py-2.5 px-3 text-right">Amount ↕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">
                        {item.description}
                      </div>
                      <div className="text-[10px] text-slate-400 sm:hidden">
                        {item.category}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px] hidden sm:table-cell">
                      {item.category}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-700 whitespace-nowrap">
                      {formatCurrency(item.unitPrice, currency)}
                    </td>
                    <td className="py-3 px-3 text-center text-slate-700 font-medium">
                      {item.quantity} {item.unit || ''}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-900 whitespace-nowrap">
                      {formatCurrency(item.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculations Breakdown matching Image 1 */}
        <div className="flex justify-end pt-2">
          <div className="w-full sm:w-72 space-y-1.5 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Sub Total</span>
              <span className="font-medium text-slate-800">
                {formatCurrency(invoice.subtotal, currency)}
              </span>
            </div>

            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Tax / VAT ({invoice.taxRate}%)</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(invoice.taxAmount, currency)}
                </span>
              </div>
            )}

            {invoice.deliveryFee > 0 && (
              <div className="flex justify-between text-slate-500">
                <span>Service / Transport Fee</span>
                <span className="font-medium text-slate-800">
                  {formatCurrency(invoice.deliveryFee, currency)}
                </span>
              </div>
            )}

            {invoice.discount > 0 && (
              <div className="flex justify-between text-rose-600">
                <span>Discount</span>
                <span className="font-medium">
                  -{formatCurrency(invoice.discount, currency)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2.5 flex justify-between text-sm font-extrabold text-slate-900">
              <span>Total</span>
              <span className="text-base text-rose-600 font-black">
                {formatCurrency(invoice.total, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Note section matching bottom of Screenshot 1 */}
        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600">
          <span className="font-semibold text-slate-800 mr-1">Note:</span>
          <span>
            {invoice.notes ||
              'Please process payment by the due date to avoid delivery disruption. Late fees may apply after 3 business days past due.'}
          </span>
          {invoice.terms && (
            <div className="mt-1 text-[11px] text-slate-500 italic">
              Terms: {invoice.terms}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
