import express from 'express';
import multer from 'multer';
import { dataService } from '../services/dataService.js';
import { ExcelHandler } from '../utils/excelHandler.js';
import { XMLHandler } from '../utils/xmlHandler.js';
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

    const data = ExcelHandler.parseExcelFile(req.file.buffer);
    const requiredFields = ['partNumber', 'productName', 'brand', 'manufacturer'];
    const validation = ExcelHandler.validateImportData(data, requiredFields);

    if (!validation.success) {
      return res.status(400).json(validation);
    }

    // Process the data (in production, this would be async)
    let imported = 0;
    data.forEach(row => {
      try {
        const product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
          manufacturer: row.manufacturer || '',
          brand: row.brand || '',
          partNumber: row.partNumber || '',
          sku: row.sku || row.partNumber || '',
          productName: row.productName || '',
          shortDescription: row.shortDescription || '',
          longDescription: row.longDescription || '',
          stock: parseInt(row.stock) || 0,
          unitType: row.unitType || 'Each',
          qtyOnHand: parseInt(row.qtyOnHand) || 0
        };
        dataService.createProduct(product);
        imported++;
      } catch (error) {
        console.error('Error importing product:', error);
      }
    });

    res.json({
      success: true,
      recordsProcessed: imported,
      errors: [],
      warnings: []
    });
  } catch (error) {
    res.status(500).json({ error: 'Import failed' });
  }
});

// Import products from XML (ACES/PIES)
router.post('/import/xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const xmlData = await XMLHandler.parseXMLFile(req.file.buffer);
    
    // Determine if it's ACES or PIES XML
    let validation;
    if (xmlData.ACES) {
      validation = XMLHandler.validateACESXML(xmlData);
    } else if (xmlData.PIES) {
      validation = XMLHandler.validatePIESXML(xmlData);
    } else {
      return res.status(400).json({ 
        error: 'Invalid XML format. Expected ACES or PIES XML.' 
      });
    }

    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'XML import failed' });
  }
});

// Export products to Excel
router.get('/export/excel', (req, res) => {
  try {
    const products = dataService.getAllProducts();
    const buffer = ExcelHandler.createExcelFile(products, 'products.xlsx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// Export products to XML (PIES format)
router.get('/export/xml', (req, res) => {
  try {
    const products = dataService.getAllProducts();
    
    // Convert products to PIES XML format
    const piesData = {
      PIES: {
        $: { version: '7.2' },
        Header: {
          PIESVersion: '7.2',
          SubmissionType: 'FULL',
          BuyerName: 'Auto Parts ERP',
          SupplierName: 'Auto Parts ERP'
        },
        Items: {
          Item: products.map(product => ({
            $: { MaintenanceType: 'A' },
            PartNumber: product.partNumber,
            BrandAAIAID: product.brand,
            BrandLabel: product.brand,
            PartTerminologyID: '1234',
            Descriptions: {
              Description: {
                $: { MaintenanceType: 'A', LanguageCode: 'EN', DescriptionCode: 'SHO' },
                _: product.shortDescription
              }
            }
          }))
        }
      }
    };

    const xmlString = XMLHandler.createXMLFile(piesData, 'PIES');
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xml');
    res.send(xmlString);
  } catch (error) {
    res.status(500).json({ error: 'XML export failed' });
  }
});

export default router;