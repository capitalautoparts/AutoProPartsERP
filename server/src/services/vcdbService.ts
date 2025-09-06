import fs from 'fs';
import path from 'path';

interface VCdbData {
  baseVehicles: Map<number, BaseVehicle>;
  makes: Map<number, string>;
  models: Map<number, string>;
  years: Map<number, number>;
  subModels: Map<number, string>;
  engines: Map<number, string>;
  equipment: Map<number, Equipment>;
}

interface BaseVehicle {
  id: number;
  yearId: number;
  makeId: number;
  modelId: number;
}

interface Equipment {
  id: number;
  mfrId: number;
  equipmentModelId: number;
  vehicleTypeId: number;
}

class VCdbService {
  private data: VCdbData = {
    baseVehicles: new Map(),
    makes: new Map(),
    models: new Map(),
    years: new Map(),
    subModels: new Map(),
    engines: new Map(),
    equipment: new Map()
  };

  constructor() {
    this.loadVCdbData();
  }

  private loadVCdbData() {
    const vcdbPath = path.join(process.cwd(), '..', 'extracted_databases', 'VCdb', 'vcdb_ascii');
    console.log('🔍 VCdb path:', vcdbPath);
    
    try {
      // Load Makes first
      const makePath = path.join(vcdbPath, '20231026_Make.txt');
      console.log('🔍 Make file path:', makePath);
      console.log('🔍 Make file exists:', fs.existsSync(makePath));
      
      const makeData = fs.readFileSync(makePath, 'utf-8');
      this.parseMakes(makeData);

      console.log(`✅ VCdb loaded: ${this.data.makes.size} makes`);
    } catch (error) {
      console.error('❌ VCdb loading error:', error);
      console.warn('⚠️ VCdb files not found, using fallback data');
    }
  }

  private parseBaseVehicles(data: string) {
    const lines = data.split(/\r?\n/).slice(1);
    for (const line of lines) {
      if (!line.trim()) continue;
      const [id, yearId, makeId, modelId] = line.split('|').map(Number);
      if (id && yearId && makeId && modelId) {
        this.data.baseVehicles.set(id, { id, yearId, makeId, modelId });
      }
    }
  }

  private parseMakes(data: string) {
    const lines = data.split(/\r?\n/).slice(1);
    for (const line of lines) {
      if (!line.trim()) continue;
      const [id, name] = line.split('|');
      if (id && name) {
        this.data.makes.set(Number(id), name.trim());
      }
    }
  }

  private parseModels(data: string) {
    const lines = data.split(/\r?\n/).slice(1);
    for (const line of lines) {
      if (!line.trim()) continue;
      const [id, name] = line.split('|');
      if (id && name) {
        this.data.models.set(Number(id), name.trim());
      }
    }
  }

  // Public API methods
  getBaseVehicle(id: number): BaseVehicle | undefined {
    return this.data.baseVehicles.get(id);
  }

  getMakeName(id: number): string | undefined {
    return this.data.makes.get(id);
  }

  getModelName(id: number): string | undefined {
    return this.data.models.get(id);
  }

  resolveVehicleInfo(baseVehicleId: number) {
    const vehicle = this.getBaseVehicle(baseVehicleId);
    if (!vehicle) return null;

    return {
      baseVehicleId,
      year: vehicle.yearId, // In real VCdb, would resolve from Year table
      make: this.getMakeName(vehicle.makeId),
      model: this.getModelName(vehicle.modelId)
    };
  }

  getAllMakes(): Array<{id: number, name: string}> {
    return Array.from(this.data.makes.entries()).map(([id, name]) => ({ id, name }));
  }
}

export const vcdbService = new VCdbService();