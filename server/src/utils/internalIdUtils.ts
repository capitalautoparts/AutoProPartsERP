/**
 * Internal ID System Utilities
 * Generates and validates BrandID + PartNumber concatenated identifiers
 */

export interface InternalIdComponents {
  brandId: string;
  partNumber: string;
}

/**
 * Generate internal product ID from BrandID and PartNumber
 */
export const generateInternalProductId = (brandId: string, partNumber: string): string => {
  if (!brandId || !partNumber) {
    throw new Error('BrandID and PartNumber are required');
  }
  
  // Clean inputs for database storage
  const cleanBrandId = brandId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  const cleanPartNumber = partNumber.trim().replace(/[^A-Za-z0-9]/g, '');
  
  // Validate lengths
  if (cleanBrandId.length < 2 || cleanBrandId.length > 10) {
    throw new Error('BrandID must be 2-10 characters after cleaning');
  }
  if (cleanPartNumber.length < 1 || cleanPartNumber.length > 50) {
    throw new Error('PartNumber must be 1-50 characters after cleaning');
  }
  
  return cleanBrandId + cleanPartNumber;
};

/**
 * Parse internal ID back to components (requires database lookup)
 */
export const parseInternalProductId = async (internalId: string, getProductFn: (id: string) => Promise<any>): Promise<InternalIdComponents> => {
  const product = await getProductFn(internalId);
  if (!product) {
    throw new Error(`Product not found: ${internalId}`);
  }
  
  return {
    brandId: product.brandId || product.BrandID,
    partNumber: product.partNumber || product.PartNumber
  };
};

/**
 * Validate internal ID format
 */
export const validateInternalProductId = (internalId: string): boolean => {
  return /^[A-Z0-9]{3,60}$/.test(internalId);
};

/**
 * Clean and prepare brand ID for internal ID generation
 */
export const cleanBrandId = (brandId: string): string => {
  return brandId.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
};

/**
 * Clean and prepare part number for internal ID generation
 */
export const cleanPartNumber = (partNumber: string): string => {
  return partNumber.trim().replace(/[^A-Za-z0-9]/g, '');
};

/**
 * Extract brand ID from internal ID (requires known brand length or database lookup)
 */
export const extractBrandIdFromInternal = (internalId: string, brandLength: number): InternalIdComponents => {
  if (!validateInternalProductId(internalId)) {
    throw new Error('Invalid internal ID format');
  }
  
  return {
    brandId: internalId.substring(0, brandLength),
    partNumber: internalId.substring(brandLength)
  };
};