import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  CreditCard,
  Building,
  Calendar,
  FileText,
  DollarSign,
  User,
  CheckCircle2,
  AlertCircle,
  Hash,
  Landmark,
} from 'lucide-react';
import { Invoice, Client, PaymentRecord, PaymentMethod } from '../types';
import { formatCurrency } from '../utils/formatters';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (payment: PaymentRecord, updateInvoiceStatus?: boolean) => void;
  invoices: Invoice[];
  clients: Client[];
  currency: 'BDT' | 'USD';
  preselectedClientId?: string;
  preselectedInvoiceId?: string;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSavePayment,
  invoices,
  clients,
  currency,
  preselectedClientId,
  preselectedInvoiceId,
}) => {
  const [clientId, setClientId] = useState<string>('');
  const [invoiceId, setInvoiceId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [referenceNumber, setReferenceNumber] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [receivedBy, setReceivedBy] = useState<string>('Engr. Agility Power System');
  const [notes, setNotes] = useState<string>('');
  const [autoMarkPaid, setAutoMarkPaid] = useState<boolean>(true);

  // Initialize from preselected
  useEffect(() => {
    if (isOpen) {
      if (preselectedClientId) {
        setClientId(preselectedClientId);
      } else if (clients.length > 0) {
        setClientId(clients[0].id);
      }

      if (preselectedInvoiceId) {
        setInvoiceId(preselectedInvoiceId);
        const inv = invoices.find((i) => i.id === preselectedInvoiceId);
        if (inv) {
          setClientId(inv.client.id);
          setAmount(inv.total.toString());
        }
      } else {
        setInvoiceId('');
        setAmount('');
      }

      setPaymentDate(new Date().toISOString().split('T')[0]);
      setReferenceNumber('');
      setBankName('');
      setNotes('');
    }
  }, [isOpen, preselectedClientId, preselectedInvoiceId, clients, invoices]);

  // Client's unpaid / due invoices
  const clientInvoices = useMemo(() => {
    if (!clientId) return [];
    return invoices.filter((i) => i.client.id === clientId);
  }, [invoices, clientId]);

  // When invoice selection changes, autofill amount with invoice total if empty
  const handleInvoiceChange = (invId: string) => {
    setInvoiceId(invId);
    if (invId) {
      const inv = invoices.find((i) => i.id === invId);
      if (inv) {
        setAmount(inv.total.toString());
        setNotes(`Payment settlement for Invoice #${inv.invoiceNumber}`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!clientId || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid customer and payment amount.');
      return;
    }

    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const selectedInv = invoiceId ? invoices.find((i) => i.id === invoiceId) : undefined;

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber: `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      clientId: client.id,
      client,
      invoiceId: selectedInv?.id,
      invoiceNumber: selectedInv?.invoiceNumber,
      refNumber: selectedInv?.refNumber,
      amount: numAmount,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod,
      referenceNumber: referenceNumber.trim() || undefined,
      bankName: bankName.trim() || undefined,
      receivedBy: receivedBy.trim() || 'Engr. Agility Power System',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
    };

    onSavePayment(newPayment, autoMarkPaid && !!selectedInv);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden my-8 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Record Customer Payment</h3>
              <p className="text-xs text-slate-400">
                Log money received against invoices or on-account balance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Customer Selection */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Customer / Station <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                required
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setInvoiceId('');
                }}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all text-xs"
              >
                <option value="">-- Choose Customer --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Invoice Linking (Optional / Recommended) */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Link to Invoice (Optional)
              </label>
              <span className="text-[10px] text-slate-400">
                {clientInvoices.length} invoice(s) found for this client
              </span>
            </div>
            <div className="relative">
              <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={invoiceId}
                onChange={(e) => handleInvoiceChange(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all text-xs"
              >
                <option value="">-- General On-Account Advance / No Specific Invoice --</option>
                {clientInvoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.invoiceNumber} • {inv.issueDate} • Total: {formatCurrency(inv.total, currency)} ({inv.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Amount Received (৳) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-sm">
                  ৳
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold font-mono text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Payment Received Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-800 text-xs focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Payment Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 text-xs"
              >
                <option value="Bank Transfer">Bank Transfer (FT / BEFTN / RTGS)</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash Payment</option>
                <option value="bKash / Nagad">bKash / Nagad MFS</option>
                <option value="Online / Card">Online / Card Payment</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Ref / Cheque # / TrxID
              </label>
              <input
                type="text"
                placeholder="e.g. CHQ-991204 / TrxID 9K8X"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white"
              />
            </div>
          </div>

          {/* Bank Name & Receiver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Bank / Gateway Name
              </label>
              <input
                type="text"
                placeholder="e.g. Islami Bank / DBBL / City Bank"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Received By / Engineer
              </label>
              <input
                type="text"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Payment Remarks / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Full settlement for Generator spark plugs and valves."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:bg-white"
            />
          </div>

          {/* Auto Mark Invoice as Paid toggle */}
          {invoiceId && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span className="text-xs font-semibold text-emerald-900">
                  Update linked invoice status to "Paid"?
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoMarkPaid}
                onChange={(e) => setAutoMarkPaid(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Record Payment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
