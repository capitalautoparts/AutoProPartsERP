import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  PIESItemSeed, 
  PIESDescriptionSeed, 
  PIESAttributeSeed, 
  PIESPackageSeed, 
  PIESAssetSeed, 
  PIESAssortmentSeed,
  SeedProcessingResult,
  Product,
  PIESItem,
  PIESDescription,
  PIESAttribute,
  PIESPackage,
  PIESAsset,
  PIESAssortment
} from '../types/index.js';

export class PIESSeedService {
  private rootPath: string;

  constructor(rootPath: string = process.cwd()) {
    // Look for PIES files in project root, not server directory
    this.rootPath = rootPath.includes('server') ? rootPath.replace('\\server', '') : rootPath;
  }

  async processSeedData(): Promise<SeedProcessingResult> {
    const result: SeedProcessingResult = {
      success: true,
      itemsProcessed: 0,
      descriptionsProcessed: 0,
      attributesProcessed: 0,
      packagesProcessed: 0,
      assetsProcessed: 0,
      assortmentsProcessed: 0,
      errors: [],
      warnings: []
    };

    try {
      // Parse PIES text files
      const items = await this.parsePIESItems();
      const descriptions = await this.parsePIESDescriptions();
      const attributes = await this.parsePIESAttributes();
      const packages = await this.parsePIESPackages();
      const assets = await this.parsePIESAssets();
      const assortments = await this.parsePIESAssortments();

      result.itemsProcessed = items.length;
      result.descriptionsProcessed = descriptions.length;
      result.attributesProcessed = attributes.length;
      result.packagesProcessed = packages.length;
      result.assetsProcessed = assets.length;
      result.assortmentsProcessed = assortments.length;

      // Convert to products with PIES data
      const products = this.convertToProducts(items, descriptions, attributes, packages, assets, assortments);
      
      // Store in data service (this would be DynamoDB in production)
      await this.storeProducts(products);

      console.log(`PIES Seed Data Processing Complete:
        - Items: ${result.itemsProcessed}
        - Descriptions: ${result.descriptionsProcessed}
        - Attributes: ${result.attributesProcessed}
        - Packages: ${result.packagesProcessed}
        - Assets: ${result.assetsProcessed}
        - Assortments: ${result.assortmentsProcessed}
        - Products Created: ${products.length}`);

    } catch (error) {
      result.success = false;
      result.errors.push(`Seed processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  private async parsePIESItems(): Promise<PIESItemSeed[]> {
    const filePath = path.join(this.rootPath, 'PIES_ITEM.txt');
    return this.parseDelimitedFile<PIESItemSeed>(filePath);
  }

  private async parsePIESDescriptions(): Promise<PIESDescriptionSeed[]> {
    const filePath = path.join(this.rootPath, 'PIES_ITEM_DESC.txt');
    return this.parseDelimitedFile<PIESDescriptionSeed>(filePath);
  }

  private async parsePIESAttributes(): Promise<PIESAttributeSeed[]> {
    const filePath = path.join(this.rootPath, 'PIES_ITEM_ATRB.txt');
    return this.parseDelimitedFile<PIESAttributeSeed>(filePath);
  }

  private async parsePIESPackages(): Promise<PIESPackageSeed[]> {
    const filePath = path.join(this.rootPath, 'PIES_ITEM_PACK.txt');
    return this.parseDelimitedFile<PIESPackageSeed>(filePath);
  }

  private async parsePIESAssets(): Promise<PIESAssetSeed[]> {
    const filePath = path.join(this.rootPath, 'PIES_ITEM_ASSET.txt');
    return this.parseDelimitedFile<PIESAssetSeed>(filePath);
  }

  private async parsePIESAssortments(): Promise<PIESAssortmentSeed[]> {
    const filePath = path.join(this.rootPath, 'PIES_ITEM_ASST.txt');
    return this.parseDelimitedFile<PIESAssortmentSeed>(filePath);
  }

  private async parseDelimitedFile<T>(filePath: string): Promise<T[]> {
    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`PIES seed file not found: ${filePath}`);
        return [];
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        return [];
      }

      const headers = lines[0].split('|').map(h => h.trim());
      const records: T[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('|');
        const record: any = {};

        headers.forEach((header, index) => {
          const value = values[index]?.trim();
          if (value && value !== '') {
            record[header] = value;
          }
        });

        if (Object.keys(record).length > 0) {
          records.push(record as T);
        }
      }

      return records;
    } catch (error) {
      console.error(`Error parsing ${filePath}:`, error);
      return [];
    }
  }

  private convertToProducts(
    items: PIESItemSeed[],
    descriptions: PIESDescriptionSeed[],
    attributes: PIESAttributeSeed[],
    packages: PIESPackageSeed[],
    assets: PIESAssetSeed[],
    assortments: PIESAssortmentSeed[]
  ): Product[] {
    const products: Product[] = [];
    const processedPartNos = new Set<string>();

    // Group data by part number
    const descriptionsByPartNo = this.groupByPartNo(descriptions);
    const attributesByPartNo = this.groupByPartNo(attributes);
    const packagesByPartNo = this.groupByPartNo(packages);
    const assetsByPartNo = this.groupByPartNo(assets);
    const assortmentsByPartNo = this.groupByPartNo(assortments);

    for (const item of items) {
      if (!item.PartNo || processedPartNos.has(item.PartNo)) {
        continue;
      }

      processedPartNos.add(item.PartNo);

      const productId = uuidv4();
      const product: Product = {
        id: productId,
        manufacturer: item.MfgCode || 'Unknown',
        brand: item.BrandLabel || item.BrandID || 'Unknown',
        partNumber: item.PartNo,
        sku: item.PartNo,
        productName: this.getProductName(item.PartNo, descriptionsByPartNo),
        shortDescription: this.getShortDescription(item.PartNo, descriptionsByPartNo),
        longDescription: this.getLongDescription(item.PartNo, descriptionsByPartNo),
        stock: 0,
        unitType: item.ItemQtyUOM || 'Each',
        qtyOnHand: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // PIES data
        piesItem: this.convertPIESItem(item, productId),
        piesDescriptions: this.convertPIESDescriptions(item.PartNo, descriptionsByPartNo, productId),
        piesAttributes: this.convertPIESAttributes(item.PartNo, attributesByPartNo, productId),
        piesPackages: this.convertPIESPackages(item.PartNo, packagesByPartNo, productId),
        piesAssets: this.convertPIESAssets(item.PartNo, assetsByPartNo, productId),
        piesAssortments: this.convertPIESAssortments(item.PartNo, assortmentsByPartNo, productId)
      };

      products.push(product);
    }

    return products;
  }

  private groupByPartNo<T extends { PartNo: string }>(items: T[]): Map<string, T[]> {
    const grouped = new Map<string, T[]>();
    for (const item of items) {
      if (!grouped.has(item.PartNo)) {
        grouped.set(item.PartNo, []);
      }
      grouped.get(item.PartNo)!.push(item);
    }
    return grouped;
  }

  private getProductName(partNo: string, descriptions: Map<string, PIESDescriptionSeed[]>): string {
    const descs = descriptions.get(partNo) || [];
    const nameDesc = descs.find(d => d.DescriptionCode === 'DES' || d.DescriptionCode === 'LAB');
    return nameDesc?.Description || `Product ${partNo}`;
  }

  private getShortDescription(partNo: string, descriptions: Map<string, PIESDescriptionSeed[]>): string {
    const descs = descriptions.get(partNo) || [];
    const shortDesc = descs.find(d => d.DescriptionCode === 'LAB' || d.DescriptionCode === 'DES');
    return shortDesc?.Description || '';
  }

  private getLongDescription(partNo: string, descriptions: Map<string, PIESDescriptionSeed[]>): string {
    const descs = descriptions.get(partNo) || [];
    const longDesc = descs.find(d => d.DescriptionCode === 'MKT' || d.DescriptionCode === 'FAB');
    return longDesc?.Description || '';
  }

  private convertPIESItem(item: PIESItemSeed, productId: string): PIESItem {
    return {
      id: uuidv4(),
      productId,
      mfgCode: item.MfgCode,
      brandId: item.BrandID,
      partNo: item.PartNo,
      hazMatCode: item.HazMatCode,
      baseItemNo: item.BaseItemNo,
      gtin: item.GTIN,
      gtinQualifier: item.GTINQualifier,
      brandLabel: item.BrandLabel,
      subBrandId: item.SubBrandID,
      subBrandLabel: item.SubBrandLabel,
      vmrsBrandId: item.VMRSBrandID,
      acesApplication: item.ACESApplication === 'true',
      itemQtySize: item.ItemQtySize ? parseFloat(item.ItemQtySize) : undefined,
      itemQtyUom: item.ItemQtyUOM,
      containerType: item.ContainerType,
      qtyPerApp: item.QtyPerApp ? parseFloat(item.QtyPerApp) : undefined,
      qtyPerAppUom: item.QtyPerAppUOM,
      qtyPerAppQualifier: item.QtyPerAppQualifier,
      effectiveDate: item.EffectiveDate,
      availableDate: item.AvailableDate,
      minOrder: item.MinOrder ? parseFloat(item.MinOrder) : undefined,
      minOrderUom: item.MinOrderUOM,
      groupCode: item.GroupCode,
      subGroupCode: item.SubGroupCode,
      unspsc: item.UNSPSC,
      partType: item.PartType,
      categoryCode: item.CategoryCode,
      vmrsCode: item.VMRSCode
    };
  }

  private convertPIESDescriptions(partNo: string, descriptions: Map<string, PIESDescriptionSeed[]>, productId: string): PIESDescription[] {
    const descs = descriptions.get(partNo) || [];
    return descs.map((desc, index) => ({
      id: uuidv4(),
      productId,
      descriptionCode: desc.DescriptionCode,
      description: desc.Description,
      languageCode: desc.LanguageCode,
      sequence: index + 1
    }));
  }

  private convertPIESAttributes(partNo: string, attributes: Map<string, PIESAttributeSeed[]>, productId: string): PIESAttribute[] {
    const attrs = attributes.get(partNo) || [];
    return attrs.map(attr => ({
      id: uuidv4(),
      productId,
      attributeId: attr.AttributeID,
      attributeValue: attr.AttributeValue,
      attributeUom: attr.AttributeUOM
    }));
  }

  private convertPIESPackages(partNo: string, packages: Map<string, PIESPackageSeed[]>, productId: string): PIESPackage[] {
    const pkgs = packages.get(partNo) || [];
    return pkgs.map(pkg => ({
      id: uuidv4(),
      productId,
      packageUom: pkg.PackageUOM,
      packageQuantity: parseFloat(pkg.PackageQuantity) || 1,
      packageLength: pkg.PackageLength ? parseFloat(pkg.PackageLength) : undefined,
      packageWidth: pkg.PackageWidth ? parseFloat(pkg.PackageWidth) : undefined,
      packageHeight: pkg.PackageHeight ? parseFloat(pkg.PackageHeight) : undefined,
      packageWeight: pkg.PackageWeight ? parseFloat(pkg.PackageWeight) : undefined,
      dimensionUom: 'IN',
      weightUom: 'LB'
    }));
  }

  private convertPIESAssets(partNo: string, assets: Map<string, PIESAssetSeed[]>, productId: string): PIESAsset[] {
    const assts = assets.get(partNo) || [];
    return assts.map(asset => ({
      id: uuidv4(),
      productId,
      assetId: uuidv4(),
      assetType: asset.AssetType,
      representation: 'A',
      uri: asset.URI,
      assetDescription: asset.AssetDescription
    }));
  }

  private convertPIESAssortments(partNo: string, assortments: Map<string, PIESAssortmentSeed[]>, productId: string): PIESAssortment[] {
    const asrts = assortments.get(partNo) || [];
    return asrts.map(assort => ({
      id: uuidv4(),
      productId,
      assortmentId: assort.AssortmentID,
      assortmentDescription: assort.AssortmentDescription
    }));
  }

  private async storeProducts(products: Product[]): Promise<void> {
    // In production, this would store to DynamoDB
    // For now, we'll integrate with the existing dataService
    const { dataService } = await import('./dataService.js');
    
    // Clear existing products and add new ones
    (dataService as any).products = products;
    
    console.log(`Stored ${products.length} products with PIES data`);
  }
}

export const piesSeedService = new PIESSeedService();