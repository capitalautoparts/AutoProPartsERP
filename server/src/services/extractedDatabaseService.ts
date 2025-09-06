import fs from 'fs';
import path from 'path';

interface DatabaseTable {
  name: string;
  headers: string[];
  data: Record<string, any>[];
  rowCount: number;
}

interface DatabaseInfo {
  name: string;
  path: string;
  tables: DatabaseTable[];
  totalRows: number;
}

export class ExtractedDatabaseService {
  private extractedPath = 'C:\\Users\\Brian\\Documents\\AutoProPartsERP\\extracted_databases';
  private databases: Map<string, DatabaseInfo> = new Map();

  async loadAllDatabases(): Promise<Map<string, DatabaseInfo>> {
    console.log('🗄️ Loading extracted AutoCare databases...');
    
    const dbPaths = {
      VCdb: path.join(this.extractedPath, 'VCdb', 'vcdb_ascii'),
      PCdb: path.join(this.extractedPath, 'PCdb', 'pcdb_ascii'),
      PAdb: path.join(this.extractedPath, 'PAdb', 'padb_ascii'),
      Qdb: path.join(this.extractedPath, 'Qdb', 'qdb_ascii')
    };

    for (const [dbName, dbPath] of Object.entries(dbPaths)) {
      await this.loadDatabase(dbName, dbPath);
    }

    this.logDatabaseStats();
    return this.databases;
  }

  private async loadDatabase(dbName: string, dbPath: string): Promise<void> {
    if (!fs.existsSync(dbPath)) {
      console.warn(`❌ ${dbName} path not found: ${dbPath}`);
      return;
    }

    const files = fs.readdirSync(dbPath).filter(f => f.endsWith('.txt'));
    const tables: DatabaseTable[] = [];
    let totalRows = 0;

    for (const file of files) {
      const table = await this.parseTextFile(path.join(dbPath, file), file);
      if (table) {
        tables.push(table);
        totalRows += table.rowCount;
      }
    }

    this.databases.set(dbName, {
      name: dbName,
      path: dbPath,
      tables,
      totalRows
    });

    console.log(`✅ ${dbName}: ${tables.length} tables, ${totalRows} total rows`);
  }

  private async parseTextFile(filePath: string, fileName: string): Promise<DatabaseTable | null> {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.trim().split('\n').map(line => line.replace(/\r$/, ''));
      
      if (lines.length < 2) return null;

      const headers = this.parseHeaders(lines[0]);
      const data: Record<string, any>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = this.parseDataRow(lines[i], headers);
        if (row) data.push(row);
      }

      return {
        name: fileName.replace('.txt', ''),
        headers,
        data,
        rowCount: data.length
      };
    } catch (error) {
      console.error(`Error parsing ${fileName}:`, error);
      return null;
    }
  }

  private parseHeaders(headerLine: string): string[] {
    // Handle both pipe (|) and tab (\t) delimited files
    const delimiter = headerLine.includes('|') ? '|' : '\t';
    return headerLine.split(delimiter).map(h => h.trim());
  }

  private parseDataRow(dataLine: string, headers: string[]): Record<string, any> | null {
    try {
      const delimiter = dataLine.includes('|') ? '|' : '\t';
      const values = dataLine.split(delimiter);
      
      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || null;
      });
      
      return row;
    } catch (error) {
      return null;
    }
  }

  private logDatabaseStats(): void {
    console.log('\n📊 Database Loading Summary:');
    for (const [dbName, dbInfo] of this.databases) {
      console.log(`\n${dbName}:`);
      console.log(`  📁 Path: ${dbInfo.path}`);
      console.log(`  📋 Tables: ${dbInfo.tables.length}`);
      console.log(`  📊 Total Rows: ${dbInfo.totalRows}`);
      
      dbInfo.tables.forEach(table => {
        console.log(`    • ${table.name}: ${table.rowCount} rows`);
      });
    }
  }

  // API Methods
  getDatabase(dbName: string): DatabaseInfo | undefined {
    return this.databases.get(dbName);
  }

  getTable(dbName: string, tableName: string): DatabaseTable | undefined {
    const db = this.databases.get(dbName);
    return db?.tables.find(t => t.name === tableName);
  }

  getAllDatabases(): DatabaseInfo[] {
    return Array.from(this.databases.values());
  }

  getTableData(dbName: string, tableName: string, limit?: number): Record<string, any>[] {
    const table = this.getTable(dbName, tableName);
    if (!table) return [];
    
    return limit ? table.data.slice(0, limit) : table.data;
  }

  searchTable(dbName: string, tableName: string, searchTerm: string, field?: string): Record<string, any>[] {
    const table = this.getTable(dbName, tableName);
    if (!table) return [];

    return table.data.filter(row => {
      if (field) {
        return row[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      return Object.values(row).some(value => 
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }

  // DynamoDB preparation methods
  prepareDynamoDBSchema(dbName: string, tableName: string): any {
    const table = this.getTable(dbName, tableName);
    if (!table) return null;

    const primaryKey = table.headers[0]; // First column as primary key
    
    return {
      TableName: `${dbName}_${tableName}`,
      KeySchema: [
        {
          AttributeName: primaryKey,
          KeyType: 'HASH'
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: primaryKey,
          AttributeType: 'S'
        }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    };
  }

  prepareDynamoDBItems(dbName: string, tableName: string): any[] {
    const table = this.getTable(dbName, tableName);
    if (!table) return [];

    return table.data.map(row => {
      const item: any = {};
      Object.entries(row).forEach(([key, value]) => {
        item[key] = { S: value?.toString() || '' };
      });
      return item;
    });
  }
}

export const extractedDatabaseService = new ExtractedDatabaseService();