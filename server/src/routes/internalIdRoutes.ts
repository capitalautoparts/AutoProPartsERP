/**
 * Internal ID API Routes
 * RESTful endpoints using internal product identifiers
 */

import express from 'express';
import { dataService } from '../services/dataService.js';
import { internalIdService } from '../services/internalIdService.js';

const router = express.Router();

// Product Management APIs using Internal IDs

/**
 * GET /api/products/:internalId
 * Get product by internal ID
 */
router.get('/products/:internalId', (req, res) => {
  try {
    const { internalId } = req.params;
    
    if (!dataService.validateInternalId(internalId)) {
      return res.status(400).json({ error: 'Invalid internal ID format' });
    }
    
    const product = dataService.getProductById(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/products/:internalId
 * Update product by internal ID
 */
router.put('/products/:internalId', (req, res) => {
  try {
    const { internalId } = req.params;
    
    if (!dataService.validateInternalId(internalId)) {
      return res.status(400).json({ error: 'Invalid internal ID format' });
    }
    
    const updatedProduct = dataService.updateProduct(internalId, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/products/:internalId
 * Delete product by internal ID
 */
router.delete('/products/:internalId', (req, res) => {
  try {
    const { internalId } = req.params;
    
    if (!dataService.validateInternalId(internalId)) {
      return res.status(400).json({ error: 'Invalid internal ID format' });
    }
    
    const deleted = dataService.deleteProduct(internalId);
    if (!deleted) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/products/batch-lookup
 * Batch lookup products by internal IDs
 */
router.post('/products/batch-lookup', (req, res) => {
  try {
    const { internalIds } = req.body;
    
    if (!Array.isArray(internalIds)) {
      return res.status(400).json({ error: 'internalIds must be an array' });
    }
    
    // Validate all IDs
    const invalidIds = internalIds.filter(id => !dataService.validateInternalId(id));
    if (invalidIds.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid internal ID format', 
        invalidIds 
      });
    }
    
    const products = dataService.getProductsByInternalIds(internalIds);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/products/generate-internal-id
 * Generate internal ID from brand and part number
 */
router.post('/products/generate-internal-id', (req, res) => {
  try {
    const { brandId, partNumber } = req.body;
    
    if (!brandId || !partNumber) {
      return res.status(400).json({ error: 'brandId and partNumber are required' });
    }
    
    const internalId = dataService.generateInternalId(brandId, partNumber);
    res.json({ internalId, brandId, partNumber });
  } catch (error: unknown) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'ID generation failed' });
  }
});

// Cross-Module Integration APIs

/**
 * GET /api/inventory/:internalId
 * Get inventory for product by internal ID
 */
router.get('/inventory/:internalId', (req, res) => {
  try {
    const { internalId } = req.params;
    
    const product = dataService.getProductById(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Mock inventory data - replace with actual inventory service
    const inventory = {
      internalProductId: internalId,
      qtyOnHand: product.qtyOnHand,
      qtyReserved: 0,
      qtyAvailable: product.qtyOnHand,
      lastUpdated: new Date().toISOString(),
      transactions: [
        {
          id: '1',
          type: 'INITIAL',
          quantity: product.qtyOnHand,
          date: product.createdAt
        }
      ]
    };
    
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/inventory/:internalId/adjust
 * Adjust inventory for product
 */
router.post('/inventory/:internalId/adjust', (req, res) => {
  try {
    const { internalId } = req.params;
    const { quantity, reason } = req.body;
    
    const product = dataService.getProductById(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Update product quantity
    const updatedProduct = dataService.updateProduct(internalId, {
      qtyOnHand: product.qtyOnHand + quantity,
      stock: product.stock + quantity
    });
    
    // Mock transaction record
    const transaction = {
      id: Date.now().toString(),
      internalProductId: internalId,
      type: 'ADJUST',
      quantity,
      reason,
      date: new Date().toISOString()
    };
    
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/products/:internalId/aces-applications
 * Get ACES applications for product
 */
router.get('/products/:internalId/aces-applications', (req, res) => {
  try {
    const { internalId } = req.params;
    
    const product = dataService.getProductById(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product.acesApplications || []);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/products/:internalId/aces-applications
 * Create ACES application for product
 */
router.post('/products/:internalId/aces-applications', (req, res) => {
  try {
    const { internalId } = req.params;
    
    const product = dataService.getProductById(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Mock ACES application creation
    const application = {
      id: Date.now().toString(),
      productId: internalId,
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Update product with new application
    const applications = product.acesApplications || [];
    applications.push(application);
    
    dataService.updateProduct(internalId, { acesApplications: applications });
    
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Utility endpoints

/**
 * GET /api/products/:internalId/components
 * Get brand ID and part number components from internal ID
 */
router.get('/products/:internalId/components', async (req, res) => {
  try {
    const { internalId } = req.params;
    
    const product = dataService.getProductById(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({
      internalProductId: internalId,
      brandId: product.brandId,
      partNumber: product.partNumber,
      brand: product.brand,
      productName: product.productName
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;