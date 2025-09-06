import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { 
  Product, 
  PIESItem, 
  PIESDescription, 
  PIESAttribute, 
  PIESPackage,
  ImportResult 
} from '../types/index.js';

export class PIESExcelHandler {
  
  /**
   * Export products with full PIES data to Excel
   */
  static exportToExcel(products: Product[]): Buffer {
    const workbook = XLSX.utils.book_new();
    
    // Main Products sheet
    const productsData = products.map(product => ({
      // Profile fields
      'ID': product.id,
      'Manufacturer': product.manufacturer,
      'Brand': product.brand,
      'Part Number': product.partNumber,
      'SKU': product.sku,
      'Product Name': product.productName,
      'Short Description': product.shortDescription,
      'Long Description': product.longDescription,
      'Stock': product.stock,
      'Unit Type': product.unitType,
      'Qty On Hand': product.qtyOnHand,
      
      // PIES Item fields
      'PIES Mfg Code': product.piesItem?.mfgCode || '',
      'PIES Brand ID': product.piesItem?.brandId || '',
      'PIES GTIN': product.piesItem?.gtin || '',
      'PIES Brand Label': product.piesItem?.brandLabel || '',
      'PIES UNSPSC': product.piesItem?.unspsc || '',
      'PIES Part Type': product.piesItem?.partType || '',
      'PIES Category Code': product.piesItem?.categoryCode || '',
      'PIES Hazmat Code': product.piesItem?.hazMatCode || '',
      'PIES Item Qty Size': product.piesItem?.itemQtySize || '',
      'PIES Item Qty UOM': product.piesItem?.itemQtyUom || '',
      'PIES VMRS Code': product.piesItem?.vmrsCode || '',
      
      'Created At': product.createdAt,
      'Updated At': product.updatedAt
    }));
    
    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
    
    // PIES Descriptions sheet
    const descriptionsData: any[] = [];
    products.forEach(product => {
      if (product.piesDescriptions) {
        product.piesDescriptions.forEach(desc => {
          descriptionsData.push({
            'Product ID': product.id,
            'Part Number': product.partNumber,
            'Description Code': desc.descriptionCode,
            'Description': desc.description,
            'Language Code': desc.languageCode || 'EN',
            'Sequence': desc.sequence || 1
          });
        });
      }
    });
    
    if (descriptionsData.length > 0) {
      const descriptionsSheet = XLSX.utils.json_to_sheet(descriptionsData);
      XLSX.utils.book_append_sheet(workbook, descriptionsSheet, 'PIES Descriptions');
    }
    
    // PIES Attributes sheet
    const attributesData: any[] = [];
    products.forEach(product => {
      if (product.piesAttributes) {
        product.piesAttributes.forEach(attr => {
          attributesData.push({
            'Product ID': product.id,
            'Part Number': product.partNumber,
            'Attribute ID': attr.attributeId,
            'Attribute Value': attr.attributeValue,
            'Attribute UOM': attr.attributeUom || ''
          });
        });
      }
    });
    
    if (attributesData.length > 0) {
      const attributesSheet = XLSX.utils.json_to_sheet(attributesData);
      XLSX.utils.book_append_sheet(workbook, attributesSheet, 'PIES Attributes');
    }
    
    // PIES Packages sheet
    const packagesData: any[] = [];
    products.forEach(product => {
      if (product.piesPackages) {
        product.piesPackages.forEach(pkg => {
          packagesData.push({
            'Product ID': product.id,
            'Part Number': product.partNumber,
            'Package UOM': pkg.packageUom,
            'Package Quantity': pkg.packageQuantity,
            'Package Length': pkg.packageLength || '',
            'Package Width': pkg.packageWidth || '',
            'Package Height': pkg.packageHeight || '',
            'Package Weight': pkg.packageWeight || '',
            'Dimension UOM': pkg.dimensionUom || 'IN',
            'Weight UOM': pkg.weightUom || 'LB'
          });
        });
      }
    });
    
    if (packagesData.length > 0) {
      const packagesSheet = XLSX.utils.json_to_sheet(packagesData);
      XLSX.utils.book_append_sheet(workbook, packagesSheet, 'PIES Packages');
    }
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
  
  /**
   * Import products from Excel with PIES data
   */
  static importFromExcel(buffer: Buffer): ImportResult {
    const result: ImportResult = {
      success: true,
      recordsProcessed: 0,
      errors: [],
      warnings: []
    };
    
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      // Process main products sheet
      if (workbook.SheetNames.includes('Products')) {
        const worksheet = workbook.Sheets['Products'];
        const data = XLSX.utils.sheet_to_json(worksheet);
        
        result.recordsProcessed = data.length;
        
        // Validate required fields
        for (let i = 0; i < data.length; i++) {
          const row = data[i] as any;
          
          if (!row['Part Number']) {
            result.errors.push(`Row ${i + 2}: Part Number is required`);
          }
          
          if (!row['Product Name']) {
            result.errors.push(`Row ${i + 2}: Product Name is required`);
          }
        }
        
        if (result.errors.length > 0) {
          result.success = false;
        }
      } else {
        result.success = false;
        result.errors.push('Products sheet not found in Excel file');
      }
      
    } catch (error) {
      result.success = false;
      result.errors.push(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    return result;
  }
  
  /**
   * Generate Excel template with all PIES fields
   */
  static generateTemplate(): Buffer {
    const workbook = XLSX.utils.book_new();
    
    // Products template with field names and data types
    const productsTemplate = [
      // Header row with field names
      {
        'ID': 'ID',
        'Manufacturer': 'Manufacturer',
        'Brand': 'Brand',
        'Part Number': 'Part Number',
        'SKU': 'SKU',
        'Product Name': 'Product Name',
        'Short Description': 'Short Description',
        'Long Description': 'Long Description',
        'Stock': 'Stock',
        'Unit Type': 'Unit Type',
        'Qty On Hand': 'Qty On Hand',
        'PIES Mfg Code': 'PIES Mfg Code',
        'PIES Brand ID': 'PIES Brand ID',
        'PIES GTIN': 'PIES GTIN',
        'PIES Brand Label': 'PIES Brand Label',
        'PIES UNSPSC': 'PIES UNSPSC',
        'PIES Part Type': 'PIES Part Type',
        'PIES Category Code': 'PIES Category Code',
        'PIES Hazmat Code': 'PIES Hazmat Code',
        'PIES Item Qty Size': 'PIES Item Qty Size',
        'PIES Item Qty UOM': 'PIES Item Qty UOM',
        'PIES VMRS Code': 'PIES VMRS Code'
      },
      // Data type row
      {
        'ID': 'string',
        'Manufacturer': 'string',
        'Brand': 'string',
        'Part Number': 'string',
        'SKU': 'string',
        'Product Name': 'string',
        'Short Description': 'string',
        'Long Description': 'string',
        'Stock': 'number',
        'Unit Type': 'string',
        'Qty On Hand': 'number',
        'PIES Mfg Code': 'string',
        'PIES Brand ID': 'string',
        'PIES GTIN': 'string',
        'PIES Brand Label': 'string',
        'PIES UNSPSC': 'string',
        'PIES Part Type': 'string',
        'PIES Category Code': 'string',
        'PIES Hazmat Code': 'string',
        'PIES Item Qty Size': 'number',
        'PIES Item Qty UOM': 'string',
        'PIES VMRS Code': 'string'
      },
      // Sample data row
      {
        'ID': 'auto-generated',
        'Manufacturer': 'AutoParts Inc',
        'Brand': 'ProBrand',
        'Part Number': 'PB-12345',
        'SKU': 'SKU-PB-12345',
        'Product Name': 'Premium Brake Pad Set',
        'Short Description': 'High-performance ceramic brake pads',
        'Long Description': 'Premium ceramic brake pads designed for superior stopping power',
        'Stock': 150,
        'Unit Type': 'Set',
        'Qty On Hand': 150,
        'PIES Mfg Code': 'JVYD',
        'PIES Brand ID': 'PROBRAND',
        'PIES GTIN': '123456789012',
        'PIES Brand Label': 'ProBrand',
        'PIES UNSPSC': '25171501',
        'PIES Part Type': 'Brake Pad',
        'PIES Category Code': '7644',
        'PIES Hazmat Code': '',
        'PIES Item Qty Size': 1,
        'PIES Item Qty UOM': 'SET',
        'PIES VMRS Code': '013-001-001'
      }
    ];
    
    const productsSheet = XLSX.utils.json_to_sheet(productsTemplate);
    XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products');
    
    // PIES Descriptions template
    const descriptionsTemplate = [
      {
        'Product ID': 'Product ID',
        'Part Number': 'Part Number',
        'Description Code': 'Description Code',
        'Description': 'Description',
        'Language Code': 'Language Code',
        'Sequence': 'Sequence'
      },
      {
        'Product ID': 'string',
        'Part Number': 'string',
        'Description Code': 'string',
        'Description': 'string',
        'Language Code': 'string',
        'Sequence': 'number'
      },
      {
        'Product ID': 'reference-to-product',
        'Part Number': 'PB-12345',
        'Description Code': 'DES',
        'Description': 'Premium Brake Pad Set',
        'Language Code': 'EN',
        'Sequence': 1
      }
    ];
    
    const descriptionsSheet = XLSX.utils.json_to_sheet(descriptionsTemplate);
    XLSX.utils.book_append_sheet(workbook, descriptionsSheet, 'PIES Descriptions');
    
    // PIES Attributes template
    const attributesTemplate = [
      {
        'Product ID': 'Product ID',
        'Part Number': 'Part Number',
        'Attribute ID': 'Attribute ID',
        'Attribute Value': 'Attribute Value',
        'Attribute UOM': 'Attribute UOM'
      },
      {
        'Product ID': 'string',
        'Part Number': 'string',
        'Attribute ID': 'string',
        'Attribute Value': 'string',
        'Attribute UOM': 'string'
      },
      {
        'Product ID': 'reference-to-product',
        'Part Number': 'PB-12345',
        'Attribute ID': 'MATERIAL',
        'Attribute Value': 'Ceramic',
        'Attribute UOM': ''
      }
    ];
    
    const attributesSheet = XLSX.utils.json_to_sheet(attributesTemplate);
    XLSX.utils.book_append_sheet(workbook, attributesSheet, 'PIES Attributes');
    
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}