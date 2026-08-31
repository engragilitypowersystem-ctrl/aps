import React, { useState } from 'react';
import { X, ShieldAlert, Wrench, Save, CheckCircle2 } from 'lucide-react';
import { WarrantyRecord, WarrantyClaim } from '../types';

interface WarrantyClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  warranty: WarrantyRecord | null;
  onSaveClaim: (warrantyId: string, claim: WarrantyClaim, newStatus: 'claimed' | 'active') => void;
}

export const WarrantyClaimModal: React.FC<WarrantyClaimModalProps> = ({
  isOpen,
  onClose,
  warranty,
  onSaveClaim,
}) => {
  const [issueReported, setIssueReported] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [technicianName, setTechnicianName] = useState('Engr. Agility Power Tech');
  const [claimStatus, setClaimStatus] = useState<'in_progress' | 'resolved' | 'replaced'>('resolved');

  React.useEffect(() => {
    if (isOpen) {
      setIssueReported('');
      setActionTaken('');
      setClaimStatus('resolved');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!warranty) return;
    if (!issueReported.trim()) {
      alert('Please describe the reported issue');
      return;
    }

    const newClaim: WarrantyClaim = {
      id: `clm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      issueReported: issueReported.trim(),
      actionTaken: actionTaken.trim() || 'Inspected and serviced on-site by APS engineer.',
      status: claimStatus,
      technicianName: technicianName.trim(),
    };

    onSaveClaim(
      warranty.id,
      newClaim,
      claimStatus === 'resolved' || claimStatus === 'replaced' ? 'claimed' : 'claimed'
    );
    onClose();
  };

  if (!isOpen || !warranty) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in duration-150">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Log Warranty Service & Claim
              </h3>
              <p className="text-[11px] text-slate-500">
                {warranty.productName} ({warranty.client.name})
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
          {/* Item details banner */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Serial #:</span>
              <span className="font-mono font-semibold text-slate-800">
                {warranty.serialNumber || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Warranty Period:</span>
              <span className="font-semibold text-emerald-700">
                {warranty.warrantyPeriod} (Valid until {warranty.expiryDate})
              </span>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Issue Reported by Customer *
            </label>
            <textarea
              rows={2}
              value={issueReported}
              onChange={(e) => setIssueReported(e.target.value)}
              placeholder="e.g. Swivel leak, ignition miss, display digit flicker..."
              required
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Action Taken / Solution Provided
            </label>
            <textarea
              rows={2}
              value={actionTaken}
              onChange={(e) => setActionTaken(e.target.value)}
              placeholder="e.g. O-ring replaced under warranty, recalibrated at 200 Bar pressure..."
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Technician / Engineer
              </label>
              <input
                type="text"
                value={technicianName}
                onChange={(e) => setTechnicianName(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Service Resolution Status
              </label>
              <select
                value={claimStatus}
                onChange={(e) =>
                  setClaimStatus(e.target.value as 'in_progress' | 'resolved' | 'replaced')
                }
                className="w-full text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              >
                <option value="resolved">Resolved & Tested</option>
                <option value="replaced">Part Replaced Free</option>
                <option value="in_progress">Service In Progress</option>
              </select>
            </div>
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
              className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Service Log</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
