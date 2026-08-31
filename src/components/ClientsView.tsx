import React, { useState } from 'react';
import { Plus, Search, Building2, Phone, Mail, MapPin, Receipt, ArrowRight } from 'lucide-react';
import { Client, Invoice } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ClientsViewProps {
  clients: Client[];
  invoices: Invoice[];
  onSelectClientInvoices: (client: Client) => void;
  onAddClient: (newClient: Client) => void;
  currency: 'BDT' | 'USD';
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  clients,
  invoices,
  onSelectClientInvoices,
  onAddClient,
  currency,
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [industry, setIndustry] = useState('CNG Station');

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.industry?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: name.trim(),
      contactPerson: contact.trim() || 'Manager',
      phone: phone.trim() || '+8801700000000',
      email: email.trim() || 'info@client.com',
      address: address.trim() || 'Dhaka, Bangladesh',
      city: city.trim() || 'Dhaka',
      industry: industry.trim(),
    };

    onAddClient(newClient);
    setShowAddModal(false);
    setName('');
    setContact('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Clients & Stations Directory
          </h2>
          <p className="text-xs text-slate-500">
            CNG stations, power generator plants, textile mills, and industrial automation clients.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search clients or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#171717] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Client</span>
          </button>
        </div>
      </div>

      {/* Grid of Client Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientInvoices = invoices.filter((i) => i.client.id === client.id);
          const totalBilled = clientInvoices.reduce((sum, i) => sum + i.total, 0);
          const unpaidCount = clientInvoices.filter(
            (i) => i.status === 'unpaid' || i.status === 'overdue'
          ).length;

          return (
            <div
              key={client.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-rose-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                    {client.name.slice(0, 2).toUpperCase()}
                  </div>
                  {client.industry && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {client.industry}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">
                  {client.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Attn: {client.contactPerson}
                </p>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address}</span>
                  </div>
                </div>
              </div>

              {/* Bottom stats & action */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Total Billed</div>
                  <div className="font-bold text-slate-900">
                    {formatCurrency(totalBilled, currency)}
                  </div>
                </div>

                <button
                  onClick={() => onSelectClientInvoices(client)}
                  className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <span>{clientInvoices.length} Invoices</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 mb-4">
              Add New Client / Station
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Company / Station Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Navana CNG Limited"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Contact Person / Engineer
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engr. Kabir Ahmed"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+8801..."
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Industry Type
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
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
                <label className="font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="billing@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Location & Address
                </label>
                <input
                  type="text"
                  placeholder="Kachpur, Sonargaon, Narayanganj"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#171717] hover:bg-slate-800 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
