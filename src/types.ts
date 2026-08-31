export type InvoiceStatus = 'paid' | 'unpaid' | 'pending' | 'overdue';

export interface InvoiceItem {
  id: string;
  description: string;
  category: string; // e.g. 'CNG Compressor', 'Gas Generator', 'PLC Automation', 'Dispenser Controller', 'LPG Service'
  unitPrice: number;
  quantity: number;
  unit?: string; // 'Pcs', 'Set', 'Lot', 'Hours', 'Job'
  amount: number;
  warrantyPeriod?: string; // e.g. '6 Months', '1 Year', '2 Years', '3 Months', 'None'
  serialNumber?: string; // e.g. 'APS-SN-9921', 'MTR-2026-X1'
  warrantyExpiryDate?: string; // YYYY-MM-DD
}

export type WarrantyStatus = 'active' | 'expiring_soon' | 'expired' | 'claimed';

export interface WarrantyClaim {
  id: string;
  date: string;
  issueReported: string;
  actionTaken: string;
  status: 'in_progress' | 'resolved' | 'replaced';
  technicianName?: string;
}

export interface WarrantyRecord {
  id: string;
  invoiceId?: string;
  invoiceNumber?: string;
  refNumber?: string;
  client: Client;
  productName: string;
  serialNumber?: string;
  category: string;
  startDate: string; // YYYY-MM-DD
  warrantyPeriod: string; // e.g. '6 Months', '1 Year', '2 Years'
  expiryDate: string; // YYYY-MM-DD
  status: WarrantyStatus;
  notes?: string;
  coverageType?: string; // 'Full Replacement', 'Parts & Service', 'Service Only'
  claims?: WarrantyClaim[];
  createdAt: string;
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

export type PaymentMethod =
  | 'Bank Transfer'
  | 'Cheque'
  | 'Cash'
  | 'bKash / Nagad'
  | 'Online / Card';

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // e.g. "REC-2026-001"
  clientId: string;
  client: Client;
  invoiceId?: string;
  invoiceNumber?: string;
  refNumber?: string;
  amount: number;
  paymentDate: string; // "YYYY-MM-DD"
  paymentMethod: PaymentMethod;
  referenceNumber?: string; // Cheque No, Bank TXN ID, bKash TrxID
  bankName?: string;
  receivedBy?: string; // Officer or Engineer
  notes?: string;
  createdAt: string;
}
