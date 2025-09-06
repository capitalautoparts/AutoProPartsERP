import * as XLSX from 'xlsx';
import { ExcelRow, ImportResult } from '../types/index.js';

export class ExcelHandler {
  static parseExcelFile(buffer: Buffer): ExcelRow[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON with header row as keys
    const data = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1,
      defval: ''
    }) as any[][];

    if (data.length < 2) {
      throw new Error('Excel file must have at least 2 rows (header + data)');
    }

    const headers = data[0] as string[];
    const dataTypes = data[1] as string[]; // Optional second row for data types
    const rows = data.slice(2); // Skip header and data type rows

    return rows.map(row => {
      const obj: ExcelRow = {};
      headers.forEach((header, index) => {
        obj[header] = row[index] || '';
      });
      return obj;
    });
  }

  static createExcelFile(data: any[], filename: string): Buffer {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  static validateImportData(data: ExcelRow[], requiredFields: string[]): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRecords = 0;

    data.forEach((row, index) => {
      const rowNumber = index + 3; // Account for header and data type rows
      
      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          errors.push(`Row ${rowNumber}: Missing required field '${field}'`);
        }
      });

      if (errors.length === 0) {
        validRecords++;
      }
    });

    return {
      success: errors.length === 0,
      recordsProcessed: validRecords,
      errors,
      warnings
    };
  }
}