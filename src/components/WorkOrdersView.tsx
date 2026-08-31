import React from 'react';
import { Truck, CheckCircle2, Clock, MapPin, FileText, ArrowRight } from 'lucide-react';
import { Invoice } from '../types';
import { formatDate } from '../utils/formatters';

interface WorkOrdersViewProps {
  invoices: Invoice[];
  onOpenInvoice: (invoice: Invoice) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  invoices,
  onOpenInvoice,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Work Orders & Field Service Deployments
          </h2>
          <p className="text-xs text-slate-500">
            Field delivery and installation work orders for Agility Power System engineers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                  WO {inv.refNumber}
                </span>
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full capitalize ${
                    inv.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {inv.status === 'paid' ? 'Completed' : 'In Service / Pending'}
                </span>
              </div>

              <h3 className="text-sm font-bold text-slate-900">
                {inv.client.name}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {inv.client.address}, {inv.client.city}
                </span>
              </p>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Ordered Services & Parts
                </div>
                <div className="space-y-1">
                  {inv.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="text-xs text-slate-700 flex items-center justify-between"
                    >
                      <span className="truncate max-w-[240px] font-medium">
                        • {item.description}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        x{item.quantity} {item.unit || ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Issued: {formatDate(inv.issueDate)}
              </span>
              <button
                onClick={() => onOpenInvoice(inv)}
                className="flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                <span>View Invoice #{inv.invoiceNumber}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
