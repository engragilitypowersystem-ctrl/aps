import React, { useState } from 'react';
import { X, ShieldCheck, Save, Plus } from 'lucide-react';
import { WarrantyRecord, Client, ProductCatalogItem, Invoice } from '../types';

interface AddWarrantyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warranty: WarrantyRecord) => void;
  clients: Client[];
  products: ProductCatalogItem[];
  invoices: Invoice[];
}

export const AddWarrantyModal: React.FC<AddWarrantyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clients,
  products,
  invoices,
}) => {
  const [selectedClientId, setSelectedClientId] = useState(clients[0]?.id || '');
  const [productName, setProductName] = useState(products[0]?.name || '');
  const [category, setCategory] = useState(products[0]?.category || 'CNG Compressor Spare Sales & Service');
  const [serialNumber, setSerialNumber] = useState(`APS-SN-${Math.floor(1000 + Math.random() * 9000)}`);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [warrantyPeriod, setWarrantyPeriod] = useState('1 Year');
  const [coverageType, setCoverageType] = useState('Full Replacement & Service');
  const [notes, setNotes] = useState('Includes free on-site service and genuine spare replacement.');

  React.useEffect(() => {
    if (isOpen) {
      if (clients.length > 0 && !selectedClientId) {
        setSelectedClientId(clients[0].id);
      }
      if (products.length > 0 && !productName) {
        setProductName(products[0].name);
        setCategory(products[0].category);
      }
      setSerialNumber(`APS-SN-${Math.floor(1000 + Math.random() * 9000)}`);
      setStartDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, clients, products]);

  const handleProductSelect = (prodId: string) => {
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setProductName(prod.name);
      setCategory(prod.category);
    }
  };

  const calculateExpiry = (start: string, period: string) => {
    const d = new Date(start);
    if (period.includes('1 Month')) d.setMonth(d.getMonth() + 1);
    else if (period.includes('3 Months')) d.setMonth(d.getMonth() + 3);
    else if (period.includes('6 Months')) d.setMonth(d.getMonth() + 6);
    else if (period.includes('18 Months')) d.setMonth(d.getMonth() + 18);
    else if (period.includes('1 Year')) d.setFullYear(d.getFullYear() + 1);
    else if (period.includes('2 Year')) d.setFullYear(d.getFullYear() + 2);
    else if (period.includes('3 Year')) d.setFullYear(d.getFullYear() + 3);
    else d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === selectedClientId) || clients[0];
    const inv = invoices.find((i) => i.id === selectedInvoiceId);

    const expiryDate = calculateExpiry(startDate, warrantyPeriod);

    const newWarranty: WarrantyRecord = {
      id: `war-${Date.now()}`,
      invoiceId: inv?.id,
      invoiceNumber: inv?.invoiceNumber,
      refNumber: inv?.refNumber || `#APS-${Math.floor(100000 + Math.random() * 900000)}`,
      client,
      productName: productName.trim() || 'Spare Part / Equipment',
      serialNumber: serialNumber.trim(),
      category,
      startDate,
      warrantyPeriod,
      expiryDate,
      status: 'active',
      coverageType,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSave(newWarranty);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Register New Warranty Certificate
              </h3>
              <p className="text-[11px] text-slate-500">
                Add product warranty tracking and certificate for customer
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Client & Product selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Client / Company *
              </label>
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pick from Catalog (Optional)
              </label>
              <select
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-600"
              >
                <option value="">-- Choose APS Catalog Item --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Product / Service Description *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. CNG Compressor Suction Valve Assembly"
              required
              className="w-full text-xs px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Serial / Model # *
              </label>
              <input
                type="text"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Link to Invoice (Optional)
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="">-- Direct Warranty (No Invoice) --</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    #{inv.invoiceNumber} ({inv.client.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Warranty Period *
              </label>
              <select
                value={warrantyPeriod}
                onChange={(e) => setWarrantyPeriod(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-emerald-800"
              >
                <option value="1 Month">1 Month</option>
                <option value="3 Months">3 Months</option>
                <option value="6 Months">6 Months</option>
                <option value="1 Year">1 Year Replacement & Service</option>
                <option value="18 Months">18 Months</option>
                <option value="2 Years">2 Years</option>
                <option value="3 Years">3 Years</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Coverage Scope
            </label>
            <input
              type="text"
              value={coverageType}
              onChange={(e) => setCoverageType(e.target.value)}
              placeholder="Full Replacement & Technical Service"
              className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Notes & Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Register Warranty</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
