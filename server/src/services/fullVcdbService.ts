import fs from 'fs';
import path from 'path';

interface VCdbTables {
  makes: Map<number, string>;
  models: Map<number, string>;
  years: Map<number, number>;
  baseVehicles: Map<number, BaseVehicle>;
  subModels: Map<number, string>;
  engineBases: Map<number, string>;
  engineBlocks: Map<number, string>;
  engineVINs: Map<number, string>;
  driveTypes: Map<number, string>;
  transmissionTypes: Map<number, string>;
  bodyTypes: Map<number, string>;
  fuelTypes: Map<number, string>;
  aspirations: Map<number, string>;
  vehicleTypes: Map<number, string>;
  manufacturers: Map<number, string>;
  equipmentModels: Map<number, string>;
  // Real VCdb tables
  transmissionNumSpeeds: Map<number, string>;
  transmissionControlTypes: Map<number, string>;
  bodyNumDoors: Map<number, string>;
  bedLengths: Map<number, string>;
  bedTypes: Map<number, string>;
  fuelDeliveryTypes: Map<number, string>;
  fuelSystemDesigns: Map<number, string>;
  ignitionSystemTypes: Map<number, string>;
  brakeSystems: Map<number, string>;
  brakeABS: Map<number, string>;
  brakeTypes: Map<number, string>;
  cylinderHeadTypes: Map<number, string>;
  engineDesignations: Map<number, string>;
  engineVersions: Map<number, string>;
  fuelDeliverySubTypes: Map<number, string>;
  fuelSystemControlTypes: Map<number, string>;
  transmissionMfrCodes: Map<number, string>;
  elecControlled: Map<number, string>;
  springTypes: Map<number, string>;
  steeringTypes: Map<number, string>;
  steeringSystems: Map<number, string>;
  wheelbases: Map<number, string>;
  // VCdb component tables
  engineConfigs: Map<number, string>;
  transmissions: Map<number, string>;
  bodyConfigs: Map<number, string>;
  // VCdb relationship tables
  vehicleToEngineBase: Map<number, Set<number>>;
  vehicleToTransmissionType: Map<number, Set<number>>;
  vehicleToBodyType: Map<number, Set<number>>;
  vehicleToFuelType: Map<number, Set<number>>;
  vehicleToSubModel: Map<number, Set<number>>;
}

interface BaseVehicle {
  id: number;
  yearId: number;
  makeId: number;
  modelId: number;
}

class FullVCdbService {
  private tables: VCdbTables = {
    makes: new Map(),
    models: new Map(),
    years: new Map(),
    baseVehicles: new Map(),
    subModels: new Map(),
    engineBases: new Map(),
    engineBlocks: new Map(),
    engineVINs: new Map(),
    driveTypes: new Map(),
    transmissionTypes: new Map(),
    bodyTypes: new Map(),
    fuelTypes: new Map(),
    aspirations: new Map(),
    vehicleTypes: new Map(),
    manufacturers: new Map(),
    equipmentModels: new Map(),
    // Real VCdb tables
    transmissionNumSpeeds: new Map(),
    transmissionControlTypes: new Map(),
    bodyNumDoors: new Map(),
    bedLengths: new Map(),
    bedTypes: new Map(),
    fuelDeliveryTypes: new Map(),
    fuelSystemDesigns: new Map(),
    ignitionSystemTypes: new Map(),
    brakeSystems: new Map(),
    brakeABS: new Map(),
    brakeTypes: new Map(),
    cylinderHeadTypes: new Map(),
    engineDesignations: new Map(),
    engineVersions: new Map(),
    fuelDeliverySubTypes: new Map(),
    fuelSystemControlTypes: new Map(),
    transmissionMfrCodes: new Map(),
    elecControlled: new Map(),
    springTypes: new Map(),
    steeringTypes: new Map(),
    steeringSystems: new Map(),
    wheelbases: new Map(),
    // VCdb component tables
    engineConfigs: new Map(),
    transmissions: new Map(),
    bodyConfigs: new Map(),
    // VCdb relationship tables
    vehicleToEngineBase: new Map(),
    vehicleToTransmissionType: new Map(),
    vehicleToBodyType: new Map(),
    vehicleToFuelType: new Map(),
    vehicleToSubModel: new Map()
  };

  constructor() {
    this.loadAllTables();
  }

  private loadAllTables() {
    const vcdbPath = path.join(process.cwd(), '..', 'extracted_databases', 'VCdb', 'vcdb_ascii');
    
    try {
      // Core vehicle tables
      this.loadTable(vcdbPath, '20231026_Make.txt', this.tables.makes);
      this.loadTable(vcdbPath, '20231026_Model.txt', this.tables.models);
      this.loadTable(vcdbPath, '20231026_SubModel.txt', this.tables.subModels);
      
      // Engine tables
      this.loadTable(vcdbPath, '20231026_EngineBase.txt', this.tables.engineBases);
      this.loadTable(vcdbPath, '20231026_EngineBlock.txt', this.tables.engineBlocks);
      this.loadTable(vcdbPath, '20231026_EngineVIN.txt', this.tables.engineVINs);
      this.loadTable(vcdbPath, '20231026_Aspiration.txt', this.tables.aspirations);
      this.loadTable(vcdbPath, '20231026_FuelType.txt', this.tables.fuelTypes);
      
      // Transmission tables
      this.loadTable(vcdbPath, '20231026_TransmissionType.txt', this.tables.transmissionTypes);
      
      // Body tables
      this.loadTable(vcdbPath, '20231026_BodyType.txt', this.tables.bodyTypes);
      this.loadTable(vcdbPath, '20231026_DriveType.txt', this.tables.driveTypes);
      
      // Equipment tables (ACES 4.2)
      this.loadTable(vcdbPath, '20231026_Mfr.txt', this.tables.manufacturers);
      this.loadTable(vcdbPath, '20231026_EquipmentModel.txt', this.tables.equipmentModels);
      this.loadTable(vcdbPath, '20231026_VehicleType.txt', this.tables.vehicleTypes);
      
      // Real VCdb tables
      this.loadTable(vcdbPath, '20231026_TransmissionNumSpeeds.txt', this.tables.transmissionNumSpeeds);
      this.loadTable(vcdbPath, '20231026_TransmissionControlType.txt', this.tables.transmissionControlTypes);
      this.loadTable(vcdbPath, '20231026_BodyNumDoors.txt', this.tables.bodyNumDoors);
      this.loadTable(vcdbPath, '20231026_BedLength.txt', this.tables.bedLengths);
      this.loadTable(vcdbPath, '20231026_BedType.txt', this.tables.bedTypes);
      this.loadTable(vcdbPath, '20231026_FuelDeliveryType.txt', this.tables.fuelDeliveryTypes);
      this.loadTable(vcdbPath, '20231026_FuelSystemDesign.txt', this.tables.fuelSystemDesigns);
      this.loadTable(vcdbPath, '20231026_IgnitionSystemType.txt', this.tables.ignitionSystemTypes);
      this.loadTable(vcdbPath, '20231026_BrakeSystem.txt', this.tables.brakeSystems);
      this.loadTable(vcdbPath, '20231026_BrakeABS.txt', this.tables.brakeABS);
      this.loadTable(vcdbPath, '20231026_BrakeType.txt', this.tables.brakeTypes);
      this.loadTable(vcdbPath, '20231026_CylinderHeadType.txt', this.tables.cylinderHeadTypes);
      this.loadTable(vcdbPath, '20231026_EngineDesignation.txt', this.tables.engineDesignations);
      this.loadTable(vcdbPath, '20231026_EngineVersion.txt', this.tables.engineVersions);
      this.loadTable(vcdbPath, '20231026_FuelDeliverySubType.txt', this.tables.fuelDeliverySubTypes);
      this.loadTable(vcdbPath, '20231026_FuelSystemControlType.txt', this.tables.fuelSystemControlTypes);
      this.loadTable(vcdbPath, '20231026_TransmissionMfrCode.txt', this.tables.transmissionMfrCodes);
      this.loadTable(vcdbPath, '20231026_ElecControlled.txt', this.tables.elecControlled);
      this.loadTable(vcdbPath, '20231026_SpringType.txt', this.tables.springTypes);
      this.loadTable(vcdbPath, '20231026_SteeringType.txt', this.tables.steeringTypes);
      this.loadTable(vcdbPath, '20231026_SteeringSystem.txt', this.tables.steeringSystems);
      this.loadTable(vcdbPath, '20231026_Wheelbase.txt', this.tables.wheelbases);
      
      // Additional VCdb tables
      this.loadTable(vcdbPath, '20231026_TransmissionNumSpeeds.txt', this.tables.transmissionNumSpeeds);
      this.loadTable(vcdbPath, '20231026_TransmissionControlType.txt', this.tables.transmissionControlTypes);
      this.loadTable(vcdbPath, '20231026_BodyNumDoors.txt', this.tables.bodyNumDoors);
      this.loadTable(vcdbPath, '20231026_BedLength.txt', this.tables.bedLengths);
      this.loadTable(vcdbPath, '20231026_FuelDeliveryType.txt', this.tables.fuelDeliveryTypes);
      this.loadTable(vcdbPath, '20231026_FuelSystemDesign.txt', this.tables.fuelSystemDesigns);
      this.loadTable(vcdbPath, '20231026_IgnitionSystemType.txt', this.tables.ignitionSystemTypes);
      this.loadTable(vcdbPath, '20231026_BrakeSystem.txt', this.tables.brakeSystems);
      this.loadTable(vcdbPath, '20231026_BrakeABS.txt', this.tables.brakeABS);
      this.loadTable(vcdbPath, '20231026_FrontBrakeType.txt', this.tables.frontBrakeTypes);
      this.loadTable(vcdbPath, '20231026_RearBrakeType.txt', this.tables.rearBrakeTypes);
      
      // VCdb component tables - load with proper structure
      this.loadEngineConfigs(vcdbPath);
      this.loadTransmissions(vcdbPath);
      this.loadBodyConfigs(vcdbPath);
      
      // BaseVehicle (special handling)
      this.loadBaseVehicles(vcdbPath);
      
      // Load VCdb relationship tables
      this.loadVehicleRelationships(vcdbPath);
      
      console.log(`✅ Full VCdb loaded: ${this.tables.makes.size} makes, ${this.tables.models.size} models, ${this.tables.baseVehicles.size} vehicles`);
      console.log(`✅ VCdb relationships: ${this.tables.vehicleToEngineBase.size} engine, ${this.tables.vehicleToTransmissionType.size} transmission mappings`);
    } catch (error) {
      console.warn('⚠️ VCdb files not found:', error.message);
    }
  }

  private loadTable(vcdbPath: string, fileName: string, targetMap: Map<number, string>) {
    try {
      const filePath = path.join(vcdbPath, fileName);
      if (!fs.existsSync(filePath)) return;
      
      const data = fs.readFileSync(filePath, 'utf-8');
      const lines = data.split(/\r?\n/).slice(1); // Skip header
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const [id, name] = line.split('|');
        if (id && name) {
          targetMap.set(Number(id), name.trim());
        }
      }
    } catch (error) {
      console.warn(`Failed to load ${fileName}:`, error.message);
    }
  }

  private loadBaseVehicles(vcdbPath: string) {
    try {
      const data = fs.readFileSync(path.join(vcdbPath, '20231026_BaseVehicle.txt'), 'utf-8');
      const lines = data.split(/\r?\n/).slice(1);
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const [id, yearId, makeId, modelId] = line.split('|').map(Number);
        if (id && yearId && makeId && modelId) {
          this.tables.baseVehicles.set(id, { id, yearId, makeId, modelId });
        }
      }
    } catch (error) {
      console.warn('Failed to load BaseVehicles:', error.message);
    }
  }

  private loadVehicleRelationships(vcdbPath: string) {
    // Load actual VCdb relationship files
    this.loadEngineRelationships(vcdbPath);
    this.loadTransmissionRelationships(vcdbPath);
    this.loadBodyRelationships(vcdbPath);
    this.loadFuelRelationships(vcdbPath);
    this.loadSubModelRelationships(vcdbPath);
  }

  private loadEngineRelationships(vcdbPath: string) {
    try {
      // Load Vehicle table to map BaseVehicle to Vehicle IDs
      const vehicleData = fs.readFileSync(path.join(vcdbPath, '20231026_Vehicle.txt'), 'utf-8');
      const vehicleLines = vehicleData.split(/\r?\n/).slice(1);
      const baseVehicleToVehicle = new Map<number, number[]>();
      
      for (const line of vehicleLines) {
        if (!line.trim()) continue;
        const [vehicleId, baseVehicleId] = line.split('|').map(Number);
        if (vehicleId && baseVehicleId) {
          if (!baseVehicleToVehicle.has(baseVehicleId)) {
            baseVehicleToVehicle.set(baseVehicleId, []);
          }
          baseVehicleToVehicle.get(baseVehicleId)!.push(vehicleId);
        }
      }
      
      // Load engine relationships
      const engineData = fs.readFileSync(path.join(vcdbPath, '20231026_VehicleToEngineConfig.txt'), 'utf-8');
      const engineLines = engineData.split(/\r?\n/).slice(1);
      
      for (const line of engineLines) {
        if (!line.trim()) continue;
        const [, vehicleId, engineConfigId] = line.split('|').map(Number);
        if (vehicleId && engineConfigId) {
          // Find BaseVehicle for this Vehicle
          for (const [baseVehicleId, vehicleIds] of baseVehicleToVehicle) {
            if (vehicleIds.includes(vehicleId)) {
              if (!this.tables.vehicleToEngineBase.has(baseVehicleId)) {
                this.tables.vehicleToEngineBase.set(baseVehicleId, new Set());
              }
              this.tables.vehicleToEngineBase.get(baseVehicleId)!.add(engineConfigId);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load engine relationships:', error.message);
    }
  }

  private loadTransmissionRelationships(vcdbPath: string) {
    try {
      // Load Vehicle table to map BaseVehicle to Vehicle IDs
      const vehicleData = fs.readFileSync(path.join(vcdbPath, '20231026_Vehicle.txt'), 'utf-8');
      const vehicleLines = vehicleData.split(/\r?\n/).slice(1);
      const baseVehicleToVehicle = new Map<number, number[]>();
      
      for (const line of vehicleLines) {
        if (!line.trim()) continue;
        const [vehicleId, baseVehicleId] = line.split('|').map(Number);
        if (vehicleId && baseVehicleId) {
          if (!baseVehicleToVehicle.has(baseVehicleId)) {
            baseVehicleToVehicle.set(baseVehicleId, []);
          }
          baseVehicleToVehicle.get(baseVehicleId)!.push(vehicleId);
        }
      }
      
      // Load transmission relationships
      const transmissionData = fs.readFileSync(path.join(vcdbPath, '20231026_VehicleToTransmission.txt'), 'utf-8');
      const transmissionLines = transmissionData.split(/\r?\n/).slice(1);
      
      for (const line of transmissionLines) {
        if (!line.trim()) continue;
        const [, vehicleId, transmissionId] = line.split('|').map(Number);
        if (vehicleId && transmissionId) {
          // Find BaseVehicle for this Vehicle
          for (const [baseVehicleId, vehicleIds] of baseVehicleToVehicle) {
            if (vehicleIds.includes(vehicleId)) {
              if (!this.tables.vehicleToTransmissionType.has(baseVehicleId)) {
                this.tables.vehicleToTransmissionType.set(baseVehicleId, new Set());
              }
              this.tables.vehicleToTransmissionType.get(baseVehicleId)!.add(transmissionId);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load transmission relationships:', error.message);
    }
  }

  private loadBodyRelationships(vcdbPath: string) {
    try {
      const data = fs.readFileSync(path.join(vcdbPath, '20231026_VehicleToBodyConfig.txt'), 'utf-8');
      const lines = data.split(/\r?\n/).slice(1);
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const [, vehicleId, bodyConfigId] = line.split('|').map(Number);
        if (vehicleId && bodyConfigId) {
          if (!this.tables.vehicleToBodyType.has(vehicleId)) {
            this.tables.vehicleToBodyType.set(vehicleId, new Set());
          }
          this.tables.vehicleToBodyType.get(vehicleId)!.add(bodyConfigId);
        }
      }
    } catch (error) {
      console.warn('Failed to load body relationships:', error.message);
    }
  }

  private loadFuelRelationships(vcdbPath: string) {
    // VCdb doesn't have direct VehicleToFuelType - fuel is part of engine config
    // Will be handled through engine relationships
  }

  private loadSubModelRelationships(vcdbPath: string) {
    // SubModel relationships are typically in Vehicle table, not separate mapping
    // Will implement if needed
  }

  private loadEngineConfigs(vcdbPath: string) {
    try {
      // Load EngineBase data first to create descriptive names
      const engineBaseData = fs.readFileSync(path.join(vcdbPath, '20231026_EngineBase.txt'), 'utf-8');
      const engineBaseLines = engineBaseData.split(/\r?\n/).slice(1);
      const engineBaseMap = new Map<number, string>();
      
      for (const line of engineBaseLines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        const [id, liter, , cid, cylinders, blockType] = parts;
        if (id && liter && cylinders && blockType) {
          const name = `${liter}L ${blockType}${cylinders}${cid ? ` (${cid} CID)` : ''}`;
          engineBaseMap.set(Number(id), name);
        }
      }
      
      // Load EngineConfig and map to descriptive names
      const data = fs.readFileSync(path.join(vcdbPath, '20231026_EngineConfig.txt'), 'utf-8');
      const lines = data.split(/\r?\n/).slice(1);
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        const [id, , , , engineBaseId] = parts.map(Number);
        if (id && engineBaseId) {
          const engineName = engineBaseMap.get(engineBaseId) || `Engine ${engineBaseId}`;
          this.tables.engineConfigs.set(id, engineName);
        }
      }
    } catch (error) {
      console.warn('Failed to load engine configs:', error.message);
    }
  }

  private loadTransmissions(vcdbPath: string) {
    try {
      // Load TransmissionBase and related tables for descriptive names
      const transmissionBaseData = fs.readFileSync(path.join(vcdbPath, '20231026_TransmissionBase.txt'), 'utf-8');
      const transmissionBaseLines = transmissionBaseData.split(/\r?\n/).slice(1);
      const transmissionBaseMap = new Map<number, string>();
      
      for (const line of transmissionBaseLines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        const [id, typeId, speedsId, controlId] = parts.map(Number);
        if (id && typeId && speedsId) {
          const typeName = this.tables.transmissionTypes.get(typeId) || 'Unknown';
          const name = `${typeName} (Base ${id})`;
          transmissionBaseMap.set(id, name);
        }
      }
      
      // Load Transmission and map to descriptive names
      const data = fs.readFileSync(path.join(vcdbPath, '20231026_Transmission.txt'), 'utf-8');
      const lines = data.split(/\r?\n/).slice(1);
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        const [id, transmissionBaseId] = parts.map(Number);
        if (id && transmissionBaseId) {
          const transmissionName = transmissionBaseMap.get(transmissionBaseId) || `Transmission ${transmissionBaseId}`;
          this.tables.transmissions.set(id, transmissionName);
        }
      }
    } catch (error) {
      console.warn('Failed to load transmissions:', error.message);
    }
  }

  private loadBodyConfigs(vcdbPath: string) {
    try {
      const data = fs.readFileSync(path.join(vcdbPath, '20231026_BodyStyleConfig.txt'), 'utf-8');
      const lines = data.split(/\r?\n/).slice(1);
      
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split('|');
        const [id, bodyTypeId] = parts.map(Number);
        if (id && bodyTypeId) {
          const bodyTypeName = this.tables.bodyTypes.get(bodyTypeId) || 'Unknown Body';
          this.tables.bodyConfigs.set(id, bodyTypeName);
        }
      }
    } catch (error) {
      console.warn('Failed to load body configs:', error.message);
    }
  }

  // Debug method for specific BaseVehicle
  getDebugDataForBaseVehicle(baseVehicleId: number) {
    const vehicle = this.getBaseVehicle(baseVehicleId);
    if (!vehicle) return null;
    
    return {
      baseVehicle: {
        id: baseVehicleId,
        year: vehicle.yearId,
        make: this.getMakeName(vehicle.makeId),
        model: this.getModelName(vehicle.modelId)
      },
      engines: this.getEnginesForBaseVehicle(baseVehicleId),
      transmissions: this.getTransmissionsForBaseVehicle(baseVehicleId),
      bodyTypes: this.getBodyTypesForBaseVehicle(baseVehicleId),
      fuelTypes: this.getFuelTypesForBaseVehicle(baseVehicleId),
      subModels: this.getSubModelsForBaseVehicle(baseVehicleId),
      relationshipCounts: {
        engines: this.tables.vehicleToEngineBase.get(baseVehicleId)?.size || 0,
        transmissions: this.tables.vehicleToTransmissionType.get(baseVehicleId)?.size || 0,
        bodyTypes: this.tables.vehicleToBodyType.get(baseVehicleId)?.size || 0
      }
    };
  }

  // Public API methods
  getAllMakes() { return Array.from(this.tables.makes.entries()).map(([id, name]) => ({ id, name })); }
  getAllModels() { return Array.from(this.tables.models.entries()).map(([id, name]) => ({ id, name })); }
  getAllSubModels() { return Array.from(this.tables.subModels.entries()).map(([id, name]) => ({ id, name })); }
  getAllEngineBases() { return Array.from(this.tables.engineBases.entries()).map(([id, name]) => ({ id, name })); }
  getAllEngineBlocks() { return Array.from(this.tables.engineBlocks.entries()).map(([id, name]) => ({ id, name })); }
  getAllEngineVINs() { return Array.from(this.tables.engineVINs.entries()).map(([id, name]) => ({ id, name })); }
  getAllDriveTypes() { return Array.from(this.tables.driveTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllTransmissionTypes() { return Array.from(this.tables.transmissionTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllBodyTypes() { return Array.from(this.tables.bodyTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelTypes() { return Array.from(this.tables.fuelTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllAspirations() { return Array.from(this.tables.aspirations.entries()).map(([id, name]) => ({ id, name })); }
  getAllVehicleTypes() { return Array.from(this.tables.vehicleTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllManufacturers() { return Array.from(this.tables.manufacturers.entries()).map(([id, name]) => ({ id, name })); }
  getAllEquipmentModels() { return Array.from(this.tables.equipmentModels.entries()).map(([id, name]) => ({ id, name })); }
  
  // Real VCdb data methods
  getAllTransmissionNumSpeeds() { return Array.from(this.tables.transmissionNumSpeeds.entries()).map(([id, name]) => ({ id, name })); }
  getAllTransmissionControlTypes() { return Array.from(this.tables.transmissionControlTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllBodyNumDoors() { return Array.from(this.tables.bodyNumDoors.entries()).map(([id, name]) => ({ id, name })); }
  getAllBedLengths() { return Array.from(this.tables.bedLengths.entries()).map(([id, name]) => ({ id, name })); }
  getAllBedTypes() { return Array.from(this.tables.bedTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelDeliveryTypes() { return Array.from(this.tables.fuelDeliveryTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelSystemDesigns() { return Array.from(this.tables.fuelSystemDesigns.entries()).map(([id, name]) => ({ id, name })); }
  getAllIgnitionSystemTypes() { return Array.from(this.tables.ignitionSystemTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllBrakeSystems() { return Array.from(this.tables.brakeSystems.entries()).map(([id, name]) => ({ id, name })); }
  getAllBrakeABS() { return Array.from(this.tables.brakeABS.entries()).map(([id, name]) => ({ id, name })); }
  getAllBrakeTypes() { return Array.from(this.tables.brakeTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllCylinderHeadTypes() { return Array.from(this.tables.cylinderHeadTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllEngineDesignations() { return Array.from(this.tables.engineDesignations.entries()).map(([id, name]) => ({ id, name })); }
  getAllEngineVersions() { return Array.from(this.tables.engineVersions.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelDeliverySubTypes() { return Array.from(this.tables.fuelDeliverySubTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelSystemControlTypes() { return Array.from(this.tables.fuelSystemControlTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllTransmissionMfrCodes() { return Array.from(this.tables.transmissionMfrCodes.entries()).map(([id, name]) => ({ id, name })); }
  getAllElecControlled() { return Array.from(this.tables.elecControlled.entries()).map(([id, name]) => ({ id, name })); }
  getAllSpringTypes() { return Array.from(this.tables.springTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllSteeringTypes() { return Array.from(this.tables.steeringTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllSteeringSystems() { return Array.from(this.tables.steeringSystems.entries()).map(([id, name]) => ({ id, name })); }
  getAllWheelbases() { return Array.from(this.tables.wheelbases.entries()).map(([id, name]) => ({ id, name })); }
  
  // Additional VCdb data methods
  getAllTransmissionNumSpeeds() { return Array.from(this.tables.transmissionNumSpeeds.entries()).map(([id, name]) => ({ id, name })); }
  getAllTransmissionControlTypes() { return Array.from(this.tables.transmissionControlTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllBodyNumDoors() { return Array.from(this.tables.bodyNumDoors.entries()).map(([id, name]) => ({ id, name })); }
  getAllBedLengths() { return Array.from(this.tables.bedLengths.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelDeliveryTypes() { return Array.from(this.tables.fuelDeliveryTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllFuelSystemDesigns() { return Array.from(this.tables.fuelSystemDesigns.entries()).map(([id, name]) => ({ id, name })); }
  getAllIgnitionSystemTypes() { return Array.from(this.tables.ignitionSystemTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllBrakeSystems() { return Array.from(this.tables.brakeSystems.entries()).map(([id, name]) => ({ id, name })); }
  getAllBrakeABS() { return Array.from(this.tables.brakeABS.entries()).map(([id, name]) => ({ id, name })); }
  getAllFrontBrakeTypes() { return Array.from(this.tables.frontBrakeTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllRearBrakeTypes() { return Array.from(this.tables.rearBrakeTypes.entries()).map(([id, name]) => ({ id, name })); }

  // Lookup methods
  getMakeName(id: number) { return this.tables.makes.get(id); }
  getModelName(id: number) { return this.tables.models.get(id); }
  getBaseVehicle(id: number) { return this.tables.baseVehicles.get(id); }

  // BaseVehicle-filtered data methods using actual VCdb relationships
  getEnginesForBaseVehicle(baseVehicleId: number) {
    const engineConfigIds = this.tables.vehicleToEngineBase.get(baseVehicleId);
    if (!engineConfigIds || engineConfigIds.size === 0) {
      return [];
    }
    
    return Array.from(engineConfigIds)
      .map(id => ({ id, name: this.tables.engineConfigs.get(id) || `Engine Config ${id}` }))
      .filter(engine => engine.name !== `Engine Config ${engine.id}`);
  }

  getTransmissionsForBaseVehicle(baseVehicleId: number) {
    const transmissionIds = this.tables.vehicleToTransmissionType.get(baseVehicleId);
    if (!transmissionIds || transmissionIds.size === 0) {
      return [];
    }
    
    return Array.from(transmissionIds)
      .map(id => ({ id, name: this.tables.transmissions.get(id) || `Transmission ${id}` }))
      .filter(transmission => transmission.name !== `Transmission ${transmission.id}`);
  }

  getBodyTypesForBaseVehicle(baseVehicleId: number) {
    const bodyConfigIds = this.tables.vehicleToBodyType.get(baseVehicleId);
    if (!bodyConfigIds || bodyConfigIds.size === 0) {
      return [];
    }
    
    return Array.from(bodyConfigIds)
      .map(id => ({ id, name: this.tables.bodyConfigs.get(id) || `Body Config ${id}` }))
      .filter(bodyType => bodyType.name !== `Body Config ${bodyType.id}`);
  }

  getFuelTypesForBaseVehicle(baseVehicleId: number) {
    // Fuel types are derived from engine configurations
    const engineConfigIds = this.tables.vehicleToEngineBase.get(baseVehicleId);
    if (!engineConfigIds || engineConfigIds.size === 0) return [];
    
    // Return common fuel types for now
    return [
      { id: 1, name: 'Gasoline' },
      { id: 2, name: 'Diesel' }
    ];
  }

  getSubModelsForBaseVehicle(baseVehicleId: number) {
    // SubModels need to be loaded from Vehicle table or separate relationship
    return [];
  }
  
  resolveVehicleInfo(baseVehicleId: number) {
    const vehicle = this.getBaseVehicle(baseVehicleId);
    if (!vehicle) return null;
    
    return {
      baseVehicleId,
      year: vehicle.yearId,
      make: this.getMakeName(vehicle.makeId),
      model: this.getModelName(vehicle.modelId)
    };
  }

  findBaseVehiclesByYearMakeModel(year?: number, makeId?: number, modelId?: number) {
    const results = [];
    for (const [id, vehicle] of this.tables.baseVehicles) {
      let matches = true;
      if (year && vehicle.yearId !== year) matches = false;
      if (makeId && vehicle.makeId !== makeId) matches = false;
      if (modelId && vehicle.modelId !== modelId) matches = false;
      
      if (matches) {
        results.push({
          id,
          year: vehicle.yearId,
          make: this.getMakeName(vehicle.makeId),
          model: this.getModelName(vehicle.modelId)
        });
      }
    }
    return results;
  }

  getAvailableYears(makeId?: number, modelId?: number): number[] {
    // Fallback to static years if no BaseVehicle data
    if (this.tables.baseVehicles.size === 0) {
      const currentYear = new Date().getFullYear();
      const years = [];
      for (let year = 1980; year <= currentYear + 2; year++) {
        years.push(year);
      }
      return years;
    }
    
    const years = new Set<number>();
    for (const [, vehicle] of this.tables.baseVehicles) {
      let matches = true;
      if (makeId && vehicle.makeId !== makeId) matches = false;
      if (modelId && vehicle.modelId !== modelId) matches = false;
      if (matches) years.add(vehicle.yearId);
    }
    return Array.from(years).sort();
  }

  getAvailableMakes(year?: number, modelId?: number): Array<{id: number, name: string}> {
    // Fallback to all makes if no BaseVehicle data
    if (this.tables.baseVehicles.size === 0) {
      return this.getAllMakes().slice(0, 20);
    }
    
    const makeIds = new Set<number>();
    for (const [, vehicle] of this.tables.baseVehicles) {
      let matches = true;
      if (year && vehicle.yearId !== year) matches = false;
      if (modelId && vehicle.modelId !== modelId) matches = false;
      if (matches) makeIds.add(vehicle.makeId);
    }
    return Array.from(makeIds).map(id => ({ id, name: this.getMakeName(id) || 'Unknown' }));
  }

  getAvailableModels(year?: number, makeId?: number): Array<{id: number, name: string}> {
    // Fallback to all models if no BaseVehicle data
    if (this.tables.baseVehicles.size === 0) {
      return this.getAllModels().slice(0, 50);
    }
    
    const modelIds = new Set<number>();
    for (const [, vehicle] of this.tables.baseVehicles) {
      let matches = true;
      if (year && vehicle.yearId !== year) matches = false;
      if (makeId && vehicle.makeId !== makeId) matches = false;
      if (matches) modelIds.add(vehicle.modelId);
    }
    return Array.from(modelIds).map(id => ({ id, name: this.getModelName(id) || 'Unknown' }));
  }
}

export const fullVcdbService = new FullVCdbService();