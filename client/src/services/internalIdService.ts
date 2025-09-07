/**
 * Client-side Internal ID Service
 * Handles internal product ID operations and API calls
 */

import { Product } from '../types';

export interface InternalIdComponents {
  brandId: string;
  partNumber: string;
}

export interface BatchLookupRequest {
  internalIds: string[];
}

export interface BatchLookupResponse {
  products: Product[];
  notFound: string[];
}

export interface GenerateIdRequest {
  brandId: string;
  partNumber: string;
}

export interface GenerateIdResponse {
  internalId: string;
  brandId: string;
  partNumber: string;
}

export interface InventoryTransaction {
  id: string;
  internalProductId: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason?: string;
  date: string;
}

export interface InventoryAdjustment {
  quantity: number;
  reason: string;
}

class InternalIdService {
  private baseUrl = '/api';

  /**
   * Get product by internal ID
   */
  async getProduct(internalId: string): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${internalId}`);
    if (!response.ok) {
      throw new Error(`Product not found: ${internalId}`);
    }
    return response.json();
  }

  /**
   * Update product by internal ID
   */
  async updateProduct(internalId: string, updates: Partial<Product>): Promise<Product> {
    const response = await fetch(`${this.baseUrl}/products/${internalId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update product: ${internalId}`);
    }
    
    return response.json();
  }

  /**
   * Delete product by internal ID
   */
  async deleteProduct(internalId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/products/${internalId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete product: ${internalId}`);
    }
  }

  /**
   * Batch lookup products by internal IDs
   */
  async batchLookup(internalIds: string[]): Promise<Product[]> {
    const response = await fetch(`${this.baseUrl}/products/batch-lookup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ internalIds }),
    });
    
    if (!response.ok) {
      throw new Error('Batch lookup failed');
    }
    
    return response.json();
  }

  /**
   * Generate internal ID from brand and part number
   */
  async generateInternalId(brandId: string, partNumber: string): Promise<GenerateIdResponse> {
    const response = await fetch(`${this.baseUrl}/products/generate-internal-id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ brandId, partNumber }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate internal ID');
    }
    
    return response.json();
  }

  /**
   * Get product components (brand ID and part number)
   */
  async getProductComponents(internalId: string): Promise<{
    internalProductId: string;
    brandId: string;
    partNumber: string;
    brand: string;
    productName: string;
  }> {
    const response = await fetch(`${this.baseUrl}/products/${internalId}/components`);
    if (!response.ok) {
      throw new Error(`Failed to get components for: ${internalId}`);
    }
    return response.json();
  }

  // Inventory Management

  /**
   * Get inventory for product
   */
  async getInventory(internalId: string): Promise<{
    internalProductId: string;
    qtyOnHand: number;
    qtyReserved: number;
    qtyAvailable: number;
    lastUpdated: string;
    transactions: InventoryTransaction[];
  }> {
    const response = await fetch(`${this.baseUrl}/inventory/${internalId}`);
    if (!response.ok) {
      throw new Error(`Failed to get inventory for: ${internalId}`);
    }
    return response.json();
  }

  /**
   * Adjust inventory for product
   */
  async adjustInventory(internalId: string, adjustment: InventoryAdjustment): Promise<InventoryTransaction> {
    const response = await fetch(`${this.baseUrl}/inventory/${internalId}/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adjustment),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to adjust inventory for: ${internalId}`);
    }
    
    return response.json();
  }

  // ACES Applications

  /**
   * Get ACES applications for product
   */
  async getACESApplications(internalId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/products/${internalId}/aces-applications`);
    if (!response.ok) {
      throw new Error(`Failed to get ACES applications for: ${internalId}`);
    }
    return response.json();
  }

  /**
   * Create ACES application for product
   */
  async createACESApplication(internalId: string, application: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/products/${internalId}/aces-applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(application),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create ACES application for: ${internalId}`);
    }
    
    return response.json();
  }

  // Utility Methods

  /**
   * Validate internal ID format (client-side)
   */
  validateInternalId(internalId: string): boolean {
    return /^[A-Z0-9]{3,60}$/.test(internalId);
  }

  /**
   * Clean brand ID for internal ID generation
   */
  cleanBrandId(brandId: string): string {
    return brandId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Clean part number for internal ID generation
   */
  cleanPartNumber(partNumber: string): string {
    return partNumber.trim().replace(/[^A-Za-z0-9]/g, '');
  }

  /**
   * Preview internal ID without API call
   */
  previewInternalId(brandId: string, partNumber: string): {
    internalId: string;
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (!brandId) {
      errors.push('Brand ID is required');
    }
    
    if (!partNumber) {
      errors.push('Part number is required');
    }
    
    const cleanBrandId = this.cleanBrandId(brandId);
    const cleanPartNumber = this.cleanPartNumber(partNumber);
    
    if (cleanBrandId.length < 2 || cleanBrandId.length > 10) {
      errors.push('Brand ID must be 2-10 characters after cleaning');
    }
    
    if (cleanPartNumber.length < 1 || cleanPartNumber.length > 50) {
      errors.push('Part number must be 1-50 characters after cleaning');
    }
    
    const internalId = cleanBrandId + cleanPartNumber;
    
    return {
      internalId,
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Format internal ID for display
   */
  formatInternalId(internalId: string, brandLength?: number): string {
    if (!this.validateInternalId(internalId)) {
      return internalId;
    }
    
    if (brandLength && brandLength > 0 && brandLength < internalId.length) {
      const brandId = internalId.substring(0, brandLength);
      const partNumber = internalId.substring(brandLength);
      return `${brandId}-${partNumber}`;
    }
    
    return internalId;
  }

  /**
   * Extract likely brand ID from internal ID (heuristic)
   */
  extractBrandId(internalId: string): string {
    // Simple heuristic: assume first 4 characters are brand ID
    // In production, this would require database lookup
    return internalId.substring(0, Math.min(4, internalId.length));
  }

  /**
   * Extract likely part number from internal ID (heuristic)
   */
  extractPartNumber(internalId: string): string {
    // Simple heuristic: assume after first 4 characters
    return internalId.substring(Math.min(4, internalId.length));
  }
}

export const internalIdService = new InternalIdService();