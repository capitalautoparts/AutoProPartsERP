import express from 'express';
import { acesServiceCorrected } from '../services/acesService-corrected.js';

const router = express.Router();

// CORRECTED ACES Builder Endpoints

// Get all years
router.get('/years', async (req, res) => {
  try {
    const years = await acesServiceCorrected.getYears();
    res.json(years);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load years' });
  }
});

// Get all makes (not filtered by year - BaseVehicle handles validation)
router.get('/makes', async (req, res) => {
  try {
    const makes = await acesServiceCorrected.getMakes();
    res.json(makes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load makes' });
  }
});

// Get all models (not filtered - BaseVehicle handles validation)
router.get('/models', async (req, res) => {
  try {
    const models = await acesServiceCorrected.getModels();
    res.json(models);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load models' });
  }
});

// CRITICAL: Get BaseVehicles by Year/Make/Model
router.get('/basevehicles/:yearId/:makeId/:modelId', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    const makeId = parseInt(req.params.makeId);
    const modelId = parseInt(req.params.modelId);
    
    const baseVehicles = await acesServiceCorrected.getBaseVehiclesByYMM(yearId, makeId, modelId);
    res.json(baseVehicles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load base vehicles' });
  }
});

// Get SubModels for BaseVehicle
router.get('/submodels/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const subModels = await acesServiceCorrected.getSubModelsByBaseVehicle(baseVehicleId);
    res.json(subModels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load submodels' });
  }
});

// Get Engine Configs for BaseVehicle
router.get('/engine-configs/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const engineConfigs = await acesServiceCorrected.getEngineConfigsByBaseVehicle(baseVehicleId);
    res.json(engineConfigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load engine configs' });
  }
});

// Get Engine Bases for BaseVehicle
router.get('/engine-bases/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const engineBases = await acesServiceCorrected.getEngineBasesByBaseVehicle(baseVehicleId);
    res.json(engineBases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load engine bases' });
  }
});

// Get Transmissions for BaseVehicle
router.get('/transmissions/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const transmissions = await acesServiceCorrected.getTransmissionsByBaseVehicle(baseVehicleId);
    res.json(transmissions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transmissions' });
  }
});

// ACES 4.2 Equipment endpoints
router.get('/equipment/models', async (req, res) => {
  try {
    const equipmentModels = await acesServiceCorrected.getEquipmentModels();
    res.json(equipmentModels);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load equipment models' });
  }
});

router.get('/equipment/base', async (req, res) => {
  try {
    const equipmentBase = await acesServiceCorrected.getEquipmentBase();
    res.json(equipmentBase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load equipment base' });
  }
});

router.get('/vehicle-types', async (req, res) => {
  try {
    const vehicleTypes = await acesServiceCorrected.getVehicleTypes();
    res.json(vehicleTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load vehicle types' });
  }
});

router.get('/manufacturers', async (req, res) => {
  try {
    const manufacturers = await acesServiceCorrected.getManufacturers();
    res.json(manufacturers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load manufacturers' });
  }
});

// Validation endpoint
router.get('/validate/:yearId/:makeId/:modelId', async (req, res) => {
  try {
    const yearId = parseInt(req.params.yearId);
    const makeId = parseInt(req.params.makeId);
    const modelId = parseInt(req.params.modelId);
    
    const isValid = await acesServiceCorrected.validateBaseVehicleCombination(yearId, makeId, modelId);
    res.json({ valid: isValid });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate combination' });
  }
});

// Reference data endpoints
router.get('/part-types', async (req, res) => {
  try {
    const partTypes = await acesServiceCorrected.getPartTypes();
    res.json(partTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load part types' });
  }
});

router.get('/positions', async (req, res) => {
  try {
    const positions = await acesServiceCorrected.getPositions();
    res.json(positions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load positions' });
  }
});

router.get('/qualifiers', async (req, res) => {
  try {
    const qualifiers = await acesServiceCorrected.getQualifiers();
    res.json(qualifiers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load qualifiers' });
  }
});

// Additional component endpoints
router.get('/brake-configs/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const brakeConfigs = await acesServiceCorrected.getBrakeConfigsByBaseVehicle(baseVehicleId);
    res.json(brakeConfigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load brake configs' });
  }
});

router.get('/body-configs/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const bodyConfigs = await acesServiceCorrected.getBodyConfigsByBaseVehicle(baseVehicleId);
    res.json(bodyConfigs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load body configs' });
  }
});

router.get('/drive-types/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const driveTypes = await acesServiceCorrected.getDriveTypesByBaseVehicle(baseVehicleId);
    res.json(driveTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load drive types' });
  }
});

// Reference data endpoints
router.get('/engine-vins', async (req, res) => {
  try {
    const engineVINs = await acesServiceCorrected.getEngineVINs();
    res.json(engineVINs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load engine VINs' });
  }
});

router.get('/aspirations', async (req, res) => {
  try {
    const aspirations = await acesServiceCorrected.getAspirations();
    res.json(aspirations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load aspirations' });
  }
});

router.get('/fuel-types', async (req, res) => {
  try {
    const fuelTypes = await acesServiceCorrected.getFuelTypes();
    res.json(fuelTypes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load fuel types' });
  }
});

router.get('/brake-systems', async (req, res) => {
  try {
    const brakeSystems = await acesServiceCorrected.getBrakeSystems();
    res.json(brakeSystems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load brake systems' });
  }
});

// New reference data endpoints
router.get('/vehicle-groups', async (req, res) => {
  try {
    const groups = await acesServiceCorrected.getVehicleGroups();
    res.json(groups);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load vehicle groups' });
  }
});

router.get('/regions', async (req, res) => {
  try {
    const regions = await acesServiceCorrected.getRegions();
    res.json(regions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load regions' });
  }
});

router.get('/vehicle-classes', async (req, res) => {
  try {
    const classes = await acesServiceCorrected.getVehicleClasses();
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load vehicle classes' });
  }
});

// Engine and Transmission reference data
router.get('/engine-reference/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const engineData = await acesServiceCorrected.getEngineReferenceData(baseVehicleId);
    res.json(engineData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load engine reference data' });
  }
});

// Get specific engine specs by BaseVehicle and Liter
router.get('/engine-specs/:baseVehicleId/:liter', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const liter = req.params.liter;
    const engineSpecs = await acesServiceCorrected.getEngineSpecsByLiter(baseVehicleId, liter);
    res.json(engineSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load engine specs' });
  }
});

router.get('/transmission-reference/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const transData = await acesServiceCorrected.getTransmissionReferenceData(baseVehicleId);
    res.json(transData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transmission reference data' });
  }
});

// Get specific transmission specs by BaseVehicle and Type
router.get('/transmission-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const transSpecs = await acesServiceCorrected.getTransmissionSpecsByType(baseVehicleId, type);
    res.json(transSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load transmission specs' });
  }
});

router.get('/vehicle-systems-reference/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const systemsData = await acesServiceCorrected.getVehicleSystemsReferenceData(baseVehicleId);
    res.json(systemsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load vehicle systems reference data' });
  }
});

// Get specific brake specs by BaseVehicle and Type
router.get('/brake-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const brakeSpecs = await acesServiceCorrected.getBrakeSpecsByType(baseVehicleId, type);
    res.json(brakeSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load brake specs' });
  }
});

router.get('/physical-specs-reference/:baseVehicleId', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const specsData = await acesServiceCorrected.getPhysicalSpecsReferenceData(baseVehicleId);
    res.json(specsData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load physical specs reference data' });
  }
});

// Get specific body specs by BaseVehicle and Type
router.get('/body-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const bodySpecs = await acesServiceCorrected.getBodySpecsByType(baseVehicleId, type);
    res.json(bodySpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load body specs' });
  }
});

router.get('/pcdb-reference', async (req, res) => {
  try {
    const pcdbData = await acesServiceCorrected.getPCdbReferenceData();
    res.json(pcdbData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load PCdb reference data' });
  }
});

// PCdb relationship helpers for Item tab
router.get('/pcdb/categories', async (req, res) => {
  try {
    const categories = await acesServiceCorrected.getPCdbCategories();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

router.get('/pcdb/subcategories', async (req, res) => {
  try {
    const { categoryId } = req.query as { categoryId?: string };
    const subcategories = await acesServiceCorrected.getPCdbSubcategories(categoryId);
    res.json(subcategories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load subcategories' });
  }
});

router.get('/pcdb/part-types', async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.query as { categoryId?: string; subCategoryId?: string };
    const parts = await acesServiceCorrected.getPCdbPartTypes({ categoryId, subCategoryId });
    res.json(parts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load part types' });
  }
});

router.get('/pcdb/category-for-subcategory/:subCategoryId', async (req, res) => {
  try {
    const { subCategoryId } = req.params;
    const category = await acesServiceCorrected.getPCdbCategoryForSubcategory(subCategoryId);
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve category' });
  }
});

router.get('/pcdb/subcategory-for-part/:partTerminologyId', async (req, res) => {
  try {
    const { partTerminologyId } = req.params;
    const subCategory = await acesServiceCorrected.getPCdbSubcategoryForPart(partTerminologyId);
    res.json(subCategory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to resolve subcategory' });
  }
});

// Get specific part specs by Category and Type
router.get('/part-specs/:category/:partType', async (req, res) => {
  try {
    const category = req.params.category;
    const partType = req.params.partType;
    const partSpecs = await acesServiceCorrected.getPartSpecsByType(category, partType);
    res.json(partSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load part specs' });
  }
});

// Get specific drive specs by BaseVehicle and Type
router.get('/drive-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const driveSpecs = await acesServiceCorrected.getDriveSpecsByType(baseVehicleId, type);
    res.json(driveSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load drive specs' });
  }
});

// Get specific spring specs by BaseVehicle and Type
router.get('/spring-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const springSpecs = await acesServiceCorrected.getSpringSpecsByType(baseVehicleId, type);
    res.json(springSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load spring specs' });
  }
});

// Get specific steering specs by BaseVehicle and Type
router.get('/steering-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const steeringSpecs = await acesServiceCorrected.getSteeringSpecsByType(baseVehicleId, type);
    res.json(steeringSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load steering specs' });
  }
});

// Get specific wheelbase specs by BaseVehicle and Value
router.get('/wheelbase-specs/:baseVehicleId/:value', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const value = req.params.value;
    const wheelbaseSpecs = await acesServiceCorrected.getWheelbaseSpecsByValue(baseVehicleId, value);
    res.json(wheelbaseSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load wheelbase specs' });
  }
});

// Get specific bed specs by BaseVehicle and Type
router.get('/bed-specs/:baseVehicleId/:type', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const type = req.params.type;
    const bedSpecs = await acesServiceCorrected.getBedSpecsByType(baseVehicleId, type);
    res.json(bedSpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load bed specs' });
  }
});

// Get specific manufacturer body code specs by BaseVehicle and Code
router.get('/mfrbody-specs/:baseVehicleId/:code', async (req, res) => {
  try {
    const baseVehicleId = parseInt(req.params.baseVehicleId);
    const code = req.params.code;
    const mfrBodySpecs = await acesServiceCorrected.getMfrBodySpecsByCode(baseVehicleId, code);
    res.json(mfrBodySpecs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load manufacturer body specs' });
  }
});

router.post('/validate-application', async (req, res) => {
  try {
    const validation = await acesServiceCorrected.validateApplication(req.body);
    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate application' });
  }
});

router.post('/export-xml', async (req, res) => {
  try {
    const xml = await acesServiceCorrected.exportApplicationsToXML(req.body.applications);
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', 'attachment; filename="aces-applications.xml"');
    res.send(xml);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export XML' });
  }
});

export default router;
