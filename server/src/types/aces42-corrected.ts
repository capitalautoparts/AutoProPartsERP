// ACES 4.2 Types - Corrected to match AutoCare specification
export interface ACES42Application {
  id: string;
  action: 'A' | 'D';
  validate?: 'no';
  
  // Vehicle identification - BaseVehicle pattern (PREFERRED)
  baseVehicle?: {
    id: number;
    subModel?: { id: number };
    engineBase?: { id: number };
    engineVIN?: { id: number };
    engineBlock?: { id: number };
    aspiration?: { id: number };
  };
  
  // Year/Make/Model pattern (LEGACY)
  years?: { from: number; to: number };
  make?: { id: number };
  model?: { id: number };
  subModel?: { id: number };
  
  // Equipment applications (ACES 4.2 NEW)
  mfr?: { id: number };
  equipmentModel?: { id: number };
  equipmentBase?: { id: number };
  vehicleType?: { id: number };
  productionYears?: {
    productionStart: number;
    productionEnd: number;
  };
  
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
  
  // Asset references (ACES 4.2 NEW)
  assetName?: string;
  assetItemOrder?: number;
}

export interface ACES42Qualifier {
  id: number;
  text?: string;
  param?: { value: string }[];
}

// Valid VCdb field mappings
export interface VCdbMapping {
  // Core vehicle identification
  baseVehicleId: number;
  yearId: number;
  makeId: number;
  modelId: number;
  subModelId?: number;
  
  // Engine specifications
  engineBaseId?: number;
  engineVINId?: number;
  engineBlockId?: number;
  aspirationId?: number;
  
  // Transmission
  transmissionId?: number;
  transmissionBaseId?: number;
  transmissionControlTypeId?: number;
  transmissionNumSpeedsId?: number;
  transmissionTypeId?: number;
  
  // Body/Chassis
  bodyTypeId?: number;
  bodyNumDoorsId?: number;
  bodyStyleConfigId?: number;
  driveTypeId?: number;
  steeringConfigId?: number;
  wheelbaseId?: number;
  
  // Brake system
  brakeConfigId?: number;
  brakeSystemId?: number;
  brakeTypeId?: number;
  brakeABSId?: number;
  
  // Fuel system
  fuelTypeId?: number;
  fuelDeliveryConfigId?: number;
  fuelDeliveryTypeId?: number;
  fuelSystemControlTypeId?: number;
  fuelSystemDesignId?: number;
  
  // Truck specific
  bedConfigId?: number;
  bedLengthId?: number;
  bedTypeId?: number;
  
  // Equipment (ACES 4.2)
  mfrId?: number;
  equipmentModelId?: number;
  equipmentBaseId?: number;
  vehicleTypeId?: number;
}

export interface ACES42ExportOptions {
  brandAAIAID: string;
  subBrandAAIAID?: string;
  submissionType: 'FULL' | 'INCREMENTAL';
  effectiveDate?: string;
  includeAssets?: boolean;
  includeDigitalAssets?: boolean;
}

export interface ACES42ImportResult {
  success: boolean;
  applicationsProcessed: number;
  assetsProcessed: number;
  digitalAssetsProcessed: number;
  errors: string[];
  warnings: string[];
}