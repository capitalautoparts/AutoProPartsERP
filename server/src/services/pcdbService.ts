import { databaseExtractor } from './databaseExtractor.js';

export class PCdbService {
  private categories: any[] = [];
  private initialized = false;

  async getCategories(): Promise<any[]> {
    if (!this.initialized) {
      await this.initializeData();
    }
    return this.categories;
  }

  private async initializeData() {
    try {
      const records = await databaseExtractor.extractPCdbData();
      const categoryRecords = records.filter(r => r.table === 'Categories');
      
      this.categories = categoryRecords.map(record => ({
        id: record.data[0],
        name: record.data[1]
      }));

      // Add sample categories if none found
      if (this.categories.length === 0) {
        this.categories = [
          { id: 1, name: 'Engine' },
          { id: 2, name: 'Transmission' },
          { id: 3, name: 'Brake' },
          { id: 4, name: 'Suspension' }
        ];
      }

      console.log(`📦 PCdb: Loaded ${this.categories.length} categories`);
    } catch (error) {
      console.error('Error loading PCdb:', error);
    }
    
    this.initialized = true;
  }
}

export const pcdbService = new PCdbService();