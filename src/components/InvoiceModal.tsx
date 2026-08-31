import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Save,
  Building,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  Invoice,
  InvoiceItem,
  Client,
  InvoiceStatus,
  ProductCatalogItem,
} from '../types';
import { formatCurrency } from '../utils/formatters';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  invoiceToEdit: Invoice | null;
  clients: Client[];
  products: ProductCatalogItem[];
  currency: 'BDT' | 'USD';
  initialClientId?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  invoiceToEdit,
  clients,
  products,
  currency,
  initialClientId,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [refNumber, setRefNumber] = useState<string>('');
  const [issueDate, setIssueDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [status, setStatus] = useState<InvoiceStatus>('unpaid');
  const [taxRate, setTaxRate] = useState<number>(7.5);
  const [deliveryFee, setDeliveryFee] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>('');
  const [items, setItems] = useState<InvoiceItem[]>([]);

  // New Client quick fields if needed
  const [isAddingNewClient, setIsAddingNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientContact, setNewClientContact] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  useEffect(() => {
    if (invoiceToEdit) {
      setSelectedClientId(invoiceToEdit.client.id);
      setInvoiceNumber(invoiceToEdit.invoiceNumber);
      setRefNumber(invoiceToEdit.refNumber);
      setIssueDate(invoiceToEdit.issueDate);
      setDueDate(invoiceToEdit.dueDate);
      setStatus(invoiceToEdit.status);
      setTaxRate(invoiceToEdit.taxRate || 0);
      setDeliveryFee(invoiceToEdit.deliveryFee || 0);
      setDiscount(invoiceToEdit.discount || 0);
      setNotes(invoiceToEdit.notes || '');
      setTerms(invoiceToEdit.terms || '');
      setItems(invoiceToEdit.items || []);
    } else {
      // Default new invoice
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const dueObj = new Date();
      dueObj.setDate(dueObj.getDate() + 7);
      const dueStr = dueObj.toISOString().split('T')[0];

      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const randomRef = Math.floor(1000000 + Math.random() * 9000000);

      setSelectedClientId(initialClientId || clients[0]?.id || '');
      setInvoiceNumber(`INV-${randomNum}`);
      setRefNumber(`#SH${randomRef}`);
      setIssueDate(todayStr);
      setDueDate(dueStr);
      setStatus('unpaid');
      setTaxRate(7.5);
      setDeliveryFee(1500);
      setDiscount(0);
      setNotes(
        'Please process payment by the due date to avoid service disruption. 6 Months warranty on parts.'
      );
      setTerms('Cheque / Bank transfer in favor of AGILITY POWER SYSTEM.');

      // Default item
      setItems([
        {
          id: `item-${Date.now()}`,
          description: products[0]?.name || 'CNG Compressor Suction & Discharge Valve Assembly',
          category: products[0]?.category || 'CNG Compressor Spare Sales & Service',
          unitPrice: products[0]?.defaultPrice || 38000,
          quantity: 1,
          unit: 'Set',
          amount: products[0]?.defaultPrice || 38000,
        },
      ]);
    }
  }, [invoiceToEdit, isOpen, clients, products]);

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      description: 'CNG Compressor Spare Part / Service',
      category: 'CNG Compressor Spare Sales & Service',
      unitPrice: 15000,
      quantity: 1,
      unit: 'Set',
      amount: 15000,
    };
    setItems((prev) => [...prev, newItem]);
  };

  const handleCatalogSelect = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setItems((prev) => {
      const updated = [...prev];
      const qty = updated[index]?.quantity || 1;
      updated[index] = {
        ...updated[index],
        description: product.name,
        category: product.category,
        unitPrice: product.defaultPrice,
        unit: product.unit,
        amount: product.defaultPrice * qty,
      };
      return updated;
    });
  };

  const handleItemChange = (
    index: number,
    field: keyof InvoiceItem,
    value: string | number
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const current = { ...updated[index], [field]: value };

      if (field === 'quantity' || field === 'unitPrice') {
        const q = field === 'quantity' ? Number(value) : current.quantity;
        const p = field === 'unitPrice' ? Number(value) : current.unitPrice;
        current.amount = Math.max(0, (q || 0) * (p || 0));
      }

      updated[index] = current;
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const taxAmount = (subtotal * (Number(taxRate) || 0)) / 100;
  const grandTotal = Math.max(
    0,
    subtotal + taxAmount + (Number(deliveryFee) || 0) - (Number(discount) || 0)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let client = clients.find((c) => c.id === selectedClientId);

    if (isAddingNewClient && newClientName.trim()) {
      client = {
        id: `cli-${Date.now()}`,
        name: newClientName.trim(),
        contactPerson: newClientContact.trim() || 'Manager',
        email: 'info@client.com',
        phone: newClientPhone.trim() || '+8801700000000',
        address: newClientAddress.trim() || 'Dhaka, Bangladesh',
        city: 'Dhaka',
        industry: 'Industrial Client',
      };
    }

    if (!client) {
      alert('Please select or add a client company');
      return;
    }

    if (items.length === 0) {
      alert('Please add at least one line item');
      return;
    }

    const savedInvoice: Invoice = {
      id: invoiceToEdit ? invoiceToEdit.id : `inv-${Date.now()}`,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now()}`,
      refNumber: refNumber.trim() || `#REF-${Date.now()}`,
      client,
      issueDate: issueDate || new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      status,
      items,
      subtotal,
      taxRate: Number(taxRate) || 0,
      taxAmount,
      deliveryFee: Number(deliveryFee) || 0,
      discount: Number(discount) || 0,
      total: grandTotal,
      notes,
      terms,
      currency,
      createdAt: invoiceToEdit ? invoiceToEdit.createdAt : new Date().toISOString(),
    };

    onSave(savedInvoice);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {invoiceToEdit ? `Edit Invoice #${invoiceToEdit.invoiceNumber}` : 'Create New Invoice'}
            </h3>
            <p className="text-xs text-slate-500">
              Agility Power System Billing & Invoicing Engine
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Top Row: Client & Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Selection */}
            <div className="md:col-span-1 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700">
                  Client / Company
                </label>
                <button
                  type="button"
                  onClick={() => setIsAddingNewClient(!isAddingNewClient)}
                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700"
                >
                  {isAddingNewClient ? '← Pick Existing' : '+ New Client'}
                </button>
              </div>

              {isAddingNewClient ? (
                <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    placeholder="Company Name (e.g. Navana CNG)"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    required={isAddingNewClient}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-rose-500"
                  />
                  <input
                    type="text"
                    placeholder="Contact Person (Engr. / DGM)"
                    value={newClientContact}
                    onChange={(e) => setNewClientContact(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Phone Number (+8801...)"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Location / Address (Dhaka, Narayanganj)"
                    value={newClientAddress}
                    onChange={(e) => setNewClientAddress(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                  />
                </div>
              ) : (
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-medium focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Invoice & Ref Numbers */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700">
                Invoice & Reference #
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Invoice #"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-rose-400/20"
                />
                <input
                  type="text"
                  placeholder="Ref # (e.g. #SH8893247)"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  required
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-slate-800 focus:ring-2 focus:ring-rose-400/20"
                />
              </div>
            </div>

            {/* Dates & Status */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    required
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Payment Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
                  className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold capitalize"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Line Items Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Services & Spare Parts Items
              </h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-100 p-2.5 grid grid-cols-12 gap-2 text-[11px] font-bold text-slate-600 border-b border-slate-200">
                <div className="col-span-5 sm:col-span-4">Item & Description</div>
                <div className="col-span-3 sm:col-span-3 hidden sm:block">Category</div>
                <div className="col-span-3 sm:col-span-2 text-right">Price ({currency})</div>
                <div className="col-span-2 sm:col-span-1 text-center">Qty</div>
                <div className="col-span-2 sm:col-span-2 text-right">Total</div>
              </div>

              <div className="divide-y divide-slate-100 p-1">
                {items.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="p-2.5 space-y-2 hover:bg-slate-50/50 rounded-lg transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-2 items-center text-xs">
                      {/* Item Description & Quick Preset Picker */}
                      <div className="col-span-5 sm:col-span-4 space-y-1">
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleCatalogSelect(idx, e.target.value);
                            }
                          }}
                          className="w-full text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5"
                        >
                          <option value="">-- Pick from APS Catalog --</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (৳{p.defaultPrice.toLocaleString()})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(idx, 'description', e.target.value)
                          }
                          placeholder="Item description..."
                          required
                          className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded focus:ring-1 focus:ring-rose-400"
                        />
                      </div>

                      {/* Category */}
                      <div className="col-span-3 hidden sm:block">
                        <select
                          value={item.category}
                          onChange={(e) =>
                            handleItemChange(idx, 'category', e.target.value)
                          }
                          className="w-full text-[11px] px-2 py-1 bg-slate-50 border border-slate-200 rounded text-slate-700 truncate"
                        >
                          <option value="CNG Compressor Spare Sales & Service">
                            CNG Compressor
                          </option>
                          <option value="Gas Ganarators Spare Parts Sales & Service">
                            Gas Generator
                          </option>
                          <option value="PLC Programming Troubleshoot">
                            PLC Automation
                          </option>
                          <option value="Dispenser Controller Sales Service">
                            Dispenser Controller
                          </option>
                          <option value="LPG Dispenser Sales Service">
                            LPG Dispenser
                          </option>
                        </select>
                      </div>

                      {/* Unit Price */}
                      <div className="col-span-3 sm:col-span-2">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, 'unitPrice', Number(e.target.value))
                          }
                          required
                          className="w-full text-xs px-2 py-1 bg-white border border-slate-200 rounded text-right font-mono"
                        />
                      </div>

                      {/* Qty & Unit */}
                      <div className="col-span-2 sm:col-span-1 flex items-center gap-1">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, 'quantity', Number(e.target.value))
                          }
                          required
                          className="w-full text-xs px-1.5 py-1 bg-white border border-slate-200 rounded text-center font-mono"
                        />
                      </div>

                      {/* Total & Remove */}
                      <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-1.5">
                        <span className="font-semibold text-slate-900 font-mono text-xs truncate">
                          {formatCurrency(item.amount, currency)}
                        </span>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Warranty & Serial Sub-row */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 border-t border-slate-100/70 text-[11px] bg-slate-50/50 px-2 py-1 rounded">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="font-semibold text-slate-700">Warranty:</span>
                        <select
                          value={item.warrantyPeriod || 'None'}
                          onChange={(e) =>
                            handleItemChange(idx, 'warrantyPeriod', e.target.value)
                          }
                          className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded font-medium text-slate-800"
                        >
                          <option value="None">No Warranty</option>
                          <option value="1 Month">1 Month</option>
                          <option value="3 Months">3 Months</option>
                          <option value="6 Months">6 Months</option>
                          <option value="1 Year">1 Year Replacement & Service</option>
                          <option value="18 Months">18 Months</option>
                          <option value="2 Years">2 Years</option>
                          <option value="3 Years">3 Years</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="text-slate-500">Serial/Model #:</span>
                        <input
                          type="text"
                          placeholder="e.g. APS-SN-9982 (Optional)"
                          value={item.serialNumber || ''}
                          onChange={(e) =>
                            handleItemChange(idx, 'serialNumber', e.target.value)
                          }
                          className="text-[11px] px-2 py-0.5 bg-white border border-slate-200 rounded w-44 font-mono text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Breakdown & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Customer Notes & Warranty
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Warranty terms, delivery instructions..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Payment Terms
                </label>
                <input
                  type="text"
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Bank transfer / Cheque details..."
                  className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            {/* Calculations right box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Sub Total:</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Tax / VAT (%):</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(Number(e.target.value))}
                  className="w-20 text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-slate-600">Transport / Service Fee:</span>
                <input
                  type="number"
                  min="0"
                  value={deliveryFee}
                  onChange={(e) => setDeliveryFee(Number(e.target.value))}
                  className="w-28 text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-right"
                />
              </div>

              <div className="flex items-center justify-between gap-2 text-rose-600">
                <span>Discount:</span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-28 text-xs px-2 py-0.5 bg-white border border-slate-200 rounded text-right text-rose-600"
                />
              </div>

              <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-extrabold text-slate-900">
                <span>Grand Total:</span>
                <span className="text-base text-rose-600 font-black font-mono">
                  {formatCurrency(grandTotal, currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{invoiceToEdit ? 'Save Changes' : 'Create & Save Invoice'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
