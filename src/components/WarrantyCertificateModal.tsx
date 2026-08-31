import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle, Calendar, Award } from 'lucide-react';
import { WarrantyRecord, CompanyProfile } from '../types';
import { formatDate } from '../utils/formatters';
import { ApsLogo } from './ApsLogo';

interface WarrantyCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: WarrantyRecord | null;
  company: CompanyProfile;
}

export const WarrantyCertificateModal: React.FC<WarrantyCertificateModalProps> = ({
  isOpen,
  onClose,
  warranty,
  company,
}) => {
  if (!isOpen || !warranty) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Official APS Warranty Certificate Preview
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all active:scale-98"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Page */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-slate-50/40">
          <div className="bg-white p-8 sm:p-12 rounded-xl border-2 border-slate-300 shadow-md relative overflow-hidden print:border-0 print:shadow-none print:p-6">
            {/* Top Certificate Corner Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-emerald-500/10 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-rose-500/10 to-transparent pointer-events-none" />

            {/* Header */}
            <div className="text-center space-y-2 pb-6 border-b-2 border-slate-200">
              <div className="flex justify-center mb-1">
                <ApsLogo size="md" showText={true} />
              </div>
              <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-tight">
                {company.tagline}
              </p>
              <p className="text-[10px] text-slate-400">
                {company.officeAddress} | Mob: {company.phones.join(', ')}
              </p>

              <div className="pt-3">
                <span className="inline-block px-4 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black tracking-widest uppercase shadow-2xs">
                  ★ Official Certificate of Warranty & Service ★
                </span>
              </div>
            </div>

            {/* Certificate Details Body */}
            <div className="py-6 space-y-6 text-xs text-slate-700">
              {/* Issued to & Reference Info */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Certificate Issued To (Customer)
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {warranty.client.name}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">
                    {warranty.client.address}, {warranty.client.city}
                  </div>
                  <div className="text-[11px] text-slate-600 font-medium">
                    Contact: {warranty.client.contactPerson} ({warranty.client.phone})
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Warranty Reference
                  </div>
                  <div className="text-xs font-mono font-bold text-slate-800">
                    ID: {warranty.id.toUpperCase()}
                  </div>
                  {warranty.invoiceNumber && (
                    <div className="text-[11px] text-slate-600">
                      Invoice Ref: <span className="font-semibold">{warranty.invoiceNumber}</span>
                    </div>
                  )}
                  {warranty.refNumber && (
                    <div className="text-[11px] text-slate-600">
                      Work Order: <span className="font-semibold">{warranty.refNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Warranted Item Box */}
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Warranted Equipment / Service Specifications</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Product / Part Name:</span>
                    <span className="font-bold text-slate-900 text-sm">
                      {warranty.productName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Serial / Unit Identifier:</span>
                    <span className="font-mono font-semibold text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded inline-block">
                      {warranty.serialNumber || 'APS-VERIFIED-GENUINE'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Equipment Category:</span>
                    <span className="font-medium text-slate-700">{warranty.category}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">Coverage Scope:</span>
                    <span className="font-semibold text-emerald-700">
                      {warranty.coverageType || 'Full Replacement & Technical Service'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Period & Terms Box */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Effective From
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {formatDate(warranty.startDate)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[10px] text-emerald-800 font-bold uppercase">
                    Warranty Duration
                  </div>
                  <div className="text-sm font-black text-emerald-900 mt-0.5">
                    {warranty.warrantyPeriod}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">
                    Valid Until (Expiry)
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">
                    {formatDate(warranty.expiryDate)}
                  </div>
                </div>
              </div>

              {/* Warranty Terms & Conditions */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800">Warranty Terms & Conditions:</div>
                <ul className="list-disc pl-4 space-y-0.5 text-[10px]">
                  <li>
                    Covers manufacturing defects, coil integrity, and spare part functionality under normal standard gas & compressor operating parameters.
                  </li>
                  <li>
                    Free on-call inspection & part replacement will be provided by certified APS service engineers during the active warranty period.
                  </li>
                  <li>
                    Physical accidental damage, electrical overload beyond specified voltage, or unauthorized third-party tampering void this warranty.
                  </li>
                </ul>
              </div>

              {/* Authorized Signature Row */}
              <div className="pt-8 flex justify-between items-end">
                <div className="text-center">
                  <div className="w-36 border-b border-slate-300 pb-1 text-[10px] text-slate-400">
                    Customer Acceptance
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-medium">
                    Received & Verified
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-emerald-700 font-bold text-xs italic mb-1 font-serif">
                    Engr. Agility Power System
                  </div>
                  <div className="w-44 border-b-2 border-slate-800 pb-1 text-[11px] font-bold text-slate-900">
                    Authorized Engineer Signature
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Agility Power System (APS)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
