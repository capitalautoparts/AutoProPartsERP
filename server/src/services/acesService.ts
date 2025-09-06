import fs from 'fs';
import path from 'path';
import { databaseExtractor } from './databaseExtractor.js';

interface VehicleData {
  year: number;
  make: string;
  model: string;
  subModel?: string;
  engine?: string;
}

export class ACESService {
  private vcdbData: any[] = [];
  private extractedPath: string;
  private initialized = false;

  constructor() {
    this.extractedPath = path.join(process.cwd().replace('\\server', ''), 'extracted_databases');
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;
    
    try {
      console.log('🔍 Extracting VCdb data from ZIP files...');
      const extractedData = await databaseExtractor.extractVehicleData();
      
      if (extractedData.length > 0) {
        console.log(`✅ Loaded ${extractedData.length} VCdb records`);
        this.vcdbData = this.convertToVehicleData(extractedData);
      } else {
        console.log('📝 Using sample vehicle data');
        this.vcdbData = this.generateSampleVehicleData();
      }
    } catch (error) {
      console.error('❌ Error loading VCdb data:', error);
      this.vcdbData = this.generateSampleVehicleData();
    }
    
    this.initialized = true;
  }

  private convertToVehicleData(extractedData: any[]): VehicleData[] {
    const vehicles: VehicleData[] = [];
    
    // Convert BaseVehicle records to VehicleData format
    for (const record of extractedData) {
      if (record.year && record.make && record.model) {
        vehicles.push({
          year: record.year,
          make: record.make,
          model: record.model,
          subModel: undefined,
          engine: undefined
        });
      }
    }
    
    // Add sample data if no extracted data
    if (vehicles.length === 0) {
      vehicles.push(...this.generateSampleVehicleData());
    }
    
    return vehicles;
  }

  private generateSampleVehicleData(): VehicleData[] {
    return [
      { year: 2023, make: 'Toyota', model: 'Camry', subModel: 'LE', engine: '2.5L L4' },
      { year: 2023, make: 'Toyota', model: 'Camry', subModel: 'XLE', engine: '2.5L L4' },
      { year: 2023, make: 'Toyota', model: 'Corolla', subModel: 'L', engine: '2.0L L4' },
      { year: 2022, make: 'Toyota', model: 'Camry', subModel: 'LE', engine: '2.5L L4' },
      { year: 2022, make: 'Honda', model: 'Accord', subModel: 'Sport', engine: '1.5L L4 Turbo' },
      { year: 2022, make: 'Honda', model: 'Civic', subModel: 'LX', engine: '2.0L L4' },
      { year: 2021, make: 'Ford', model: 'F-150', subModel: 'XLT', engine: '3.5L V6' },
      { year: 2021, make: 'Ford', model: 'Mustang', subModel: 'GT', engine: '5.0L V8' },
      { year: 2020, make: 'Chevrolet', model: 'Silverado', subModel: 'LT', engine: '5.3L V8' },
      { year: 2020, make: 'Chevrolet', model: 'Malibu', subModel: 'LS', engine: '1.5L L4' }
    ];
  }

  async getYears(): Promise<number[]> {
    await this.initializeData();
    const years = [...new Set(this.vcdbData.map(v => v.year))];
    return years.sort((a, b) => b - a);
  }

  async getMakesByYear(year: number): Promise<string[]> {
    await this.initializeData();
    const makes = this.vcdbData
      .filter(v => v.year === year)
      .map(v => v.make);
    return [...new Set(makes)].sort();
  }

  async getModelsByYearMake(year: number, make: string): Promise<string[]> {
    await this.initializeData();
    const models = this.vcdbData
      .filter(v => v.year === year && v.make === make)
      .map(v => v.model);
    return [...new Set(models)].sort();
  }

  async getSubModelsByYearMakeModel(year: number, make: string, model: string): Promise<string[]> {
    await this.initializeData();
    const subModels = this.vcdbData
      .filter(v => v.year === year && v.make === make && v.model === model)
      .map(v => v.subModel)
      .filter(Boolean);
    return [...new Set(subModels)].sort();
  }

  async getEnginesByYearMakeModel(year: number, make: string, model: string): Promise<string[]> {
    await this.initializeData();
    const engines = this.vcdbData
      .filter(v => v.year === year && v.make === make && v.model === model)
      .map(v => v.engine)
      .filter(Boolean);
    return [...new Set(engines)].sort();
  }
}

export const acesService = new ACESService();