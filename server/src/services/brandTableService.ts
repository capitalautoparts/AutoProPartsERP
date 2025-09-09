import { databaseExtractor } from './databaseExtractor.js';
import { extractedDatabaseService } from './extractedDatabaseService.js';

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
      // Prefer ASCII parsed by ExtractedDatabaseService when available
      const ascii = extractedDatabaseService.getTable('Brand', 'AutoCare_BrandTable');
      if (ascii) {
        this.brands = (ascii.data || []).map((row: any) => ({
          brandId: row['BrandID'] || row['brandid'] || row['brandId'],
          brandName: row['BrandName'] || row['brandname'] || row['brandName'],
          aaiaId: row['BrandID'] || null
        }));
        console.log(`BrandTable ASCII: Loaded ${this.brands.length} brands`);
      } else {
        // Fallback to ZIP extraction under extracted_databases/BrandTable
        const records = await databaseExtractor.extractBrandTableData();
        const brandRecords = records.filter(r => r.table === 'Brand' || r.table === 'BrandTable');
        this.brands = brandRecords.map(record => ({
          brandId: record.data[0],
          brandName: record.data[1],
          aaiaId: record.data[2] || null
        }));
        console.log(`BrandTable ZIP: Loaded ${this.brands.length} brands`);
      }
    } catch (error: any) {
      console.error('Error loading BrandTable:', error?.message || error);
      this.brands = [];
    }

    this.initialized = true;
  }
}

export const brandTableService = new BrandTableService();

