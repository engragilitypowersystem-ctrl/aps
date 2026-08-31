import React from 'react';
import { X, Printer, Download, CheckCircle2, Building, Calendar, CreditCard, ShieldCheck } from 'lucide-react';
import { PaymentRecord, CompanyProfile } from '../types';
import { formatCurrency, formatDate, numberToTakaWords } from '../utils/formatters';
import { ApsLogo } from './ApsLogo';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: PaymentRecord | null;
  company: CompanyProfile;
  currency: 'BDT' | 'USD';
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  company,
  currency,
}) => {
  if (!isOpen || !payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden my-8 border border-slate-200">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between p-4 bg-slate-900 text-white no-print">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Official Money Receipt</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {payment.receiptNumber} • {formatDate(payment.paymentDate)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Money Receipt Document Body */}
        <div className="p-6 sm:p-8 relative print:p-6 print:m-0 bg-white">
          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-10">
            <ApsLogo size="watermark" />
          </div>

          <div className="relative z-10 space-y-6">
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-12 shrink-0">
                    <ApsLogo size="md" />
                  </div>
                  <div>
                    <h1 className="text-xl font-serif font-black tracking-tight flex items-center">
                      <span className="text-[#1b5e20]">AGILITY </span>
                      <span className="text-[#b71c1c] ml-1.5">POWER </span>
                      <span className="text-[#1b5e20] ml-1.5">SYSTEM</span>
                    </h1>
                    <p className="text-[9px] font-semibold text-slate-600 tracking-tight">
                      {company.tagline}
                    </p>
                    <p className="text-[8.5px] text-slate-500">
                      {company.officeAddress} | Mob: {company.phones.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-slate-900 text-white rounded text-[10px] font-black uppercase tracking-widest">
                    MONEY RECEIPT
                  </span>
                  <div className="text-[11px] font-mono font-bold text-rose-600 mt-1">
                    No: {payment.receiptNumber}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Date: {formatDate(payment.paymentDate)}
                  </div>
                </div>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-3">
              <div className="flex justify-between items-start border-b border-slate-200/80 pb-2.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Received With Thanks From:
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 block mt-0.5">
                    {payment.client.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {payment.client.address}, {payment.client.city} • Attn: {payment.client.contactPerson} ({payment.client.phone})
                  </span>
                </div>
              </div>

              {/* Amount Highlight Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="bg-emerald-50/80 p-3 rounded-lg border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Amount Received:
                  </span>
                  <span className="text-2xl font-black font-mono text-emerald-700 block mt-0.5">
                    {formatCurrency(payment.amount, currency)}
                  </span>
                </div>

                <div className="bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Payment Method & Reference:
                  </span>
                  <span className="text-xs font-bold text-slate-800 block mt-0.5">
                    {payment.paymentMethod} {payment.bankName ? `(${payment.bankName})` : ''}
                  </span>
                  {payment.referenceNumber && (
                    <span className="text-[10px] font-mono text-slate-500">
                      Ref / Trx No: <strong>{payment.referenceNumber}</strong>
                    </span>
                  )}
                </div>
              </div>

              {/* Amount in words */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-slate-700">Amount in Words: </span>
                <span className="italic text-slate-900 font-medium">
                  {numberToTakaWords(payment.amount)}
                </span>
              </div>

              {/* For / Purpose */}
              <div className="text-xs text-slate-700 pt-1">
                <span className="font-bold">On Account Of / Invoice: </span>
                <span>
                  {payment.invoiceNumber
                    ? `Payment settlement for Invoice #${payment.invoiceNumber} ${payment.refNumber ? `(Ref: ${payment.refNumber})` : ''}`
                    : 'On-Account Advance / Equipment Service Payment'}
                </span>
                {payment.notes && (
                  <div className="text-[11px] text-slate-500 mt-1 italic">
                    Note: "{payment.notes}"
                  </div>
                )}
              </div>
            </div>

            {/* Signature and Verification */}
            <div className="pt-8 flex justify-between items-end text-xs">
              <div className="text-center">
                <div className="w-36 border-b border-slate-300 pb-1 text-[10px] text-slate-400">
                  Customer Signature
                </div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  Authorized Signatory
                </div>
              </div>

              <div className="text-center">
                <div className="text-emerald-700 font-bold text-xs italic font-serif mb-0.5">
                  {payment.receivedBy || 'Engr. Agility Power System'}
                </div>
                <div className="w-44 border-b-2 border-slate-900 pb-1 text-[11px] font-bold text-slate-900">
                  Received By / Cashier
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Agility Power System (APS)
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end no-print">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
