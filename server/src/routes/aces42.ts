import express from 'express';
import multer from 'multer';
import { aces42Service } from '../services/aces42Service';
import { ACES42ExportOptions } from '../types/aces42';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * Import ACES 4.2 XML file
 */
router.post('/import/xml', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const xmlContent = req.file.buffer.toString('utf-8');
    const result = await aces42Service.parseACES42XML(xmlContent);

    res.json(result);
  } catch (error) {
    console.error('ACES 4.2 import error:', error);
    res.status(500).json({ 
      error: 'Failed to import ACES 4.2 XML',
      details: error.message 
    });
  }
});

/**
 * Export ACES 4.2 XML file
 */
router.get('/export/xml', async (req, res) => {
  try {
    const options: ACES42ExportOptions = {
      brandAAIAID: req.query.brandAAIAID as string || 'ZZZZ',
      subBrandAAIAID: req.query.subBrandAAIAID as string,
      submissionType: (req.query.submissionType as 'FULL' | 'INCREMENTAL') || 'FULL',
      effectiveDate: req.query.effectiveDate as string,
      includeAssets: req.query.includeAssets === 'true',
      includeDigitalAssets: req.query.includeDigitalAssets === 'true'
    };

    // Get products with ACES 4.2 applications
    // In a real implementation, this would query your database
    const products = []; // TODO: Implement product retrieval

    const xmlContent = await aces42Service.generateACES42XML(products, options);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="aces_4_2_export.xml"');
    res.send(xmlContent);
  } catch (error) {
    console.error('ACES 4.2 export error:', error);
    res.status(500).json({ 
      error: 'Failed to export ACES 4.2 XML',
      details: error.message 
    });
  }
});

/**
 * Validate ACES 4.2 XML file
 */
router.post('/validate', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const xmlContent = req.file.buffer.toString('utf-8');
    const result = await aces42Service.parseACES42XML(xmlContent);

    // Return validation results
    res.json({
      valid: result.success,
      applicationsFound: result.applicationsProcessed,
      assetsFound: result.assetsProcessed,
      digitalAssetsFound: result.digitalAssetsProcessed,
      errors: result.errors,
      warnings: result.warnings
    });
  } catch (error) {
    console.error('ACES 4.2 validation error:', error);
    res.status(500).json({ 
      error: 'Failed to validate ACES 4.2 XML',
      details: error.message 
    });
  }
});

export default router;