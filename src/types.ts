export type InvoiceStatus = 'paid' | 'unpaid' | 'pending' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  category: string; // e.g. 'CNG Compressor', 'Gas Generator', 'PLC Automation', 'Dispenser Controller', 'LPG Service'
  unitPrice: number;
  quantity: number;
  unit?: string; // 'Pcs', 'Set', 'Lot', 'Hours', 'Job'
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  taxId?: string;
  industry?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-1008" or "APS-2026-1008"
  refNumber: string; // e.g. "#SH8893247" or "APS/REF/2026/04"
  client: Client;
  issueDate: string; // "2026-08-20"
  dueDate: string; // "2026-08-27"
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 8%
  taxAmount: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: InvoiceStatus;
  notes?: string;
  terms?: string;
  paymentMethod?: string;
  paidAt?: string;
  createdAt: string;
  currency: 'BDT' | 'USD';
}

export interface CompanyProfile {
  name: string;
  subtitle: string;
  tagline: string;
  officeAddress: string;
  phones: string[];
  email: string;
  altEmail: string;
  website?: string;
  productsAndServices: string[];
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branch: string;
    routingNumber?: string;
  };
}

export interface ProductCatalogItem {
  id: string;
  code: string;
  name: string;
  category: string;
  defaultPrice: number;
  unit: string;
  description?: string;
}
