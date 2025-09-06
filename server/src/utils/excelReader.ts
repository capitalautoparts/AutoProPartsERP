import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export class ExcelSpecReader {
  static readPIESSpec(filePath: string) {
    try {
      const workbook = XLSX.readFile(filePath);
      const result: any = {};
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length >= 2) {
          const headers = data[0] as string[];
          const dataTypes = data[1] as string[];
          
          result[sheetName] = headers.map((header, index) => ({
            field: header,
            type: dataTypes[index] || 'string',
            required: header.includes('*') || header.includes('Required')
          }));
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error reading PIES spec:', error);
      return null;
    }
  }
  
  static readACESSpec(filePath: string) {
    try {
      const workbook = XLSX.readFile(filePath);
      const result: any = {};
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (data.length >= 2) {
          const headers = data[0] as string[];
          const dataTypes = data[1] as string[];
          
          result[sheetName] = headers.map((header, index) => ({
            field: header,
            type: dataTypes[index] || 'string',
            required: header.includes('*') || header.includes('Required')
          }));
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error reading ACES spec:', error);
      return null;
    }
  }
}

// Generate field definitions from Excel specs
export function generateFieldDefinitions() {
  const rootPath = process.cwd().replace('\\server', '');
  const piesPath = path.join(rootPath, 'PIES_7-2.xlsx');
  const acesPath = path.join(rootPath, 'ACES_4_1.xlsx');
  
  console.log('Reading PIES spec from:', piesPath);
  console.log('Reading ACES spec from:', acesPath);
  
  const piesSpec = ExcelSpecReader.readPIESSpec(piesPath);
  const acesSpec = ExcelSpecReader.readACESSpec(acesPath);
  
  if (piesSpec) {
    console.log('PIES Sheets found:', Object.keys(piesSpec));
    Object.keys(piesSpec).forEach(sheet => {
      console.log(`\n${sheet} fields:`, piesSpec[sheet].length);
    });
  }
  
  if (acesSpec) {
    console.log('ACES Sheets found:', Object.keys(acesSpec));
    Object.keys(acesSpec).forEach(sheet => {
      console.log(`\n${sheet} fields:`, acesSpec[sheet].length);
    });
  }
  
  return { piesSpec, acesSpec };
}