import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  MapPin,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Printer,
  Edit3,
  Search,
  ExternalLink,
  Receipt,
  Download,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { Client, Invoice, CompanyProfile, InvoiceStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { ApsLogo } from './ApsLogo';

interface ClientProfileViewProps {
  client: Client;
  invoices: Invoice[];
  company: CompanyProfile;
  currency: 'BDT' | 'USD';
  onBack: () => void;
  onOpenInvoice: (invoice: Invoice) => void;
  onOpenLetterhead: (invoice: Invoice) => void;
  onCreateInvoiceForClient: (client: Client) => void;
  onEditInvoice: (invoice: Invoice) => void;
  onToggleInvoiceStatus: (invoiceId: string, newStatus: InvoiceStatus) => void;
  onUpdateClient?: (updatedClient: Client) => void;
}

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({
  client,
  invoices,
  company,
  currency,
  onBack,
  onOpenInvoice,
  onOpenLetterhead,
  onCreateInvoiceForClient,
  onEditInvoice,
  onToggleInvoiceStatus,
  onUpdateClient,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [showPrintLedger, setShowPrintLedger] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);

  // Edit Client Local State
  const [editName, setEditName] = useState(client.name);
  const [editContact, setEditContact] = useState(client.contactPerson);
  const [editPhone, setEditPhone] = useState(client.phone);
  const [editEmail, setEditEmail] = useState(client.email);
  const [editAddress, setEditAddress] = useState(client.address);
  const [editCity, setEditCity] = useState(client.city);
  const [editIndustry, setEditIndustry] = useState(client.industry || 'CNG Station');

  // Client Specific Invoices
  const clientInvoices = invoices.filter((i) => i.client.id === client.id);

  // Calculations
  const totalBilled = clientInvoices.reduce((sum, i) => sum + i.total, 0);
  const totalPaid = clientInvoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);
  const totalDue = clientInvoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'pending')
    .reduce((sum, i) => sum + i.total, 0);
  const paidCount = clientInvoices.filter((i) => i.status === 'paid').length;
  const unpaidCount = clientInvoices.filter(
    (i) => i.status === 'unpaid' || i.status === 'overdue'
  ).length;

  // Filtered client invoices
  const filteredInvoices = clientInvoices.filter((inv) => {
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.refNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.items.some((it) => it.description.toLowerCase().includes(search.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleSaveClientEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateClient) {
      onUpdateClient({
        ...client,
        name: editName,
        contactPerson: editContact,
        phone: editPhone,
        email: editEmail,
        address: editAddress,
        city: editCity,
        industry: editIndustry,
      });
    }
    setIsEditingClient(false);
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Paid
          </span>
        );
      case 'unpaid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-600 border border-rose-200">
            Unpaid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            Pending
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            Overdue
          </span>
        );
    }
  };

  // If viewing printable ledger statement
  if (showPrintLedger) {
    return (
      <div className="min-h-screen bg-slate-100/90 py-4 sm:py-8 px-2 sm:px-4">
        {/* Action Header */}
        <div className="max-w-4xl mx-auto w-full mb-4 flex items-center justify-between no-print bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setShowPrintLedger(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Client Transactions</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 hidden sm:inline">
              Account Ledger • {client.name}
            </span>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Ledger Statement (A4)</span>
            </button>
          </div>
        </div>

        {/* A4 Statement Page */}
        <div className="max-w-4xl mx-auto w-full bg-white shadow-xl rounded-lg overflow-hidden border border-slate-200 print-container relative flex flex-col justify-between min-h-[1050px] p-6 sm:p-8">
          <div>
            {/* Header with APS Logo */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b-2 border-slate-700 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-16 shrink-0">
                  <ApsLogo size="lg" />
                </div>
                <div>
                  <h1 className="text-2xl font-serif font-black tracking-tight flex items-center">
                    <span className="text-[#1b5e20]">AGILITY </span>
                    <span className="text-[#b71c1c] ml-2">POWER </span>
                    <span className="text-[#1b5e20] ml-2">SYSTEM</span>
                  </h1>
                  <p className="text-xs text-slate-600 font-sans">{company.tagline}</p>
                  <p className="text-[11px] text-slate-500 font-sans">{company.officeAddress}</p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Statement of Account
                </div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Generated on: {formatDate(new Date().toISOString().split('T')[0])}
                </div>
              </div>
            </div>

            {/* Client Info Bar */}
            <div className="my-5 bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Customer Information
                </span>
                <div className="text-sm font-bold text-slate-900">{client.name}</div>
                <div className="text-slate-600">Attn: {client.contactPerson}</div>
                <div className="text-slate-500">{client.address}, {client.city}</div>
                <div className="text-slate-600">Phone: {client.phone} | Email: {client.email}</div>
              </div>

              <div className="sm:text-right flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Financial Summary
                  </span>
                  <div className="text-xs text-slate-600">
                    Total Invoices: <span className="font-semibold text-slate-900">{clientInvoices.length}</span>
                  </div>
                  <div className="text-xs text-slate-600">
                    Total Billed: <span className="font-semibold text-slate-900">{formatCurrency(totalBilled, currency)}</span>
                  </div>
                  <div className="text-xs text-emerald-700">
                    Total Paid: <span className="font-semibold">{formatCurrency(totalPaid, currency)}</span>
                  </div>
                </div>
                <div className="text-sm font-bold text-rose-600 pt-2 border-t border-slate-200 mt-2">
                  Outstanding Due: {formatCurrency(totalDue, currency)}
                </div>
              </div>
            </div>

            {/* Ledger Transactions Table */}
            <div className="border border-slate-300 rounded-md overflow-hidden bg-white mb-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3 border-r border-slate-300">Invoice No.</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Ref / Job No.</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Issue Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-300">Due Date</th>
                    <th className="py-2.5 px-3 border-r border-slate-300 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount ({currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clientInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-3 font-semibold text-rose-600 border-r border-slate-200">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 border-r border-slate-200">
                        {inv.refNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                        {formatDate(inv.issueDate)}
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 border-r border-slate-200">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="py-2.5 px-3 text-center border-r border-slate-200">
                        <span className="capitalize font-medium text-[11px] px-2 py-0.5 rounded bg-slate-100">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(inv.total, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-slate-300 bg-slate-50 font-bold text-xs text-slate-800">
                  <tr>
                    <td colSpan={5} className="py-2 px-3 text-right border-r border-slate-300">
                      Total Invoiced Amount:
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-slate-900">
                      {formatCurrency(totalBilled, currency)}
                    </td>
                  </tr>
                  <tr className="text-emerald-700">
                    <td colSpan={5} className="py-2 px-3 text-right border-r border-slate-300">
                      Total Paid / Cleared:
                    </td>
                    <td className="py-2 px-3 text-right font-mono">
                      {formatCurrency(totalPaid, currency)}
                    </td>
                  </tr>
                  <tr className="text-rose-600 bg-rose-50/50 text-sm font-extrabold">
                    <td colSpan={5} className="py-2.5 px-3 text-right border-r border-slate-300">
                      Net Outstanding Balance:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-black">
                      {formatCurrency(totalDue, currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Signatures & Footer Strip */}
          <div className="mt-12">
            <div className="flex items-end justify-between text-xs text-slate-800 px-6 pb-6">
              <div className="text-center min-w-[160px]">
                <div className="w-44 border-t border-slate-800 mb-1"></div>
                <span className="font-bold">Client Confirmation</span>
              </div>
              <div className="text-center min-w-[160px]">
                <div className="w-44 border-t border-slate-800 mb-1"></div>
                <span className="font-bold">Authorized Accounts Officer</span>
                <div className="text-[10px] text-slate-500">Agility Power System</div>
              </div>
            </div>

            <div className="bg-[#1b5e20] text-white py-3 px-6 text-center text-xs font-sans rounded-b-lg">
              <p className="font-semibold text-xs">{company.officeAddress}</p>
              <p className="text-[11px] text-emerald-100 mt-0.5">
                Phones: {company.phones.join(', ')} • E-mail: {company.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors shrink-0"
            title="Back to Clients"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                {client.name}
              </h2>
              {client.industry && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-100">
                  {client.industry}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Client Profile • Full Billing History & Transactions Ledger
            </p>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
          {/* Edit Client */}
          <button
            onClick={() => setIsEditingClient(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          {/* Print Statement / Ledger */}
          <button
            onClick={() => setShowPrintLedger(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>Print Ledger Statement</span>
          </button>

          {/* Create New Bill for Client */}
          <button
            onClick={() => onCreateInvoiceForClient(client)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Bill for {client.name.split(' ')[0]}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Info & Financial Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Client Contact Profile Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-rose-600 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
                {client.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{client.name}</h3>
                <p className="text-xs text-slate-500">
                  Attn: <span className="font-semibold text-slate-700">{client.contactPerson}</span>
                </p>
              </div>
            </div>

            <div className="pt-4 space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Phone Number</div>
                  <a href={`tel:${client.phone}`} className="font-medium text-slate-800 hover:text-rose-600">
                    {client.phone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</div>
                  <a href={`mailto:${client.email}`} className="font-medium text-slate-800 hover:text-rose-600 truncate block">
                    {client.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Station / Office Location</div>
                  <span className="font-medium text-slate-800 leading-tight block">
                    {client.address}, {client.city}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">Industry Category</div>
                  <span className="font-medium text-slate-800">
                    {client.industry || 'Industrial Plant & Generator'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <a
              href={`tel:${client.phone}`}
              className="flex-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700 text-center mr-2 transition-colors flex items-center justify-center gap-1.5"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Call Client</span>
            </a>
            <a
              href={`mailto:${client.email}?subject=Billing Statement from Agility Power System`}
              className="flex-1 py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold text-rose-700 text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <Mail className="w-3.5 h-3.5 text-rose-500" />
              <span>Send Email</span>
            </a>
          </div>
        </div>

        {/* Right 2 Columns: 4 Financial KPI Summary Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Billed */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Invoiced / Billed
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {formatCurrency(totalBilled, currency)}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">{clientInvoices.length}</span> total bills issued
              </div>
            </div>
          </div>

          {/* Card 2: Total Paid / Collected */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                Total Paid / Collected
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-emerald-700 font-mono">
                {formatCurrency(totalPaid, currency)}
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                <span className="font-bold">{paidCount}</span> fully cleared invoices
              </div>
            </div>
          </div>

          {/* Card 3: Outstanding Due Balance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Current Due / Outstanding
              </span>
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-rose-600 font-mono">
                {formatCurrency(totalDue, currency)}
              </div>
              <div className="text-xs text-rose-500 mt-1">
                <span className="font-bold">{unpaidCount}</span> invoices pending or unpaid
              </div>
            </div>
          </div>

          {/* Card 4: Quick Action / Summary ratio */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Collection Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-black text-slate-900 font-mono">
                {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 100}%
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${totalBilled > 0 ? (totalPaid / totalBilled) * 100 : 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions & All Bills Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Table Filter & Search Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              All Bills & Transactions for {client.name}
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredInvoices.length} of {clientInvoices.length} billing records
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bills, items, ref..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
              />
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              {(['all', 'paid', 'unpaid', 'pending', 'overdue'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md capitalize font-medium transition-all ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="overflow-x-auto">
          {filteredInvoices.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <FileText className="w-10 h-10 stroke-[1.5] text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No bills found</p>
              <p className="text-xs text-slate-400 mt-0.5">
                No invoices match your current search or status filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice ID</th>
                  <th className="py-3 px-3">Work Order / Ref</th>
                  <th className="py-3 px-3">Date Details</th>
                  <th className="py-3 px-3">Goods / Services Description</th>
                  <th className="py-3 px-3 text-right">Total Amount</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Invoice ID */}
                    <td className="py-3.5 px-4 font-bold text-rose-600">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>#{inv.invoiceNumber}</span>
                      </div>
                    </td>

                    {/* Ref */}
                    <td className="py-3.5 px-3 font-mono text-slate-600 text-[11px]">
                      {inv.refNumber}
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-3">
                      <div className="text-slate-800 font-medium">{formatDate(inv.issueDate)}</div>
                      <div className="text-[10px] text-slate-400">Due: {formatDate(inv.dueDate)}</div>
                    </td>

                    {/* Items Summary */}
                    <td className="py-3.5 px-3 max-w-[220px]">
                      <div className="text-slate-800 font-medium truncate">
                        {inv.items.map((i) => i.description).join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {inv.items.length} {inv.items.length === 1 ? 'item' : 'items'}
                      </div>
                    </td>

                    {/* Total */}
                    <td className="py-3.5 px-3 text-right font-black text-slate-900 font-mono whitespace-nowrap">
                      {formatCurrency(inv.total, currency)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(inv.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Letterhead Pad View */}
                        <button
                          onClick={() => onOpenLetterhead(inv)}
                          className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md border border-emerald-200/60"
                          title="View on Official APS Letterhead Pad"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {/* Toggle Status */}
                        {inv.status === 'paid' ? (
                          <button
                            onClick={() => onToggleInvoiceStatus(inv.id, 'unpaid')}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-md border border-amber-200"
                            title="Mark Unpaid"
                          >
                            <Clock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onToggleInvoiceStatus(inv.id, 'paid')}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md border border-emerald-200"
                            title="Mark Paid"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit */}
                        <button
                          onClick={() => onEditInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Open in Billing View */}
                        <button
                          onClick={() => onOpenInvoice(inv)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-[#171717] hover:bg-slate-800 text-white rounded-md text-[11px] font-semibold transition-colors"
                        >
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Client Modal */}
      {isEditingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">Edit Client Details</h3>
            <form onSubmit={handleSaveClientEdit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Company / Station Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contact Person / Engineer</label>
                <input
                  type="text"
                  value={editContact}
                  onChange={(e) => setEditContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Industry Type</label>
                  <select
                    value={editIndustry}
                    onChange={(e) => setEditIndustry(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    <option value="CNG Station">CNG Station</option>
                    <option value="Gas Generator Plants">Gas Generator</option>
                    <option value="Industrial Automation">Automation</option>
                    <option value="LPG Auto Gas">LPG Station</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Location & Address</label>
                <input
                  type="text"
                  value={editAddress}
                  onChange={(e) => setEditAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditingClient(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
