import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  Plus,
  Printer,
  Wrench,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Trash2,
  RefreshCw,
  Building,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { WarrantyRecord, WarrantyStatus, Client, ProductCatalogItem, Invoice, CompanyProfile, WarrantyClaim } from '../types';
import { formatDate } from '../utils/formatters';
import { WarrantyCertificateModal } from './WarrantyCertificateModal';
import { WarrantyClaimModal } from './WarrantyClaimModal';
import { AddWarrantyModal } from './AddWarrantyModal';

interface WarrantyViewProps {
  warranties: WarrantyRecord[];
  onAddWarranty: (warranty: WarrantyRecord) => void;
  onUpdateWarranty: (warranty: WarrantyRecord) => void;
  onDeleteWarranty: (warrantyId: string) => void;
  onLogClaim: (warrantyId: string, claim: WarrantyClaim, newStatus: 'claimed' | 'active') => void;
  clients: Client[];
  products: ProductCatalogItem[];
  invoices: Invoice[];
  company: CompanyProfile;
  onViewClientProfile?: (client: Client) => void;
  onOpenInvoice?: (invoiceId: string) => void;
}

export const WarrantyView: React.FC<WarrantyViewProps> = ({
  warranties,
  onAddWarranty,
  onUpdateWarranty,
  onDeleteWarranty,
  onLogClaim,
  clients,
  products,
  invoices,
  company,
  onViewClientProfile,
  onOpenInvoice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | WarrantyStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Modals
  const [selectedWarrantyForCert, setSelectedWarrantyForCert] = useState<WarrantyRecord | null>(null);
  const [selectedWarrantyForClaim, setSelectedWarrantyForClaim] = useState<WarrantyRecord | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [expandedClaimWarrantyId, setExpandedClaimWarrantyId] = useState<string | null>(null);

  // Helper to calculate days remaining
  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Helper for status badge
  const getStatusBadge = (status: WarrantyStatus, daysLeft: number) => {
    if (status === 'claimed') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
          <Wrench className="w-3 h-3 text-blue-600" />
          <span>Claimed / Serviced</span>
        </span>
      );
    }
    if (daysLeft < 0 || status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Expired</span>
        </span>
      );
    }
    if (daysLeft <= 30 || status === 'expiring_soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          <span>Expiring Soon ({daysLeft}d left)</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
        <span>Active ({daysLeft}d left)</span>
      </span>
    );
  };

  // Handle Quick Extend Warranty
  const handleExtendWarranty = (warranty: WarrantyRecord, additionalMonths: number) => {
    const currentExp = new Date(warranty.expiryDate);
    currentExp.setMonth(currentExp.getMonth() + additionalMonths);
    const newExpiryStr = currentExp.toISOString().split('T')[0];

    const updated: WarrantyRecord = {
      ...warranty,
      expiryDate: newExpiryStr,
      warrantyPeriod: `${warranty.warrantyPeriod} (+${additionalMonths}M Extended)`,
      status: 'active',
    };
    onUpdateWarranty(updated);
  };

  // Metrics
  const metrics = useMemo(() => {
    let active = 0;
    let expiringSoon = 0;
    let expired = 0;
    let claimed = 0;

    warranties.forEach((w) => {
      const days = getDaysRemaining(w.expiryDate);
      if (w.status === 'claimed') claimed++;
      if (days < 0 || w.status === 'expired') {
        expired++;
      } else if (days <= 30) {
        expiringSoon++;
      } else {
        active++;
      }
    });

    return { total: warranties.length, active, expiringSoon, expired, claimed };
  }, [warranties]);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    warranties.forEach((w) => {
      if (w.category) set.add(w.category);
    });
    return Array.from(set);
  }, [warranties]);

  // Filtered Warranties
  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        w.productName.toLowerCase().includes(query) ||
        (w.serialNumber && w.serialNumber.toLowerCase().includes(query)) ||
        w.client.name.toLowerCase().includes(query) ||
        (w.invoiceNumber && w.invoiceNumber.toLowerCase().includes(query)) ||
        (w.refNumber && w.refNumber.toLowerCase().includes(query));

      // Status
      const days = getDaysRemaining(w.expiryDate);
      let matchesStatus = true;
      if (statusFilter === 'active') {
        matchesStatus = days > 30 && w.status !== 'expired' && w.status !== 'claimed';
      } else if (statusFilter === 'expiring_soon') {
        matchesStatus = days >= 0 && days <= 30;
      } else if (statusFilter === 'expired') {
        matchesStatus = days < 0 || w.status === 'expired';
      } else if (statusFilter === 'claimed') {
        matchesStatus = w.status === 'claimed' || (w.claims && w.claims.length > 0);
      }

      // Category
      const matchesCategory =
        categoryFilter === 'all' || w.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [warranties, searchQuery, statusFilter, categoryFilter]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200/70">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                APS Warranty & Guarantee Management
              </h2>
              <p className="text-xs text-slate-500">
                Track genuine compressor spare warranties, dispenser board guarantee cards & service logs
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#171717] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Register Warranty</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Warranties */}
        <div
          onClick={() => setStatusFilter('active')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Active Warranties</span>
            <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{metrics.active}</div>
          <div className="text-[11px] text-emerald-700 mt-0.5 font-medium">
            Covered by APS genuine replacement guarantee
          </div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => setStatusFilter('expiring_soon')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'expiring_soon'
              ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200/80 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Expiring (&lt;30 Days)</span>
            <div className="p-1.5 bg-amber-100 text-amber-700 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-700">{metrics.expiringSoon}</div>
          <div className="text-[11px] text-amber-700 mt-0.5 font-medium">
            Follow up for AMC / Maintenance renewals
          </div>
        </div>

        {/* Service Claims Logged */}
        <div
          onClick={() => setStatusFilter('claimed')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'claimed'
              ? 'bg-blue-50/80 border-blue-300 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Servicing & Claims</span>
            <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-blue-800">{metrics.claimed}</div>
          <div className="text-[11px] text-blue-700 mt-0.5 font-medium">
            Handled by APS field service engineers
          </div>
        </div>

        {/* Total Assets Registered */}
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === 'all'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20'
              : 'bg-white border-slate-200/80 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">Total Warranties</span>
            <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">{metrics.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {metrics.expired} expired warranties archived
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, serial #, client, invoice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-400/20 focus:border-rose-400 transition-all"
            />
          </div>

          {/* Status Tab Group */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto p-1 bg-slate-100/80 rounded-xl">
            {(['all', 'active', 'expiring_soon', 'claimed', 'expired'] as const).map((tab) => {
              const labels = {
                all: `All (${warranties.length})`,
                active: `Active (${metrics.active})`,
                expiring_soon: `Expiring Soon (${metrics.expiringSoon})`,
                claimed: `Claimed (${metrics.claimed})`,
                expired: `Expired (${metrics.expired})`,
              };
              const isActive = statusFilter === tab;

              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {labels[tab]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Category filter sub-row if multiple */}
        {categories.length > 0 && (
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500 overflow-x-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-slate-600">Category:</span>
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium ${
                categoryFilter === 'all'
                  ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap ${
                  categoryFilter === cat
                    ? 'bg-rose-50 text-rose-600 font-bold border border-rose-200'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Warranty Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredWarranties.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Warranty Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter.'
                : 'Warranty records added from Invoices or directly registered will appear here.'}
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold"
            >
              + Register First Warranty
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-500 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Product / Part & Serial</th>
                  <th className="py-3 px-4">Customer & Location</th>
                  <th className="py-3 px-4">Invoice / Ref</th>
                  <th className="py-3 px-4">Warranty Period</th>
                  <th className="py-3 px-4">Status & Validity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWarranties.map((w) => {
                  const daysLeft = getDaysRemaining(w.expiryDate);
                  const isClaimExpanded = expandedClaimWarrantyId === w.id;

                  return (
                    <React.Fragment key={w.id}>
                      <tr className="hover:bg-slate-50/60 transition-colors">
                        {/* Product & Serial */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{w.productName}</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                              SN: {w.serialNumber || 'APS-GENUINE'}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[180px]">
                              {w.category}
                            </span>
                          </div>
                        </td>

                        {/* Customer */}
                        <td className="py-3.5 px-4">
                          {onViewClientProfile ? (
                            <button
                              onClick={() => onViewClientProfile(w.client)}
                              className="font-bold text-slate-800 hover:text-rose-600 text-left block group"
                            >
                              <span>{w.client.name}</span>
                              <span className="text-[10px] text-slate-400 group-hover:text-rose-500 block font-normal">
                                {w.client.city} • {w.client.phone}
                              </span>
                            </button>
                          ) : (
                            <div>
                              <div className="font-bold text-slate-800">{w.client.name}</div>
                              <div className="text-[10px] text-slate-400">
                                {w.client.city} • {w.client.phone}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Invoice & Ref */}
                        <td className="py-3.5 px-4">
                          {w.invoiceNumber ? (
                            <button
                              onClick={() => {
                                if (onOpenInvoice && w.invoiceId) {
                                  onOpenInvoice(w.invoiceId);
                                }
                              }}
                              className="font-semibold text-rose-600 hover:underline text-left block"
                            >
                              {w.invoiceNumber}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Direct Card</span>
                          )}
                          <div className="text-[10px] text-slate-400 font-mono">
                            {w.refNumber || '-'}
                          </div>
                        </td>

                        {/* Warranty Period & Dates */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-emerald-800 text-xs">
                            {w.warrantyPeriod}
                          </div>
                          <div className="text-[10px] text-slate-500 space-y-0.5 mt-0.5">
                            <div>From: {formatDate(w.startDate)}</div>
                            <div>Until: <span className="font-semibold text-slate-800">{formatDate(w.expiryDate)}</span></div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <div>{getStatusBadge(w.status, daysLeft)}</div>
                          {w.claims && w.claims.length > 0 && (
                            <button
                              onClick={() =>
                                setExpandedClaimWarrantyId(
                                  isClaimExpanded ? null : w.id
                                )
                              }
                              className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 mt-1"
                            >
                              <span>{w.claims.length} Service Logged</span>
                              {isClaimExpanded ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Certificate Button */}
                            <button
                              onClick={() => setSelectedWarrantyForCert(w)}
                              className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 border border-slate-200 rounded-lg transition-colors"
                              title="Print Official Warranty Certificate"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>

                            {/* Service / Claim Button */}
                            <button
                              onClick={() => setSelectedWarrantyForClaim(w)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors"
                              title="Log Warranty Service / Claim"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick Extend */}
                            <button
                              onClick={() => handleExtendWarranty(w, 6)}
                              className="px-2 py-1 text-[10px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Extend warranty by +6 Months"
                            >
                              +6M
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => {
                                if (confirm(`Remove warranty for ${w.productName}?`)) {
                                  onDeleteWarranty(w.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete warranty entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Claim History */}
                      {isClaimExpanded && w.claims && w.claims.length > 0 && (
                        <tr className="bg-blue-50/40">
                          <td colSpan={6} className="p-4 border-t border-b border-blue-100">
                            <div className="space-y-2">
                              <div className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                <Wrench className="w-3.5 h-3.5 text-blue-600" />
                                <span>Technician Service & Claim Logs</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {w.claims.map((c) => (
                                  <div
                                    key={c.id}
                                    className="p-3 bg-white rounded-xl border border-blue-200 shadow-2xs space-y-1 text-xs"
                                  >
                                    <div className="flex items-center justify-between text-[11px]">
                                      <span className="font-semibold text-slate-800">
                                        Date: {formatDate(c.date)}
                                      </span>
                                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full font-bold uppercase text-[10px]">
                                        {c.status}
                                      </span>
                                    </div>
                                    <div className="text-slate-700">
                                      <span className="font-semibold text-slate-900">Issue: </span>
                                      {c.issueReported}
                                    </div>
                                    <div className="text-slate-600 text-[11px]">
                                      <span className="font-semibold text-slate-800">Resolution: </span>
                                      {c.actionTaken}
                                    </div>
                                    {c.technicianName && (
                                      <div className="text-[10px] text-slate-400 font-medium pt-1">
                                        Technician: {c.technicianName}
                                      </div>
                                    )}
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
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <WarrantyCertificateModal
        isOpen={!!selectedWarrantyForCert}
        onClose={() => setSelectedWarrantyForCert(null)}
        warranty={selectedWarrantyForCert}
        company={company}
      />

      <WarrantyClaimModal
        isOpen={!!selectedWarrantyForClaim}
        onClose={() => setSelectedWarrantyForClaim(null)}
        warranty={selectedWarrantyForClaim}
        onSaveClaim={onLogClaim}
      />

      <AddWarrantyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={onAddWarranty}
        clients={clients}
        products={products}
        invoices={invoices}
      />
    </div>
  );
};
