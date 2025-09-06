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

      // Add sample brands if none found
      if (this.brands.length === 0) {
        this.brands = [
          { brandId: 'PROBRAND', brandName: 'ProBrand', aaiaId: 'PB001' },
          { brandId: 'CLEANAIR', brandName: 'CleanAir', aaiaId: 'CA001' },
          { brandId: 'AUTOTECH', brandName: 'AutoTech', aaiaId: 'AT001' },
          { brandId: 'PREMIUM', brandName: 'Premium Parts', aaiaId: 'PP001' }
        ];
      }

      console.log(`🏷️ BrandTable: Loaded ${this.brands.length} brands`);
    } catch (error) {
      console.error('Error loading BrandTable:', error);
      // Fallback to sample data
      this.brands = [
        { brandId: 'PROBRAND', brandName: 'ProBrand', aaiaId: 'PB001' },
        { brandId: 'CLEANAIR', brandName: 'CleanAir', aaiaId: 'CA001' }
      ];
    }
    
    this.initialized = true;
  }
}

export const brandTableService = new BrandTableService();