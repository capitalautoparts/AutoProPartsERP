import * as xml2js from 'xml2js';
import { ImportResult } from '../types/index.js';

export class XMLHandler {
  static async parseXMLFile(buffer: Buffer): Promise<any> {
    const parser = new xml2js.Parser({
      explicitArray: false,
      ignoreAttrs: false,
      mergeAttrs: true
    });

    try {
      const result = await parser.parseStringPromise(buffer.toString());
      return result;
    } catch (error) {
      throw new Error(`XML parsing failed: ${error}`);
    }
  }

  static createXMLFile(data: any, rootElement: string = 'root'): string {
    const builder = new xml2js.Builder({
      rootName: rootElement,
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });
    
    return builder.buildObject(data);
  }

  static validateACESXML(xmlData: any): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let recordsProcessed = 0;

    try {
      // Basic ACES XML structure validation
      if (!xmlData.ACES) {
        errors.push('Invalid ACES XML: Missing ACES root element');
        return { success: false, recordsProcessed: 0, errors, warnings };
      }

      const apps = xmlData.ACES.App || [];
      const applications = Array.isArray(apps) ? apps : [apps];

      applications.forEach((app: any, index: number) => {
        if (!app.$.action) {
          errors.push(`Application ${index + 1}: Missing action attribute`);
        }
        if (!app.$.id) {
          errors.push(`Application ${index + 1}: Missing id attribute`);
        }
        if (!app.PartNumber) {
          errors.push(`Application ${index + 1}: Missing PartNumber`);
        }
        
        if (errors.length === 0) {
          recordsProcessed++;
        }
      });

    } catch (error) {
      errors.push(`ACES XML validation error: ${error}`);
    }

    return {
      success: errors.length === 0,
      recordsProcessed,
      errors,
      warnings
    };
  }

  static validatePIESXML(xmlData: any): ImportResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let recordsProcessed = 0;

    try {
      // Basic PIES XML structure validation
      if (!xmlData.PIES) {
        errors.push('Invalid PIES XML: Missing PIES root element');
        return { success: false, recordsProcessed: 0, errors, warnings };
      }

      const items = xmlData.PIES.Items?.Item || [];
      const itemList = Array.isArray(items) ? items : [items];

      itemList.forEach((item: any, index: number) => {
        if (!item.PartNumber) {
          errors.push(`Item ${index + 1}: Missing PartNumber`);
        }
        if (!item.BrandAAIAID) {
          errors.push(`Item ${index + 1}: Missing BrandAAIAID`);
        }
        
        if (errors.length === 0) {
          recordsProcessed++;
        }
      });

    } catch (error) {
      errors.push(`PIES XML validation error: ${error}`);
    }

    return {
      success: errors.length === 0,
      recordsProcessed,
      errors,
      warnings
    };
  }
}