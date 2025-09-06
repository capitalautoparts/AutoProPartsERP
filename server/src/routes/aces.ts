import express from 'express';
import { acesService } from '../services/acesService.js';

const router = express.Router();

// Get all years
router.get('/years', async (req, res) => {
  try {
    const years = await acesService.getYears();
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load years' });
  }
});

// Get makes by year
router.get('/makes/:year', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const makes = await acesService.getMakesByYear(year);
    res.json(makes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load makes' });
  }
});

// Get models by year and make
router.get('/models/:year/:make', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const make = req.params.make;
    const models = await acesService.getModelsByYearMake(year, make);
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load models' });
  }
});

// Get sub-models by year, make, and model
router.get('/submodels/:year/:make/:model', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const make = req.params.make;
    const model = req.params.model;
    const subModels = await acesService.getSubModelsByYearMakeModel(year, make, model);
    res.json(subModels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load sub-models' });
  }
});

// Get engines by year, make, and model
router.get('/engines/:year/:make/:model', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const make = req.params.make;
    const model = req.params.model;
    const engines = await acesService.getEnginesByYearMakeModel(year, make, model);
    res.json(engines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load engines' });
  }
});

export default router;