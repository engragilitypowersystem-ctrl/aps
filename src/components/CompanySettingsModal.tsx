import React, { useState } from 'react';
import { X, Save, Building, Phone, Mail, MapPin, Landmark, Check } from 'lucide-react';
import { CompanyProfile } from '../types';
import { ApsLogo } from './ApsLogo';

interface CompanySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: CompanyProfile;
  onSave: (updated: CompanyProfile) => void;
}

export const CompanySettingsModal: React.FC<CompanySettingsModalProps> = ({
  isOpen,
  onClose,
  company,
  onSave,
}) => {
  if (!isOpen) return null;

  const [form, setForm] = useState<CompanyProfile>(company);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <ApsLogo size="sm" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Company & Office Profile
              </h3>
              <p className="text-xs text-slate-500">
                Official letterhead and billing configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Tagline / Product Slogan (Shown on Letterhead Pad)
            </label>
            <input
              type="text"
              value={form.tagline}
              onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Office Address (Bottom Letterhead Strip)
            </label>
            <input
              type="text"
              value={form.officeAddress}
              onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Secondary / Engineer Email
              </label>
              <input
                type="email"
                value={form.altEmail}
                onChange={(e) => setForm({ ...form, altEmail: e.target.value })}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Mobile Numbers (Comma separated)
            </label>
            <input
              type="text"
              value={form.phones.join(', ')}
              onChange={(e) =>
                setForm({
                  ...form,
                  phones: e.target.value.split(',').map((p) => p.trim()),
                })
              }
              required
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
            />
          </div>

          {/* Bank Account Details */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bank Payment Information</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={form.bankDetails?.bankName || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bankDetails: {
                        ...form.bankDetails!,
                        bankName: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={form.bankDetails?.accountName || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bankDetails: {
                        ...form.bankDetails!,
                        accountName: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  value={form.bankDetails?.accountNumber || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bankDetails: {
                        ...form.bankDetails!,
                        accountNumber: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Branch
                </label>
                <input
                  type="text"
                  value={form.bankDetails?.branch || ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      bankDetails: {
                        ...form.bankDetails!,
                        branch: e.target.value,
                      },
                    })
                  }
                  className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{savedSuccess ? 'Saved!' : 'Save Office Details'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
