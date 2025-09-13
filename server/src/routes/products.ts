import express from 'express';
import multer from 'multer';
import { dataService } from '../services/dataService.js';
import { jobService } from '../services/jobService.js';
import { ExcelHandler } from '../utils/excelHandler.js';
import { PIESExcelHandler } from '../utils/piesExcelHandler.js';
import { XMLHandler } from '../utils/xmlHandler.js';
import { piesXmlService } from '../services/piesXmlService.js';
import { S3Handler } from '../utils/s3Handler.js';
import { Product } from '../types/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all products with pagination
router.get('/', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 50;
  const offset = parseInt(req.query.offset as string) || 0;
  
  // For current in-memory implementation
  const allProducts = dataService.getAllProducts();
  const products = allProducts.slice(offset, offset + limit);
  const total = allProducts.length;
  const hasMore = offset + limit < total;
  
  res.json({
    products,
    pagination: {
      limit,
      offset,
      total,
      hasMore
    }
  });
});

// Add dedicated internal ID route BEFORE generic :id to avoid route shadowing
router.get('/internal/:internalId', (req, res) => {
  try {
    const { internalId } = req.params;
    if (!dataService.isValidInternalId(internalId)) {
      return res.status(400).json({ 
        error: 'Invalid internal ID format',
        expected: 'BrandID+PartNumber (e.g., JVYDAFF12090511432SMF)'
      });
    }
    const product = dataService.getProductByInternalId(internalId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found by internal ID', internalId });
    }
    res.json(product);
  } catch (error) {
    console.error('Internal ID lookup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Enhanced product lookup route with dual ID support
router.get('/:id', (req, res) => {
  const { id } = req.params;
  
  try {
    // Support both UUID and internal ID formats
    const product = dataService.getProductById(id);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found',
        searchedId: id,
        supportedFormats: [
          'UUID (e.g., 410d4b6a-1aae-407e-8d34-a27211892c58)',
          'Internal ID (e.g., JVYDAFF12090511432SMF)'
        ],
        hint: dataService.isValidUUID(id) 
          ? 'Valid UUID format but product not found'
          : dataService.isValidInternalId(id)
          ? 'Valid internal ID format but product not found'
          : 'Invalid ID format'
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Product lookup error:', error);
    res.status(500).json({ error: 'Internal server error during product lookup' });
  }
});

// (moved earlier)

// Add brand/part number route for structured lookups
router.get('/brand/:brand/part/:partNumber', (req, res) => {
  try {
    const { brand, partNumber } = req.params;
    
    if (!brand || !partNumber) {
      return res.status(400).json({ 
        error: 'Brand and part number are required',
        example: '/api/products/brand/PROBRAND/part/PB-12345'
      });
    }
    
    const product = dataService.getProductByBrandAndPartNumber(brand, partNumber);
    
    if (!product) {
      return res.status(404).json({ 
        error: 'Product not found by brand and part number',
        brand: brand,
        partNumber: partNumber,
        constructedInternalId: `${brand.toUpperCase().replace(/[^A-Z0-9]/g, '')}${partNumber.replace(/[^A-Za-z0-9]/g, '')}`
      });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Brand/part lookup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/', (req, res) => {
  try {
    const product = dataService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid product data' });
  }
});

// Batch lookup products by internal IDs
router.post('/batch-lookup', (req, res) => {
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
    res.status(500).json({ error: 'Batch lookup failed' });
  }
});

// Generate internal ID from brand and part number
router.post('/generate-internal-id', (req, res) => {
  try {
    const { brandId, partNumber } = req.body;
    
    if (!brandId || !partNumber) {
      return res.status(400).json({ error: 'brandId and partNumber are required' });
    }
    
    const internalId = dataService.generateInternalId(brandId, partNumber);
    res.json({ internalId, brandId, partNumber });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : 'ID generation failed' });
  }
});

// Update product (supports both UUID and internal ID)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  
  // Find product first to get internal ID
  const existingProduct = dataService.getProductById(id);
  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const product = dataService.updateProduct(existingProduct.internalProductId, req.body);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Delete product (supports both UUID and internal ID)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  // Find product first to get internal ID
  const existingProduct = dataService.getProductById(id);
  if (!existingProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  const deleted = dataService.deleteProduct(existingProduct.internalProductId);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.status(204).send();
});

// Import products from Excel
router.post('/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3
    const s3Key = S3Handler.generateKey('products', 'imports', req.file.originalname);
    await S3Handler.uploadFile(req.file.buffer, s3Key, req.file.mimetype);

    // Create async job
    const job = jobService.createImportJob('excel', 'products', req.file.originalname, s3Key);

    res.json({
      jobId: job.id,
      status: job.status,
      message: 'Import job created successfully. Processing will begin shortly.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Import job creation failed' });
  }
});

// Import products from XML (ACES/PIES)
router.post('/import/xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to S3
    const s3Key = S3Handler.generateKey('products', 'imports', req.file.originalname);
    await S3Handler.uploadFile(req.file.buffer, s3Key, req.file.mimetype);

    // Create async job
    const job = jobService.createImportJob('xml', 'products', req.file.originalname, s3Key);

    res.json({
      jobId: job.id,
      status: job.status,
      message: 'XML import job created successfully. Processing will begin shortly.'
    });
  } catch (error) {
    res.status(500).json({ error: 'XML import job creation failed' });
  }
});

// Export products to Excel with full PIES data
router.get('/export/excel', async (req, res) => {
  try {
    const products = dataService.getAllProducts();
    const buffer = PIESExcelHandler.exportToExcel(products);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products-pies.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Export failed' });
  }
});

// Export PIES Excel template
router.get('/export/template', async (req, res) => {
  try {
    const buffer = PIESExcelHandler.generateTemplate();
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=pies-template.xlsx');
    res.send(buffer);
  } catch (error) {
    console.error('Template export error:', error);
    res.status(500).json({ error: 'Template export failed' });
  }
});

// Export products to Excel (async job)
router.post('/export/excel', (req, res) => {
  try {
    const job = jobService.createExportJob('excel', 'products');
    
    res.json({
      jobId: job.id,
      status: job.status,
      message: 'Export job created successfully. Processing will begin shortly.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Export job creation failed' });
  }
});

// Export products to XML (PIES format)
router.get('/export/xml', async (req, res) => {
  try {
    const products = dataService.getAllProducts();
    const xmlContent = await piesXmlService.exportToXML(products);
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=products-pies.xml');
    res.send(xmlContent);
  } catch (error) {
    console.error('XML export error:', error);
    res.status(500).json({ error: 'XML export failed' });
  }
});

// Validate PIES XML
router.post('/validate/xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const xmlContent = req.file.buffer.toString('utf8');
    const validation = await piesXmlService.validateXML(xmlContent);
    
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'XML validation failed' });
  }
});

export default router;
