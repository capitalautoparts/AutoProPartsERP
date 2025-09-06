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

// Get all products
router.get('/', (req, res) => {
  const products = dataService.getAllProducts();
  res.json(products);
});

// Get product by ID
router.get('/:id', (req, res) => {
  const product = dataService.getProductById(req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Create product
router.post('/', (req, res) => {
  try {
    const product = dataService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ error: 'Invalid product data' });
  }
});

// Update product
router.put('/:id', (req, res) => {
  const product = dataService.updateProduct(req.params.id, req.body);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Delete product
router.delete('/:id', (req, res) => {
  const deleted = dataService.deleteProduct(req.params.id);
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