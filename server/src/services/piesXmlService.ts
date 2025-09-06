import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import { Product } from '../types/index.js';

export class PIESXmlService {
  private schemaPath: string;

  constructor() {
    this.schemaPath = path.join(process.cwd().replace('\\server', ''), 'Autocarereference', 'PIES_7_2_Documentation', 'PIES_7_2_XSDSchema_Rev4_2_27_2025.txt');
  }

  async exportToXML(products: Product[]): Promise<string> {
    const piesData = {
      PIES: {
        $: {
          'xmlns': 'http://www.autocare.org',
          'version': '7.2'
        },
        Header: {
          PIESVersion: '7.2',
          SubmissionType: 'FULL',
          PCdbVersionDate: new Date().toISOString().split('T')[0],
          TechnicalContact: 'System Administrator',
          ContactEmail: 'admin@company.com'
        },
        Items: {
          Item: products.map(product => this.convertProductToPIESItem(product))
        },
        Trailer: {
          ItemCount: products.length,
          TransactionDate: new Date().toISOString().split('T')[0]
        }
      }
    };

    const builder = new xml2js.Builder({
      rootName: 'PIES',
      xmldec: { version: '1.0', encoding: 'UTF-8' }
    });

    return builder.buildObject(piesData.PIES);
  }

  async importFromXML(xmlContent: string): Promise<Product[]> {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(xmlContent);
    
    const piesData = result.PIES || result;
    const items = piesData.Items?.[0]?.Item || [];
    
    return items.map((item: any) => this.convertPIESItemToProduct(item));
  }

  private convertProductToPIESItem(product: Product): any {
    const item: any = {
      $: { MaintenanceType: 'A' },
      PartNumber: product.partNumber,
      BrandAAIAID: product.piesItem?.brandId || 'UNKN'
    };

    // Add optional fields if they exist
    if (product.piesItem?.gtin) {
      item.ItemLevelGTIN = {
        _: product.piesItem.gtin,
        $: { GTINQualifier: product.piesItem.gtinQualifier || 'UP' }
      };
    }

    if (product.piesItem?.brandLabel) {
      item.BrandLabel = product.piesItem.brandLabel;
    }

    if (product.piesItem?.unspsc) {
      item.UNSPSC = product.piesItem.unspsc;
    }

    if (product.piesItem?.categoryCode) {
      item.AAIAProductCategoryCode = product.piesItem.categoryCode;
    }

    // Add descriptions
    if (product.piesDescriptions && product.piesDescriptions.length > 0) {
      item.Descriptions = {
        Description: product.piesDescriptions.map(desc => ({
          _: desc.description,
          $: {
            MaintenanceType: 'A',
            DescriptionCode: desc.descriptionCode,
            LanguageCode: desc.languageCode || 'EN'
          }
        }))
      };
    }

    // Add attributes
    if (product.piesAttributes && product.piesAttributes.length > 0) {
      item.ProductAttributes = {
        ProductAttribute: product.piesAttributes.map(attr => ({
          _: attr.attributeValue,
          $: {
            MaintenanceType: 'A',
            AttributeID: attr.attributeId,
            PADBAttribute: 'Y',
            AttributeUOM: attr.attributeUom
          }
        }))
      };
    }

    // Add packages
    if (product.piesPackages && product.piesPackages.length > 0) {
      item.Packages = {
        Package: product.piesPackages.map(pkg => ({
          $: { MaintenanceType: 'A' },
          PackageUOM: pkg.packageUom || 'EA',
          QuantityofEaches: pkg.packageQuantity || 1,
          Dimensions: pkg.packageLength ? {
            MerchandisingHeight: pkg.packageHeight,
            MerchandisingWidth: pkg.packageWidth,
            MerchandisingLength: pkg.packageLength,
            ShippingHeight: pkg.packageHeight,
            ShippingWidth: pkg.packageWidth,
            ShippingLength: pkg.packageLength,
            $: { UOM: pkg.dimensionUom || 'IN' }
          } : undefined,
          Weights: pkg.packageWeight ? {
            Weight: pkg.packageWeight,
            $: { UOM: pkg.weightUom || 'LB' }
          } : undefined
        }))
      };
    }

    return item;
  }

  private convertPIESItemToProduct(item: any): Product {
    const productId = this.generateId();
    
    const product: Product = {
      id: productId,
      uniqueId: `${item.BrandAAIAID?.[0] || 'UNKN'}_${item.PartNumber?.[0]}`,
      manufacturer: 'Imported',
      brand: item.BrandLabel?.[0] || item.BrandAAIAID?.[0] || 'Unknown',
      partNumber: item.PartNumber?.[0] || '',
      sku: item.PartNumber?.[0] || '',
      productName: this.extractDescription(item, 'DES') || `Product ${item.PartNumber?.[0]}`,
      shortDescription: this.extractDescription(item, 'LAB') || '',
      longDescription: this.extractDescription(item, 'MKT') || '',
      stock: 0,
      unitType: 'Each',
      qtyOnHand: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // PIES Item data
      piesItem: {
        id: this.generateId(),
        productId,
        partNo: item.PartNumber?.[0] || '',
        brandId: item.BrandAAIAID?.[0],
        brandLabel: item.BrandLabel?.[0],
        gtin: item.ItemLevelGTIN?.[0]?._ || item.ItemLevelGTIN?.[0],
        gtinQualifier: item.ItemLevelGTIN?.[0]?.$?.GTINQualifier,
        unspsc: item.UNSPSC?.[0],
        categoryCode: item.AAIAProductCategoryCode?.[0]
      },

      // PIES Descriptions
      piesDescriptions: this.extractDescriptions(item, productId),
      
      // PIES Attributes
      piesAttributes: this.extractAttributes(item, productId),
      
      // PIES Packages
      piesPackages: this.extractPackages(item, productId)
    };

    return product;
  }

  private extractDescription(item: any, code: string): string {
    const descriptions = item.Descriptions?.[0]?.Description || [];
    const desc = descriptions.find((d: any) => d.$?.DescriptionCode === code);
    return desc?._ || desc || '';
  }

  private extractDescriptions(item: any, productId: string): any[] {
    const descriptions = item.Descriptions?.[0]?.Description || [];
    return descriptions.map((desc: any, index: number) => ({
      id: this.generateId(),
      productId,
      descriptionCode: desc.$?.DescriptionCode || 'DES',
      description: desc._ || desc,
      languageCode: desc.$?.LanguageCode || 'EN',
      sequence: index + 1
    }));
  }

  private extractAttributes(item: any, productId: string): any[] {
    const attributes = item.ProductAttributes?.[0]?.ProductAttribute || [];
    return attributes.map((attr: any) => ({
      id: this.generateId(),
      productId,
      attributeId: attr.$?.AttributeID || '',
      attributeValue: attr._ || attr,
      attributeUom: attr.$?.AttributeUOM
    }));
  }

  private extractPackages(item: any, productId: string): any[] {
    const packages = item.Packages?.[0]?.Package || [];
    return packages.map((pkg: any) => ({
      id: this.generateId(),
      productId,
      packageUom: pkg.PackageUOM?.[0] || 'EA',
      packageQuantity: parseInt(pkg.QuantityofEaches?.[0]) || 1,
      packageLength: pkg.Dimensions?.[0]?.MerchandisingLength?.[0] ? parseFloat(pkg.Dimensions[0].MerchandisingLength[0]) : undefined,
      packageWidth: pkg.Dimensions?.[0]?.MerchandisingWidth?.[0] ? parseFloat(pkg.Dimensions[0].MerchandisingWidth[0]) : undefined,
      packageHeight: pkg.Dimensions?.[0]?.MerchandisingHeight?.[0] ? parseFloat(pkg.Dimensions[0].MerchandisingHeight[0]) : undefined,
      packageWeight: pkg.Weights?.[0]?.Weight?.[0] ? parseFloat(pkg.Weights[0].Weight[0]) : undefined,
      dimensionUom: pkg.Dimensions?.[0]?.$?.UOM || 'IN',
      weightUom: pkg.Weights?.[0]?.$?.UOM || 'LB'
    }));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  async validateXML(xmlContent: string): Promise<{ valid: boolean; errors: string[] }> {
    try {
      await this.importFromXML(xmlContent);
      return { valid: true, errors: [] };
    } catch (error) {
      return { 
        valid: false, 
        errors: [error instanceof Error ? error.message : 'Unknown validation error'] 
      };
    }
  }
}

export const piesXmlService = new PIESXmlService();