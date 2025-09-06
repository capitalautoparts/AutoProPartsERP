import fs from 'fs';
import path from 'path';

interface QdbTables {
  qualifiers: Map<number, string>;
  qualifierTypes: Map<number, string>;
  qualifierGroups: Map<number, string>;
}

interface BrandTables {
  brands: Map<string, string>; // AAIA ID -> Brand Name
}

class QdbBrandService {
  private qdb: QdbTables = {
    qualifiers: new Map(),
    qualifierTypes: new Map(),
    qualifierGroups: new Map()
  };

  private brands: BrandTables = {
    brands: new Map()
  };

  constructor() {
    this.loadAllTables();
  }

  private loadAllTables() {
    const qdbPath = path.join(process.cwd(), '..', 'extracted_databases', 'Qdb', 'qdb_ascii');
    
    try {
      // Load Qdb tables
      this.loadTable(qdbPath, 'Qualifier.txt', this.qdb.qualifiers);
      this.loadTable(qdbPath, 'QualifierType.txt', this.qdb.qualifierTypes);
      this.loadTable(qdbPath, 'QualifierGroup.txt', this.qdb.qualifierGroups);
      
      // Load Brand data (static for now - BrandTable files are typically separate)
      this.loadBrandData();
      
      console.log(`✅ Qdb/Brand loaded: ${this.qdb.qualifiers.size} qualifiers, ${this.brands.brands.size} brands`);
    } catch (error) {
      console.warn('⚠️ Qdb/Brand files not found:', error.message);
    }
  }

  private loadTable(basePath: string, fileName: string, targetMap: Map<number, string>) {
    try {
      const filePath = path.join(basePath, fileName);
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

  private loadBrandData() {
    // Common automotive brands with AAIA IDs
    const brandData = [
      ['FORD', 'Ford Motor Company'],
      ['CHEV', 'General Motors'],
      ['TOYO', 'Toyota Motor Corporation'],
      ['HOND', 'Honda Motor Company'],
      ['NISS', 'Nissan Motor Company'],
      ['DODG', 'Stellantis (Dodge)'],
      ['CHRY', 'Stellantis (Chrysler)'],
      ['JEEP', 'Stellantis (Jeep)'],
      ['BMW', 'BMW Group'],
      ['MERZ', 'Mercedes-Benz Group'],
      ['AUDI', 'Audi AG'],
      ['VOLK', 'Volkswagen Group'],
      ['HYUN', 'Hyundai Motor Company'],
      ['KIA', 'Kia Corporation'],
      ['MITS', 'Mitsubishi Motors'],
      ['SUBR', 'Subaru Corporation'],
      ['MAZD', 'Mazda Motor Corporation'],
      ['INFI', 'Infiniti'],
      ['LEXS', 'Lexus'],
      ['ACUR', 'Acura'],
      ['CADI', 'Cadillac'],
      ['BUIC', 'Buick'],
      ['GMC', 'GMC'],
      ['LINC', 'Lincoln'],
      ['ZZZZ', 'Generic Brand']
    ];

    for (const [id, name] of brandData) {
      this.brands.brands.set(id, name);
    }
  }

  // Qdb API methods
  getAllQualifiers() { return Array.from(this.qdb.qualifiers.entries()).map(([id, name]) => ({ id, name })); }
  getAllQualifierTypes() { return Array.from(this.qdb.qualifierTypes.entries()).map(([id, name]) => ({ id, name })); }
  getAllQualifierGroups() { return Array.from(this.qdb.qualifierGroups.entries()).map(([id, name]) => ({ id, name })); }

  // Brand API methods
  getAllBrands() { return Array.from(this.brands.brands.entries()).map(([id, name]) => ({ id, name })); }

  // Lookup methods
  getQualifierName(id: number) { return this.qdb.qualifiers.get(id); }
  getBrandName(id: string) { return this.brands.brands.get(id); }
}

export const qdbBrandService = new QdbBrandService();