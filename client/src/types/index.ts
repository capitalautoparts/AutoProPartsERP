// Product Profile Types
export interface Product {
  id: string; // Primary ID (could be UUID or Internal ID)
  internalProductId?: string; // Internal ID (BrandID_PartNo)
  uniqueId: string; // Unique identifier
  brandId?: string; // Brand identifier component
  manufacturer: string;
  brand: string;
  partNumber: string; // Clean part number (no special chars)
  sku: string;
  productName: string;
  shortDescription: string;
  longDescription: string;
  stock: number;
  unitType: string;
  qtyOnHand: number;
  createdAt: string;
  updatedAt: string;
  // ACES/PIES related data
  acesApplications?: ACESApplication[];
  aces42Applications?: ACES42ApplicationInternal[];
  piesItem?: PIESItem;
  piesDescriptions?: PIESDescription[];
  piesPrices?: PIESPrice[];
  piesExpi?: PIESExpi[];
  piesAttributes?: PIESAttribute[];
  piesPackages?: PIESPackage[];
  piesKits?: PIESKit[];
  piesInterchange?: PIESInterchange[];
  piesAssets?: PIESAsset[];
  piesAssortments?: PIESAssortment[];
  piesMarketCopy?: PIESMarketCopy[];
}

// ACES 4.1 Types (Legacy)
export interface ACESApplication {
  id: string;
  productId: string;
  baseVehicleId?: number;
  subModelId?: number;
  yearId?: number;
  makeId?: number;
  modelId?: number;
  // Engine attributes
  engineBaseId?: number;
  engineBlockId?: number;
  engineVINId?: number;
  aspirationId?: number;
  // Transmission attributes
  transmissionTypeId?: number;
  driveTypeId?: number;
  numSpeeds?: number;
  controlType?: string;
  // Body attributes
  bodyTypeId?: number;
  numDoors?: number;
  bedLength?: string;
  wheelbase?: string;
  // Fuel attributes
  fuelTypeId?: number;
  fuelDeliveryType?: string;
  fuelSystemDesign?: string;
  ignitionSystem?: string;
  // Brake attributes
  brakeSystem?: string;
  abs?: string;
  frontBrakeType?: string;
  rearBrakeType?: string;
  // Equipment attributes (ACES 4.2)
  manufacturerId?: number;
  equipmentModelId?: number;
  vehicleTypeId?: number;
  productionStart?: number;
  productionEnd?: number;
  // Vehicle attributes (resolved)
  year?: number;
  make?: string;
  model?: string;
  subModel?: string;
  // Application attributes
  positionId?: number;
  quantity?: number;
  partTypeId?: number;
  mfrLabel?: string;
  // Asset attributes (ACES 4.2)
  assetName?: string;
  assetItemOrder?: number;
  validateApplication?: boolean;
  // Qualifiers
  qualifiers?: ACESQualifier[];
  notes?: string[];
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface ACESQualifier {
  id: string;
  applicationId: string;
  qualifierType: string;
  qualifierValue: string;
}

// PIES 7.2 Types
export interface PIESItem {
  id: string;
  productId: string;
  // Core identifiers
  mfgCode?: string;
  brandId?: string;
  partNo: string;
  hazMatCode?: string;
  baseItemNo?: string;
  gtin?: string;
  gtinQualifier?: string;
  brandLabel?: string;
  subBrandId?: string;
  subBrandLabel?: string;
  vmrsBrandId?: string;
  acesApplication?: boolean;
  // Quantity and packaging
  itemQtySize?: number;
  itemQtyUom?: string;
  containerType?: string;
  qtyPerApp?: number;
  qtyPerAppUom?: string;
  qtyPerAppQualifier?: string;
  // Dates and ordering
  effectiveDate?: string;
  availableDate?: string;
  minOrder?: number;
  minOrderUom?: string;
  // Classification
  groupCode?: string;
  subGroupCode?: string;
  unspsc?: string;
  partType?: string;
  categoryCode?: string;
  vmrsCode?: string;
}

export interface PIESDescription {
  id: string;
  productId: string;
  descriptionCode: string; // DES, LAB, MKT, FAB, etc.
  description: string;
  languageCode?: string;
  sequence?: number;
}

export interface PIESPrice {
  id: string;
  productId: string;
  priceType: string; // LIST, MSRP, COST, JOBBER, etc.
  price: number;
  priceUom?: string;
  currency: string;
  effectiveDate?: string;
  expirationDate?: string;
  priceBreak?: number;
  priceMultiplier?: number;
}

export interface PIESExpi {
  id: string;
  productId: string;
  expiCode: string;
  expiValue: string;
  languageCode?: string;
  uom?: string;
}

export interface PIESAttribute {
  id: string;
  productId: string;
  attributeId: string;
  attributeValue: string;
  attributeUom?: string;
  attributeUomId?: string;
}

export interface PIESPackage {
  id: string;
  productId: string;
  packageUom: string;
  packageQuantity: number;
  packageLevel?: string;
  // Dimensions
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageWeight?: number;
  dimensionUom?: string;
  weightUom?: string;
  // Additional package info
  packageType?: string;
  packageDescription?: string;
}

export interface PIESKit {
  id: string;
  productId: string;
  kitMasterPartNo: string;
  kitComponentPartNo: string;
  kitComponentQuantity: number;
  kitComponentUom?: string;
}

export interface PIESInterchange {
  id: string;
  productId: string;
  interchangeType: string; // OE, OES, UP, etc.
  brandAaiaId?: string;
  brandLabel?: string;
  partNo: string;
  interchangeNotes?: string;
  internalNotes?: string;
}

export interface PIESAsset {
  id: string;
  productId: string;
  assetId: string;
  assetType: string; // P04, P01, P02, P08, etc.
  representation: string; // A, R, etc.
  resolution?: string;
  colorMode?: string;
  background?: string;
  orientationView?: string;
  assetHeight?: number;
  assetWidth?: number;
  uri: string;
  assetDescription?: string;
  fileName?: string;
  fileSize?: number;
  fileDateModified?: string;
  country?: string;
  languageCode?: string;
}

export interface PIESAssortment {
  id: string;
  productId: string;
  assortmentId: string;
  assortmentDescription?: string;
  assortmentPartNo?: string;
  assortmentQuantity?: number;
}

export interface PIESMarketCopy {
  id: string;
  productId: string;
  marketCopyCode: string; // FEAT, BENE, TECH, INST, etc.
  marketCopyText: string;
  languageCode?: string;
  sequence?: number;
}

// ERP Module Types
export interface Address {
  street1: string;
  street2?: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

export interface ShippingAddress extends Address {
  id: string;
  name: string; // Address nickname
  isDefault: boolean;
  deliveryNotes?: string;
  specialInstructions?: string;
  contactName?: string;
  contactPhone?: string;
}

export interface ContactInfo {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
  isPrimary: boolean;
  department?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  accountNumber?: string;

  // Basic Information
  companyName?: string;
  contactName?: string;
  customerType?: 'B2C' | 'B2B';
  businessType?: 'auto_repair' | 'body_shop' | 'dealership' | 'fleet' | 'retail' | 'wholesale' | 'individual';

  // Contact Information
  primaryContact?: ContactInfo;
  additionalContacts?: ContactInfo[];

  // Address Information
  billingAddress?: Address;
  shippingAddresses?: ShippingAddress[];

  // Business Settings
  defaultWarehouse?: string;
  territory?: string;
  salesRep?: string;

  // Tags and Classification
  tags?: string[];
  creditLimit?: number;
  paymentTerms?: string;
  taxExempt?: boolean;

  // Status and Dates
  status?: 'active' | 'inactive' | 'suspended' | 'prospect';
  dateCreated?: string;
  lastOrderDate?: string;

  // Business Intelligence
  totalOrders?: number;
  totalRevenue?: number;
  averageOrderValue?: number;
  lastActivityDate?: string;
  lastUpdated?: string;

  // Backward-compat support for legacy fields
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: 'B2B' | 'B2C';
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

export interface JobResponse {
  jobId: string;
  status: string;
  message: string;
}

export interface ImportJob {
  id: string;
  type: 'excel' | 'xml';
  module: 'products' | 'customers' | 'orders' | 'aces42';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  recordsProcessed?: number;
  totalRecords?: number;
  errors?: string[];
  warnings?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExportJob {
  id: string;
  type: 'excel' | 'xml';
  module: 'products' | 'customers' | 'orders' | 'aces42';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  fileName: string;
  downloadUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ACES 4.2 specific types
export interface ACES42ImportResult {
  success: boolean;
  applicationsProcessed: number;
  assetsProcessed: number;
  digitalAssetsProcessed: number;
  errors: string[];
  warnings: string[];
}
