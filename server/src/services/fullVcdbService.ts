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
    equipmentModels: new Map()
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
      
      // BaseVehicle (special handling)
      this.loadBaseVehicles(vcdbPath);
      
      console.log(`✅ Full VCdb loaded: ${this.tables.makes.size} makes, ${this.tables.models.size} models, ${this.tables.baseVehicles.size} vehicles`);
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

  // Lookup methods
  getMakeName(id: number) { return this.tables.makes.get(id); }
  getModelName(id: number) { return this.tables.models.get(id); }
  getBaseVehicle(id: number) { return this.tables.baseVehicles.get(id); }

  // BaseVehicle-filtered data methods
  getEnginesForBaseVehicle(baseVehicleId: number) {
    // TODO: Load VCdb Engine relationships - for now return sample filtered data
    const engines = this.getAllEngineBases();
    return engines.slice(0, 5); // Filtered subset
  }

  getTransmissionsForBaseVehicle(baseVehicleId: number) {
    // TODO: Load VCdb Transmission relationships - for now return sample filtered data
    const transmissions = this.getAllTransmissionTypes();
    return transmissions.slice(0, 3); // Filtered subset
  }

  getBodyTypesForBaseVehicle(baseVehicleId: number) {
    // TODO: Load VCdb Body relationships - for now return sample filtered data
    const bodyTypes = this.getAllBodyTypes();
    return bodyTypes.slice(0, 2); // Filtered subset
  }

  getFuelTypesForBaseVehicle(baseVehicleId: number) {
    // TODO: Load VCdb Fuel relationships - for now return sample filtered data
    const fuelTypes = this.getAllFuelTypes();
    return fuelTypes.slice(0, 2); // Filtered subset
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