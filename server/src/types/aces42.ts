// ACES 4.2 Types - Updated from ACES 4.1
export interface ACES42Document {
  version: '4.2';
  header: ACES42Header;
  applications: ACES42Application[];
  assets?: ACES42Asset[];
  digitalAssets?: ACES42DigitalAsset[];
  footer: ACES42Footer;
}

export interface ACES42Header {
  company: string;
  senderName: string;
  senderPhone: string;
  transferDate: string;
  brandAAIAID: string;
  subBrandAAIAID?: string;
  documentTitle: string;
  effectiveDate: string;
  partsApprovedFor: string[]; // Countries
  regionFor?: number[]; // Region IDs
  submissionType: 'FULL' | 'INCREMENTAL';
  vcdbVersionDate: string;
  qdbVersionDate: string;
  pcdbVersionDate: string;
}

export interface ACES42Application {
  id: string;
  action: 'A' | 'D'; // Add or Delete
  validate?: 'no'; // Optional validation flag
  
  // Vehicle identification (one of these patterns)
  baseVehicle?: {
    id: number;
    subModel?: { id: number };
    engineBase?: { id: number };
    engineVIN?: { id: number };
    engineBlock?: { id: number };
    aspiration?: { id: number };
  };
  
  // Year/Make/Model pattern
  years?: {
    from: number;
    to: number;
  };
  make?: { id: number };
  model?: { id: number };
  subModel?: { id: number };
  
  // Equipment applications (NEW in 4.2)
  manufacturer?: { id: number };
  equipmentModel?: { id: number };
  equipmentBase?: { id: number };
  vehicleType?: { id: number };
  productionYears?: {
    productionStart: number;
    productionEnd: number;
  };
  
  // Engine specifications
  engineBase?: { id: number };
  engineVIN?: { id: number };
  engineBlock?: { id: number };
  aspiration?: { id: number };
  
  // Application details
  quantity: number;
  partType: { id: number };
  position?: { id: number };
  part: {
    partNumber: string;
    brandAAIAID?: string;
    subBrandAAIAID?: string;
  };
  
  // Qualifiers and notes
  qualifiers?: ACES42Qualifier[];
  notes?: string[];
  
  // Asset references (NEW in 4.2)
  assetName?: string;
  assetItemOrder?: number;
}

export interface ACES42Qualifier {
  id: number;
  text?: string;
  parameters?: {
    value: string;
  }[];
}

// NEW in ACES 4.2 - Separate Asset entities
export interface ACES42Asset {
  id: string;
  action: 'A' | 'D';
  
  // Vehicle identification (same patterns as Application)
  baseVehicle?: { id: number };
  years?: { from: number; to: number };
  make?: { id: number };
  model?: { id: number };
  subModel?: { id: number };
  engineBase?: { id: number };
  
  notes?: string[];
  assetName: string;
}

// Enhanced Digital Asset structure in ACES 4.2
export interface ACES42DigitalAsset {
  digitalFileInformation: ACES42DigitalFileInformation[];
}

export interface ACES42DigitalFileInformation {
  assetName: string;
  action: 'A' | 'D';
  languageCode: string;
  fileName: string;
  assetDetailType: string; // BRO, etc.
  fileType: string; // JPG, PNG, PDF, etc.
  representation: string; // A, R, etc.
  fileSize: number;
  resolution: number;
  colorMode: string; // RGB, CMYK, etc.
  background: string; // WHI, BLA, etc.
  orientationView: string; // ANG, etc.
  assetDimensions: {
    uom: string; // PX, IN, etc.
    assetHeight: number;
    assetWidth: number;
  };
  assetDescription: string;
  filePath: string;
  uri: string;
  fileDateModified: string;
  effectiveDate: string;
  expirationDate: string;
  country: string;
}

export interface ACES42Footer {
  recordCount: number;
}

// Updated Application interface for internal use
export interface ACES42ApplicationInternal extends ACES42Application {
  productId: string;
  // Resolved vehicle data
  year?: number;
  make?: string;
  model?: string;
  subModelName?: string;
  engine?: string;
  engineVIN?: string;
  transmission?: string;
  driveType?: string;
  steering?: string;
  bodyType?: string;
  bodyNumDoors?: string;
  bedLength?: string;
  bedType?: string;
  wheelBase?: string;
  // Equipment data (NEW)
  manufacturerName?: string;
  equipmentModelName?: string;
  vehicleTypeName?: string;
  // Application attributes
  positionName?: string;
  partTypeName?: string;
  mfrLabel?: string;
  createdAt: string;
  updatedAt: string;
}

// Export/Import types for ACES 4.2
export interface ACES42ExportOptions {
  includeAssets?: boolean;
  includeDigitalAssets?: boolean;
  brandAAIAID: string;
  subBrandAAIAID?: string;
  submissionType: 'FULL' | 'INCREMENTAL';
  effectiveDate?: string;
}

export interface ACES42ImportResult {
  success: boolean;
  applicationsProcessed: number;
  assetsProcessed: number;
  digitalAssetsProcessed: number;
  errors: string[];
  warnings: string[];
}