import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Printer,
  FileDown,
  RefreshCw,
  SlidersHorizontal,
  Bell,
  Menu,
  X,
  Sparkles,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import {
  Invoice,
  Client,
  CompanyProfile,
  ProductCatalogItem,
  InvoiceStatus,
} from './types';
import {
  AGILITY_COMPANY,
  INITIAL_CLIENTS,
  INITIAL_INVOICES,
  INITIAL_PRODUCTS,
} from './data/initialData';
import { Sidebar, NavSection } from './components/Sidebar';
import { HeaderStats } from './components/HeaderStats';
import { InvoiceList } from './components/InvoiceList';
import { InvoiceDetailPane } from './components/InvoiceDetailPane';
import { OfficialLetterheadPad } from './components/OfficialLetterheadPad';
import { InvoiceModal } from './components/InvoiceModal';
import { CompanySettingsModal } from './components/CompanySettingsModal';
import { ClientsView } from './components/ClientsView';
import { InventoryView } from './components/InventoryView';
import { AnalyticsView } from './components/AnalyticsView';
import { WorkOrdersView } from './components/WorkOrdersView';

export default function App() {
  // Local storage initialized states
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('aps_invoices');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_INVOICES;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('aps_clients');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_CLIENTS;
  });

  const [products, setProducts] = useState<ProductCatalogItem[]>(() => {
    const saved = localStorage.getItem('aps_products');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PRODUCTS;
  });

  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem('aps_company');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return AGILITY_COMPANY;
  });

  // Active states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    invoices[0]?.id || null
  );
  const [currentSection, setCurrentSection] = useState<NavSection>('billing');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [currency, setCurrency] = useState<'BDT' | 'USD'>('BDT');

  // Modals & Views
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceToEdit, setInvoiceToEdit] = useState<Invoice | null>(null);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isPadViewOpen, setIsPadViewOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('aps_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('aps_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('aps_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('aps_company', JSON.stringify(company));
  }, [company]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const selectedInvoice =
    invoices.find((i) => i.id === selectedInvoiceId) || invoices[0] || null;

  // Handlers
  const handleSelectInvoice = (invoice: Invoice) => {
    setSelectedInvoiceId(invoice.id);
  };

  const handleOpenCreateInvoice = () => {
    setInvoiceToEdit(null);
    setIsInvoiceModalOpen(true);
  };

  const handleOpenEditInvoice = (invoice: Invoice) => {
    setInvoiceToEdit(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (savedInvoice: Invoice) => {
    setInvoices((prev) => {
      const exists = prev.some((i) => i.id === savedInvoice.id);
      if (exists) {
        return prev.map((i) => (i.id === savedInvoice.id ? savedInvoice : i));
      }
      return [savedInvoice, ...prev];
    });
    setSelectedInvoiceId(savedInvoice.id);
    setIsInvoiceModalOpen(false);
    showToast(`Invoice #${savedInvoice.invoiceNumber} saved successfully!`);
  };

  const handleDeleteInvoice = (invoiceId: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== invoiceId));
    if (selectedInvoiceId === invoiceId) {
      const remaining = invoices.filter((i) => i.id !== invoiceId);
      setSelectedInvoiceId(remaining[0]?.id || null);
    }
    showToast('Invoice deleted.');
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const randomRef = Math.floor(1000000 + Math.random() * 9000000);
    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-${randomNum}`,
      refNumber: `#SH${randomRef}`,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'unpaid',
      createdAt: new Date().toISOString(),
    };
    setInvoices((prev) => [duplicated, ...prev]);
    setSelectedInvoiceId(duplicated.id);
    showToast(`Duplicated into new Invoice #${duplicated.invoiceNumber}!`);
  };

  const handleToggleStatus = (invoiceId: string, newStatus: InvoiceStatus) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus } : i))
    );
    showToast(`Invoice status marked as ${newStatus.toUpperCase()}`);
  };

  const handleOpenLetterhead = (invoice?: Invoice) => {
    if (invoice) {
      setSelectedInvoiceId(invoice.id);
    }
    setIsPadViewOpen(true);
  };

  const handleSendInvoice = (invoice: Invoice) => {
    const subject = encodeURIComponent(
      `Invoice #${invoice.invoiceNumber} - Agility Power System`
    );
    const body = encodeURIComponent(
      `Dear ${invoice.client.contactPerson},\n\nPlease find attached the billing statement #${invoice.invoiceNumber} for work order ${invoice.refNumber} totaling ${invoice.total} BDT.\n\nThank you for choosing Agility Power System.\n\nOffice Address: House- 57/192, Mujahidnagar, Rayerbag, Kadamtoli, Dhaka-1362\nPhones: +8801972664724, +8801972664725, +8801612095196`
    );
    window.location.href = `mailto:${invoice.client.email}?subject=${subject}&body=${body}`;
    showToast(`Dispatched invoice email client to ${invoice.client.email}`);
  };

  const handleAddClient = (newClient: Client) => {
    setClients((prev) => [newClient, ...prev]);
    showToast(`Client "${newClient.name}" added!`);
  };

  const handleAddProduct = (newProduct: ProductCatalogItem) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Product "${newProduct.name}" added to catalog!`);
  };

  const handleSaveCompany = (updated: CompanyProfile) => {
    setCompany(updated);
    showToast('Company office details updated!');
  };

  // If in full Letterhead Pad View
  if (isPadViewOpen && selectedInvoice) {
    return (
      <OfficialLetterheadPad
        invoice={selectedInvoice}
        company={company}
        onBack={() => setIsPadViewOpen(false)}
        currency={currency}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f4efe8] text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={(sec) => {
          if (sec === 'settings') {
            setIsCompanyModalOpen(true);
          } else {
            setCurrentSection(sec);
          }
        }}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onQuickLetterhead={() => handleOpenLetterhead(selectedInvoice || undefined)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top App Header matching Image 1 */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {currentSection === 'billing' && 'Invoices & Billing'}
                {currentSection === 'dashboard' && 'Operations Dashboard'}
                {currentSection === 'analytics' && 'Billing & Revenue Analytics'}
                {currentSection === 'workorders' && 'Field Work Orders'}
                {currentSection === 'inventory' && 'Parts & Services Catalog'}
                {currentSection === 'clients' && 'Stations & Clients'}
              </h1>
              <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1.5 mt-0.5">
                <span className="text-slate-400">Dashboard</span>
                <span>/</span>
                <span className="text-rose-600 font-medium">
                  {currentSection === 'billing'
                    ? 'Invoices & Billing'
                    : currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* Currency Switcher */}
            <div className="bg-slate-100 p-0.5 rounded-lg flex items-center text-xs font-bold text-slate-600 border border-slate-200">
              <button
                onClick={() => setCurrency('BDT')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'BDT'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold text-rose-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                ৳ BDT
              </button>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currency === 'USD'
                    ? 'bg-white text-slate-900 shadow-2xs font-extrabold text-rose-600'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                $ USD
              </button>
            </div>

            {/* Global Search box matching image 1 top right */}
            <div className="relative hidden md:block w-52 lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-slate-50 hover:bg-slate-100 focus:bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-400/20"
              />
            </div>

            {/* Quick Letterhead print */}
            {selectedInvoice && (
              <button
                onClick={() => handleOpenLetterhead(selectedInvoice)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-semibold transition-colors"
                title="Print on official Agility Power System Letterhead Pad"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>Letterhead View</span>
              </button>
            )}

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ff4d4f] rounded-full ring-2 ring-white" />
            </button>
          </div>
        </header>

        {/* Dynamic Scrollable Body Area */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
          {currentSection === 'billing' || currentSection === 'dashboard' ? (
            <>
              {/* 4 Summary Stat KPI Cards matching Image 1 */}
              <HeaderStats
                invoices={invoices}
                activeFilter={statusFilter}
                onFilterChange={setStatusFilter}
                currency={currency}
              />

              {/* Main Split-Pane Workspace matching Image 1 */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[580px] h-[calc(100vh-270px)]">
                {/* Left 7 Columns: Invoices Table */}
                <div className="lg:col-span-7 h-full">
                  <InvoiceList
                    invoices={invoices}
                    selectedInvoiceId={selectedInvoiceId}
                    onSelectInvoice={handleSelectInvoice}
                    onNewInvoice={handleOpenCreateInvoice}
                    onDeleteInvoice={handleDeleteInvoice}
                    onDuplicateInvoice={handleDuplicateInvoice}
                    currency={currency}
                    activeStatusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                  />
                </div>

                {/* Right 5 Columns: Invoice Details Pane matching Image 1 */}
                <div className="lg:col-span-5 h-full">
                  <InvoiceDetailPane
                    invoice={selectedInvoice}
                    company={company}
                    currency={currency}
                    onEdit={handleOpenEditInvoice}
                    onToggleStatus={handleToggleStatus}
                    onOpenLetterheadView={handleOpenLetterhead}
                    onSendInvoice={handleSendInvoice}
                  />
                </div>
              </div>
            </>
          ) : currentSection === 'analytics' ? (
            <AnalyticsView invoices={invoices} currency={currency} />
          ) : currentSection === 'workorders' ? (
            <WorkOrdersView
              invoices={invoices}
              onOpenInvoice={(inv) => {
                setSelectedInvoiceId(inv.id);
                setCurrentSection('billing');
              }}
            />
          ) : currentSection === 'inventory' ? (
            <InventoryView
              products={products}
              onAddProduct={handleAddProduct}
              currency={currency}
            />
          ) : currentSection === 'clients' ? (
            <ClientsView
              clients={clients}
              invoices={invoices}
              onSelectClientInvoices={(client) => {
                setCurrentSection('billing');
              }}
              onAddClient={handleAddClient}
              currency={currency}
            />
          ) : null}
        </main>
      </div>

      {/* Invoice Create / Edit Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSave={handleSaveInvoice}
        invoiceToEdit={invoiceToEdit}
        clients={clients}
        products={products}
        currency={currency}
      />

      {/* Company Office Settings Modal */}
      <CompanySettingsModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        company={company}
        onSave={handleSaveCompany}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#171717] text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
