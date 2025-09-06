import express from 'express';
import { pcdbService } from '../services/pcdbService.js';
import { padbService } from '../services/padbService.js';
import { brandTableService } from '../services/brandTableService.js';

const router = express.Router();

// PCdb - Product Categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await pcdbService.getCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

// PAdb - Product Attributes  
router.get('/attributes', async (req, res) => {
  try {
    const attributes = await padbService.getAttributes();
    res.json(attributes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load attributes' });
  }
});

// BrandTable - Brand Information
router.get('/brands', async (req, res) => {
  try {
    const brands = await brandTableService.getBrands();
    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load brands' });
  }
});

router.get('/brands/:brandId', async (req, res) => {
  try {
    const brand = await brandTableService.getBrandById(req.params.brandId);
    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }
    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load brand' });
  }
});

export default router;