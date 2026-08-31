import React from 'react';
import { Printer, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Invoice, CompanyProfile } from '../types';
import { ApsLogo } from './ApsLogo';
import { formatCurrency, formatDate, numberToTakaWords } from '../utils/formatters';

interface OfficialLetterheadPadProps {
  invoice?: Invoice | null;
  company: CompanyProfile;
  onBack: () => void;
  currency: 'BDT' | 'USD';
}

export const OfficialLetterheadPad: React.FC<OfficialLetterheadPadProps> = ({
  invoice,
  company,
  onBack,
  currency,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const isBlankPad = !invoice;

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/90 py-4 sm:py-8 px-2 sm:px-4">
      {/* Top Action Bar (hidden when printing) */}
      <div className="max-w-4xl mx-auto w-full mb-4 flex items-center justify-between no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">
            {isBlankPad
              ? 'APS Official Blank Letterhead Pad'
              : `Official Pad Voucher • #${invoice.invoiceNumber}`}
          </span>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Official Pad (A4)</span>
          </button>
        </div>
      </div>

      {/* Official Pad Page (A4 Aspect Ratio Replica of Image 2) */}
      <div className="max-w-4xl mx-auto w-full bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 print-container relative flex flex-col justify-between min-h-[1050px]">
        {/* Central Background Watermark from Image 2 */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
          <ApsLogo size="watermark" />
        </div>

        {/* Top Header Section */}
        <div className="p-6 sm:p-8 pb-3 relative z-10">
          {/* Logo & Company Title matching Image 2 */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b-2 border-slate-700 pb-3">
            <div className="flex items-center gap-4">
              {/* APS Oval Logo */}
              <div className="w-20 h-16 shrink-0">
                <ApsLogo size="lg" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight flex items-center flex-wrap">
                  <span className="text-[#1b5e20]">AGILITY </span>
                  <span className="text-[#b71c1c] ml-2">POWER </span>
                  <span className="text-[#1b5e20] ml-2">SYSTEM</span>
                </h1>
                <p className="text-[11px] sm:text-xs font-medium text-slate-700 mt-0.5 tracking-tight font-sans">
                  {company.tagline}
                </p>
              </div>
            </div>
          </div>

          {/* Ref & Date Row */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-800 pt-3 pb-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Ref:</span>
              <span className="font-mono text-slate-900 border-b border-dotted border-slate-400 pb-0.5 px-1 min-w-[140px]">
                {invoice ? (invoice.refNumber || `APS/INV/${invoice.invoiceNumber}`) : 'APS/REF/2026/__________'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">Date:</span>
              <span className="font-mono text-slate-900 border-b border-dotted border-slate-400 pb-0.5 px-1 min-w-[120px]">
                {invoice ? formatDate(invoice.issueDate) : '____ / ____ / 2026'}
              </span>
            </div>
          </div>

          {invoice ? (
            <>
              {/* Bill To & Bill From info */}
              <div className="bg-slate-50/90 rounded-lg p-4 border border-slate-200 text-xs mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Customer / Bill To:
                  </span>
                  <div className="text-sm font-bold text-slate-900">
                    {invoice.client.name}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Attn: {invoice.client.contactPerson}
                  </div>
                  <div className="text-slate-500">{invoice.client.address}</div>
                  <div className="text-slate-600 font-medium">
                    Phone: {invoice.client.phone} | Email: {invoice.client.email}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Invoice Details:
                  </span>
                  <div className="text-sm font-bold text-emerald-800">
                    Invoice No: {invoice.invoiceNumber}
                  </div>
                  <div className="text-slate-600">
                    Due Date: {formatDate(invoice.dueDate)}
                  </div>
                  <div className="mt-1">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                      Status: {invoice.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-300 rounded-md overflow-hidden bg-white/95">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                    <tr>
                      <th className="py-2 px-3 w-10 text-center border-r border-slate-300">
                        Sl.
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300">
                        Description of Goods & Services
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-20">
                        Category
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-center w-16">
                        Qty
                      </th>
                      <th className="py-2 px-3 border-r border-slate-300 text-right w-24">
                        Rate ({currency})
                      </th>
                      <th className="py-2 px-3 text-right w-28">Amount ({currency})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoice.items.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td className="py-2 px-2 text-center text-slate-500 font-mono border-r border-slate-200">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-medium text-slate-900 border-r border-slate-200">
                          {item.description}
                        </td>
                        <td className="py-2 px-2 text-slate-600 text-[10px] text-center border-r border-slate-200">
                          {item.category.split(' ')[0]}
                        </td>
                        <td className="py-2 px-2 text-center text-slate-800 border-r border-slate-200">
                          {item.quantity} {item.unit || 'Pcs'}
                        </td>
                        <td className="py-2 px-3 text-right text-slate-700 font-mono border-r border-slate-200">
                          {item.unitPrice.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold text-slate-900 font-mono">
                          {item.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-semibold text-xs text-slate-800">
                    <tr>
                      <td colSpan={4} className="py-1.5 px-3 border-r border-slate-200">
                        Sub Total
                      </td>
                      <td colSpan={2} className="py-1.5 px-3 text-right font-mono">
                        {formatCurrency(invoice.subtotal, currency)}
                      </td>
                    </tr>
                    {invoice.taxRate > 0 && (
                      <tr>
                        <td colSpan={4} className="py-1.5 px-3 border-r border-slate-200 text-slate-600">
                          Tax / VAT ({invoice.taxRate}%)
                        </td>
                        <td colSpan={2} className="py-1.5 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(invoice.taxAmount, currency)}
                        </td>
                      </tr>
                    )}
                    {invoice.deliveryFee > 0 && (
                      <tr>
                        <td colSpan={4} className="py-1.5 px-3 border-r border-slate-200 text-slate-600">
                          Delivery / Transport Charge
                        </td>
                        <td colSpan={2} className="py-1.5 px-3 text-right font-mono text-slate-700">
                          {formatCurrency(invoice.deliveryFee, currency)}
                        </td>
                      </tr>
                    )}
                    {invoice.discount > 0 && (
                      <tr>
                        <td colSpan={4} className="py-1.5 px-3 border-r border-slate-200 text-red-600">
                          Discount
                        </td>
                        <td colSpan={2} className="py-1.5 px-3 text-right font-mono text-red-600">
                          -{formatCurrency(invoice.discount, currency)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-slate-100 text-slate-900 font-bold text-sm">
                      <td colSpan={4} className="py-2.5 px-3 border-r border-slate-300">
                        Grand Total
                      </td>
                      <td colSpan={2} className="py-2.5 px-3 text-right font-black text-emerald-900 font-mono text-base">
                        {formatCurrency(invoice.total, currency)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Amount in words */}
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-800">
                <span className="font-bold text-slate-900 mr-1">In Words:</span>
                <span className="font-semibold italic text-slate-700">
                  {numberToTakaWords(invoice.total)}
                </span>
              </div>

              {/* Bank / Payment terms */}
              {company.bankDetails && (
                <div className="mt-3 p-3 border border-slate-200 rounded text-[11px] text-slate-600 bg-slate-50/60 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800">Bank Account Details:</span>
                    <div>Bank: {company.bankDetails.bankName}</div>
                    <div>A/C Name: {company.bankDetails.accountName}</div>
                  </div>
                  <div className="sm:text-right">
                    <div>A/C No: <span className="font-mono font-bold text-slate-800">{company.bankDetails.accountNumber}</span></div>
                    <div>Branch: {company.bankDetails.branch}</div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Blank Letterhead Body for Handwritten Quotes/Letters */
            <div className="min-h-[480px] border border-dashed border-slate-300 rounded-lg p-6 flex flex-col justify-between text-slate-400">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>To: ________________________________________________</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <span>Subject: ____________________________________________</span>
                </div>
                <div className="h-64 border-b border-dotted border-slate-300"></div>
              </div>
              <div className="text-center text-xs text-slate-400 italic">
                (Official Blank Pad for APS Formal Letters, Memos, Quotations, and Vouchers)
              </div>
            </div>
          )}
        </div>

        {/* Bottom Signatures & Dark Green Banner matching Image 2 */}
        <div className="mt-8 relative z-10">
          {/* Receiver & Authorized Signature lines */}
          <div className="px-8 pb-8 flex items-end justify-between text-xs text-slate-800">
            <div className="text-center min-w-[160px]">
              <div className="w-44 border-t border-slate-800 mb-1"></div>
              <span className="font-bold">Receiver Signature</span>
            </div>

            <div className="text-center min-w-[160px]">
              <div className="w-44 border-t border-slate-800 mb-1"></div>
              <span className="font-bold">Authorize Signature</span>
              <div className="text-[10px] text-slate-500">Agility Power System</div>
            </div>
          </div>

          {/* Dark Green Bottom Strip from Image 2 */}
          <div className="bg-[#1b5e20] text-white py-3 px-6 text-center text-xs font-sans">
            <p className="font-semibold text-[11px] sm:text-xs tracking-tight">
              {company.officeAddress}
            </p>
            <p className="text-[10px] sm:text-[11px] text-emerald-100 mt-0.5">
              Mob: {company.phones.join(', ')} • E-mail: {company.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
