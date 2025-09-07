import { databaseExtractor } from './databaseExtractor.js';

export class BrandTableService {
  private brands: any[] = [];
  private initialized = false;

  async getBrands(): Promise<any[]> {
    if (!this.initialized) {
      await this.initializeData();
    }
    return this.brands;
  }

  async getBrandById(brandId: string): Promise<any | null> {
    const brands = await this.getBrands();
    return brands.find(b => b.brandId === brandId) || null;
  }

  private async initializeData() {
    try {
      const records = await databaseExtractor.extractBrandTableData();
      console.log(`🏷️ BrandTable: Found ${records.length} records`);
      
      // Look for Brand table records
      const brandRecords = records.filter(r => r.table === 'Brand' || r.table === 'BrandTable');
      
      this.brands = brandRecords.map(record => ({
        brandId: record.data[0],
        brandName: record.data[1],
        aaiaId: record.data[2] || null
      }));

      // Strict mode: do not inject sample brands

      console.log(`🏷️ BrandTable: Loaded ${this.brands.length} brands`);
    } catch (error) {
      console.error('Error loading BrandTable:', error);
      // Strict mode: keep brands empty on error
      this.brands = [];
    }
    
    this.initialized = true;
  }
}

export const brandTableService = new BrandTableService();
