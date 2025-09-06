import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

export class ReferenceDataService {
  private rootPath: string;
  private referencePath: string;

  constructor() {
    this.rootPath = process.cwd().replace('\\server', '');
    this.referencePath = path.join(this.rootPath, 'Autocarereference');
  }

  async loadAllReferenceDatabases() {
    console.log('🗄️ Loading Autocare Reference Databases...');
    
    // Extract sample databases first
    const { ZipExtractor } = await import('../utils/zipExtractor.js');
    const extractPath = await ZipExtractor.extractSampleDatabases();
    
    const databases = {
      vcdb: await this.loadVCdb(),
      pcdb: await this.loadPCdb(), 
      padb: await this.loadPAdb(),
      qdb: await this.loadQdb(),
      brandTable: await this.loadBrandTable(),
      aces: await this.loadACESDocumentation(),
      pies: await this.loadPIESDocumentation(),
      extractedPath: extractPath
    };

    console.log('✅ Reference databases loaded:', {
      VCdb: databases.vcdb?.length || 0,
      PCdb: databases.pcdb?.length || 0, 
      PAdb: databases.padb?.length || 0,
      Qdb: databases.qdb?.length || 0,
      BrandTable: databases.brandTable?.length || 0,
      ACES: databases.aces ? 'Documentation loaded' : 'Not found',
      PIES: databases.pies ? 'Documentation loaded' : 'Not found',
      ExtractedTo: extractPath
    });

    return databases;
  }

  private async loadVCdb() {
    const vcdbPath = path.join(this.referencePath, 'VCdb_1_0_Documentation');
    return this.loadDatabaseFromPath(vcdbPath, 'VCdb');
  }

  private async loadPCdb() {
    const pcdbPath = path.join(this.referencePath, 'PCdb_1_0_Documentation');
    return this.loadDatabaseFromPath(pcdbPath, 'PCdb');
  }

  private async loadPAdb() {
    const padbPath = path.join(this.referencePath, 'PAdb_4_0_Documentation');
    return this.loadDatabaseFromPath(padbPath, 'PAdb');
  }

  private async loadQdb() {
    const qdbPath = path.join(this.referencePath, 'Qdb_1_0_Documentation');
    return this.loadDatabaseFromPath(qdbPath, 'Qdb');
  }

  private async loadBrandTable() {
    const brandPath = path.join(this.referencePath, 'BrandTable_1_0_Documentation');
    return this.loadDatabaseFromPath(brandPath, 'BrandTable');
  }

  private async loadACESDocumentation() {
    const acesPath = path.join(this.referencePath, 'ACES_4_2_Documentation');
    return this.loadDocumentationFromPath(acesPath, 'ACES');
  }

  private async loadPIESDocumentation() {
    const piesPath = path.join(this.referencePath, 'PIES_7_2_Documentation');
    return this.loadDocumentationFromPath(piesPath, 'PIES');
  }

  private async loadDatabaseFromPath(dbPath: string, dbName: string) {
    try {
      if (!fs.existsSync(dbPath)) {
        console.warn(`${dbName} path not found: ${dbPath}`);
        return null;
      }

      const files = fs.readdirSync(dbPath);
      console.log(`📁 ${dbName} files:`, files);

      // Look for SQL, ZIP, or sample files
      const sqlFiles = files.filter(f => f.endsWith('.sql'));
      const zipFiles = files.filter(f => f.endsWith('.zip'));
      const sampleFiles = files.filter(f => f.toLowerCase().includes('sample'));

      if (zipFiles.length > 0) {
        console.log(`📦 ${dbName} ZIP files found:`, zipFiles);
        // Extract and process ZIP files if needed
        return this.processZipFiles(dbPath, zipFiles, dbName);
      }

      if (sqlFiles.length > 0) {
        console.log(`🗃️ ${dbName} SQL files found:`, sqlFiles);
        return this.processSQLFiles(dbPath, sqlFiles, dbName);
      }

      return { path: dbPath, files, type: 'documentation' };
    } catch (error) {
      console.error(`Error loading ${dbName}:`, error);
      return null;
    }
  }

  private async loadDocumentationFromPath(docPath: string, docName: string) {
    try {
      if (!fs.existsSync(docPath)) {
        console.warn(`${docName} documentation not found: ${docPath}`);
        return null;
      }

      const files = fs.readdirSync(docPath);
      console.log(`📚 ${docName} documentation:`, files);

      const pdfFiles = files.filter(f => f.endsWith('.pdf'));
      const xlsxFiles = files.filter(f => f.endsWith('.xlsx'));
      const xmlFiles = files.filter(f => f.endsWith('.xml'));
      const xsdFiles = files.filter(f => f.endsWith('.xsd'));

      return {
        path: docPath,
        files: {
          pdf: pdfFiles,
          xlsx: xlsxFiles, 
          xml: xmlFiles,
          xsd: xsdFiles
        }
      };
    } catch (error) {
      console.error(`Error loading ${docName} documentation:`, error);
      return null;
    }
  }

  private async processZipFiles(dbPath: string, zipFiles: string[], dbName: string) {
    // For now, just return metadata about ZIP files
    // In production, you'd extract and process the contents
    return zipFiles.map(file => ({
      name: file,
      path: path.join(dbPath, file),
      type: 'zip',
      database: dbName
    }));
  }

  private async processSQLFiles(dbPath: string, sqlFiles: string[], dbName: string) {
    // For now, just return metadata about SQL files
    // In production, you'd parse the SQL schema
    return sqlFiles.map(file => ({
      name: file,
      path: path.join(dbPath, file),
      type: 'sql',
      database: dbName
    }));
  }
}

export const referenceDataService = new ReferenceDataService();