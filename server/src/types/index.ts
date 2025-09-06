// Product Profile Types
export interface Product {
  id: string;
  manufacturer: string;
  brand: string;
  partNumber: string;
  sku: string;
  productName: string;
  shortDescription: string;
  longDescription: string;
  stock: number;
  unitType: string;
  qtyOnHand: number;
  createdAt: string;
  updatedAt: string;
}

// ACES Types
export interface ACESVehicleFitment {
  id: string;
  productId: string;
  year: number;
  make: string;
  model: string;
  engine: string;
  transmission?: string;
  drive?: string;
  steering?: string;
  bodyType?: string;
  bedLength?: string;
  wheelBase?: string;
}

// PIES Types
export interface PIESItem {
  id: string;
  productId: string;
  gtin?: string;
  brandAAIAID: string;
  brandLabel: string;
  unspsc?: string;
  hazmat: boolean;
  partTerminologyID?: string;
  partNumber: string;
}

// ERP Module Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  type: 'B2B' | 'B2C';
  status: 'active' | 'inactive';
}

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  total: number;
  orderDate: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

// Import/Export Types
export interface ImportResult {
  success: boolean;
  recordsProcessed: number;
  errors: string[];
  warnings: string[];
}

export interface ExcelRow {
  [key: string]: any;
}