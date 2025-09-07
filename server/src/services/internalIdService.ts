/**
 * Internal ID Service
 * Manages internal product identifiers and cross-module references
 */

import { generateInternalProductId, validateInternalProductId, InternalIdComponents } from '../utils/internalIdUtils.js';
import { Product } from '../types/index.js';

export interface InternalIdProduct extends Product {
  internalProductId: string;
  brandId: string;
}

export interface ProductLookupResult {
  product: InternalIdProduct | null;
  found: boolean;
}

export interface BatchLookupResult {
  products: InternalIdProduct[];
  notFound: string[];
}

class InternalIdService {
  /**
   * Generate internal ID for a product
   */
  generateProductId(brandId: string, partNumber: string): string {
    return generateInternalProductId(brandId, partNumber);
  }

  /**
   * Validate internal ID format
   */
  validateProductId(internalId: string): boolean {
    return validateInternalProductId(internalId);
  }

  /**
   * Convert existing product to internal ID format
   */
  convertToInternalId(product: Product, brandId?: string): InternalIdProduct {
    const effectiveBrandId = brandId || this.extractBrandFromProduct(product);
    const internalProductId = this.generateProductId(effectiveBrandId, product.partNumber);
    
    return {
      ...product,
      internalProductId,
      brandId: effectiveBrandId,
      id: internalProductId, // Set primary ID to internal ID
      uniqueId: internalProductId // Set unique ID to internal ID
    };
  }

  /**
   * Extract brand ID from existing product data
   */
  private extractBrandFromProduct(product: Product): string {
    // Try multiple sources for brand ID
    if (product.piesItem?.brandId) {
      return product.piesItem.brandId;
    }
    
    // Fallback to brand name (first 4 chars, cleaned)
    if (product.brand) {
      return product.brand.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
    }
    
    throw new Error(`Cannot determine brand ID for product: ${product.partNumber}`);
  }

  /**
   * Batch convert products to internal ID format
   */
  batchConvertToInternalId(products: Product[]): InternalIdProduct[] {
    return products.map(product => {
      try {
        return this.convertToInternalId(product);
      } catch (error) {
        console.warn(`Failed to convert product ${product.partNumber}:`, error);
        // Return with generated brand ID as fallback
        const fallbackBrandId = 'UNKN';
        return this.convertToInternalId(product, fallbackBrandId);
      }
    });
  }

  /**
   * Create lookup map for fast internal ID access
   */
  createLookupMap(products: InternalIdProduct[]): Map<string, InternalIdProduct> {
    const lookupMap = new Map<string, InternalIdProduct>();
    
    products.forEach(product => {
      lookupMap.set(product.internalProductId, product);
    });
    
    return lookupMap;
  }

  /**
   * Batch lookup products by internal IDs
   */
  batchLookup(internalIds: string[], lookupMap: Map<string, InternalIdProduct>): BatchLookupResult {
    const products: InternalIdProduct[] = [];
    const notFound: string[] = [];
    
    internalIds.forEach(id => {
      const product = lookupMap.get(id);
      if (product) {
        products.push(product);
      } else {
        notFound.push(id);
      }
    });
    
    return { products, notFound };
  }

  /**
   * Generate internal IDs for cross-module references
   */
  generateCrossModuleReference(brandId: string, partNumber: string): {
    internalProductId: string;
    orderLineReference: string;
    inventoryReference: string;
    purchaseOrderReference: string;
  } {
    const internalProductId = this.generateProductId(brandId, partNumber);
    
    return {
      internalProductId,
      orderLineReference: internalProductId,
      inventoryReference: internalProductId,
      purchaseOrderReference: internalProductId
    };
  }

  /**
   * Validate product data for internal ID generation
   */
  validateProductForInternalId(product: Partial<Product>): {
    valid: boolean;
    errors: string[];
    brandId?: string;
  } {
    const errors: string[] = [];
    
    if (!product.partNumber) {
      errors.push('Part number is required');
    }
    
    let brandId: string | undefined;
    
    // Try to extract brand ID
    try {
      if (product.piesItem?.brandId) {
        brandId = product.piesItem.brandId;
      } else if (product.brand) {
        brandId = product.brand.substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (brandId.length < 2) {
          errors.push('Brand name too short to generate brand ID');
        }
      } else {
        errors.push('Brand ID or brand name is required');
      }
    } catch (error) {
      errors.push('Failed to extract brand ID');
    }
    
    return {
      valid: errors.length === 0,
      errors,
      brandId
    };
  }
}

export const internalIdService = new InternalIdService();