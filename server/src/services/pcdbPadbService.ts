import fs from 'fs';
import path from 'path';

interface PCdbTables {
  parts: Map<number, string>; // Part Types
  categories: Map<number, string>;
  subcategories: Map<number, string>;
  positions: Map<number, string>;
}

interface PAdbTables {
  partAttributes: Map<number, string>;
  validValues: Map<number, string>;
  measurementGroups: Map<number, string>;
}

class PCdbPAdbService {
  private pcdb: PCdbTables = {
    parts: new Map(),
    categories: new Map(),
    subcategories: new Map(),
    positions: new Map()
  };

  private padb: PAdbTables = {
    partAttributes: new Map(),
    validValues: new Map(),
    measurementGroups: new Map()
  };

  constructor() {
    this.loadAllTables();
  }

  private loadAllTables() {
    const pcdbPath = path.join(process.cwd(), '..', 'extracted_databases', 'PCdb', 'pcdb_ascii');
    const padbPath = path.join(process.cwd(), '..', 'extracted_databases', 'PAdb', 'padb_ascii');
    
    try {
      // Load PCdb tables
      this.loadTable(pcdbPath, 'Parts.txt', this.pcdb.parts);
      this.loadTable(pcdbPath, 'Categories.txt', this.pcdb.categories);
      this.loadTable(pcdbPath, 'Subcategories.txt', this.pcdb.subcategories);
      this.loadTable(pcdbPath, 'Positions.txt', this.pcdb.positions);
      
      // Load PAdb tables
      this.loadTable(padbPath, 'PartAttributes.txt', this.padb.partAttributes);
      this.loadTable(padbPath, 'ValidValues.txt', this.padb.validValues);
      this.loadTable(padbPath, 'MeasurementGroup.txt', this.padb.measurementGroups);
      
      console.log(`✅ PCdb/PAdb loaded: ${this.pcdb.parts.size} parts, ${this.pcdb.positions.size} positions, ${this.padb.partAttributes.size} attributes`);
    } catch (error) {
      console.warn('⚠️ PCdb/PAdb files not found:', error.message);
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

  // PCdb API methods
  getAllPartTypes() { return Array.from(this.pcdb.parts.entries()).map(([id, name]) => ({ id, name })); }
  getAllCategories() { return Array.from(this.pcdb.categories.entries()).map(([id, name]) => ({ id, name })); }
  getAllSubcategories() { return Array.from(this.pcdb.subcategories.entries()).map(([id, name]) => ({ id, name })); }
  getAllPositions() { return Array.from(this.pcdb.positions.entries()).map(([id, name]) => ({ id, name })); }

  // PAdb API methods
  getAllPartAttributes() { return Array.from(this.padb.partAttributes.entries()).map(([id, name]) => ({ id, name })); }
  getAllValidValues() { return Array.from(this.padb.validValues.entries()).map(([id, name]) => ({ id, name })); }
  getAllMeasurementGroups() { return Array.from(this.padb.measurementGroups.entries()).map(([id, name]) => ({ id, name })); }

  // Lookup methods
  getPartTypeName(id: number) { return this.pcdb.parts.get(id); }
  getPositionName(id: number) { return this.pcdb.positions.get(id); }
}

export const pcdbPadbService = new PCdbPAdbService();