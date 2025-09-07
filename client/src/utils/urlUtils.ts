// Utility functions for URL handling
export const encodeProductId = (id: string): string => {
  return encodeURIComponent(id);
};

export const decodeProductId = (encodedId: string): string => {
  return decodeURIComponent(encodedId);
};

export const isUUID = (id: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

export const isInternalId = (id: string): boolean => {
  return /^[A-Z0-9]{3,60}$/i.test(id);
};

export const parseProductId = (id: string): {
  type: 'uuid' | 'internal' | 'unknown';
  brand?: string;
  partNumber?: string;
} => {
  if (isUUID(id)) {
    return { type: 'uuid' };
  } else if (isInternalId(id)) {
    // Cannot parse concatenated ID without knowing brand length
    return { type: 'internal' };
  } else {
    return { type: 'unknown' };
  }
};

export const constructInternalId = (brand: string, partNumber: string): string => {
  return `${brand.toUpperCase().replace(/[^A-Z0-9]/g, '')}${partNumber.replace(/[^A-Za-z0-9]/g, '')}`;
};

export const getBusinessFriendlyUrl = (product: { internalProductId?: string; id: string }): string => {
  // Prefer internal ID for business-friendly URLs
  return product.internalProductId || product.id;
};