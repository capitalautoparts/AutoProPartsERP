// Product Profile Types
export interface Product {
  id: string; // BrandID + PartNo (e.g., JVYDAFF120105512035MB)
  uniqueId: string; // Same as id for deduplication
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
  // ACES/PIES related data
  acesApplications?: ACESApplication[];
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

// Unified ACES Application (supports all versions)
export interface ACESApplication {
  id: string;
  productId: string;
  
  // Vehicle identification (BaseVehicle pattern)
  baseVehicleId?: number;
  subModelId?: number;
  
  // Year/Make/Model pattern
  yearId?: number;
  makeId?: number;
  modelId?: number;
  
  // Equipment pattern (ACES 4.2+)
  manufacturerId?: number;
  equipmentModelId?: number;
  equipmentBaseId?: number;
  vehicleTypeId?: number;
  productionStart?: number;
  productionEnd?: number;
  
  // Engine specifications
  engineId?: number;
  engineBaseId?: number;
  engineVINId?: number;
  engineBlockId?: number;
  aspirationId?: number;
  
  // Application details
  quantity: number;
  partTypeId: number;
  positionId?: number;
  
  // Qualifiers and notes
  qualifiers?: ACESQualifier[];
  notes?: string[];
  
  // Asset references (ACES 4.2+)
  assetName?: string;
  assetItemOrder?: number;
  
  // Validation control (ACES 4.2+)
  validateApplication?: boolean;
  
  // Resolved display data (populated from VCdb)
  year?: number;
  make?: string;
  model?: string;
  subModel?: string;
  engine?: string;
  manufacturerName?: string;
  equipmentModelName?: string;
  vehicleTypeName?: string;
  partTypeName?: string;
  positionName?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface ACESQualifier {
  id: string;
  applicationId: string;
  qualifierId: number;
  qualifierText?: string;
  parameters?: string[];
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

// Seed Data Types
export interface PIESSeedData {
  items: PIESItemSeed[];
  descriptions: PIESDescriptionSeed[];
  attributes: PIESAttributeSeed[];
  packages: PIESPackageSeed[];
  assets: PIESAssetSeed[];
  assortments: PIESAssortmentSeed[];
}

export interface PIESItemSeed {
  MfgCode?: string;
  BrandID?: string;
  PartNo: string;
  HazMatCode?: string;
  BaseItemNo?: string;
  GTIN?: string;
  GTINQualifier?: string;
  BrandLabel?: string;
  SubBrandID?: string;
  SubBrandLabel?: string;
  VMRSBrandID?: string;
  ACESApplication?: string;
  ItemQtySize?: string;
  ItemQtyUOM?: string;
  ContainerType?: string;
  QtyPerApp?: string;
  QtyPerAppUOM?: string;
  QtyPerAppQualifier?: string;
  EffectiveDate?: string;
  AvailableDate?: string;
  MinOrder?: string;
  MinOrderUOM?: string;
  GroupCode?: string;
  SubGroupCode?: string;
  UNSPSC?: string;
  PartType?: string;
  CategoryCode?: string;
  VMRSCode?: string;
}

export interface PIESDescriptionSeed {
  PartNo: string;
  DescriptionCode: string;
  Description: string;
  LanguageCode?: string;
}

export interface PIESAttributeSeed {
  PartNo: string;
  AttributeID: string;
  AttributeValue: string;
  AttributeUOM?: string;
}

export interface PIESPackageSeed {
  PartNo: string;
  PackageUOM: string;
  PackageQuantity: string;
  PackageLength?: string;
  PackageWidth?: string;
  PackageHeight?: string;
  PackageWeight?: string;
}

export interface PIESAssetSeed {
  PartNo: string;
  AssetType: string;
  URI: string;
  AssetDescription?: string;
}

export interface PIESAssortmentSeed {
  PartNo: string;
  AssortmentID: string;
  AssortmentDescription?: string;
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

// Seed Processing Types
export interface SeedProcessingResult {
  success: boolean;
  itemsProcessed: number;
  descriptionsProcessed: number;
  attributesProcessed: number;
  packagesProcessed: number;
  assetsProcessed: number;
  assortmentsProcessed: number;
  errors: string[];
  warnings: string[];
}