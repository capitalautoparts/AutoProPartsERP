import { databaseExtractor } from './databaseExtractor.js';

export class PAdbService {
  private attributes: any[] = [];
  private initialized = false;

  async getAttributes(): Promise<any[]> {
    if (!this.initialized) {
      await this.initializeData();
    }
    return this.attributes;
  }

  private async initializeData() {
    try {
      const records = await databaseExtractor.extractPAdbData();
      console.log(`🔧 PAdb: Found ${records.length} records`);
      
      // Sample attributes based on automotive standards
      this.attributes = [
        { id: 'MATERIAL', name: 'Material', uom: null },
        { id: 'LENGTH', name: 'Length', uom: 'IN' },
        { id: 'WIDTH', name: 'Width', uom: 'IN' },
        { id: 'HEIGHT', name: 'Height', uom: 'IN' },
        { id: 'WEIGHT', name: 'Weight', uom: 'LB' },
        { id: 'COLOR', name: 'Color', uom: null }
      ];

      console.log(`🔧 PAdb: Loaded ${this.attributes.length} attributes`);
    } catch (error) {
      console.error('Error loading PAdb:', error);
    }
    
    this.initialized = true;
  }
}

export const padbService = new PAdbService();