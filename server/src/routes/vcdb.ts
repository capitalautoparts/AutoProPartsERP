import express from 'express';
import { fullVcdbService } from '../services/fullVcdbService';
import { pcdbPadbService } from '../services/pcdbPadbService';
import { qdbBrandService } from '../services/qdbBrandService';

const router = express.Router();

router.get('/makes', (req, res) => {
  try {
    const { year, modelId } = req.query;
    const makes = fullVcdbService.getAvailableMakes(
      year ? parseInt(year) : undefined,
      modelId ? parseInt(modelId) : undefined
    );
    res.json(makes);
  } catch (error) {
    console.error('Makes endpoint error:', error);
    // Fallback to all makes
    const makes = fullVcdbService.getAllMakes();
    res.json(makes.slice(0, 20));
  }
});

router.get('/models', (req, res) => {
  try {
    const { year, makeId } = req.query;
    const models = fullVcdbService.getAvailableModels(
      year ? parseInt(year) : undefined,
      makeId ? parseInt(makeId) : undefined
    );
    res.json(models);
  } catch (error) {
    console.error('Models endpoint error:', error);
    // Fallback to all models
    const models = fullVcdbService.getAllModels();
    res.json(models.slice(0, 50));
  }
});

router.get('/submodels', (req, res) => {
  const { baseVehicleId } = req.query;
  if (baseVehicleId) {
    const subModels = fullVcdbService.getSubModelsForBaseVehicle(parseInt(baseVehicleId));
    res.json(subModels);
  } else {
    const subModels = fullVcdbService.getAllSubModels();
    res.json(subModels.slice(0, 20));
  }
});

router.get('/enginebases', (req, res) => {
  const { baseVehicleId } = req.query;
  if (baseVehicleId) {
    const engines = fullVcdbService.getEnginesForBaseVehicle(parseInt(baseVehicleId));
    res.json(engines);
  } else {
    const engines = fullVcdbService.getAllEngineBases();
    res.json(engines.slice(0, 20));
  }
});

router.get('/engineblocks', (req, res) => {
  const engineBlocks = fullVcdbService.getAllEngineBlocks();
  res.json(engineBlocks);
});

router.get('/enginevins', (req, res) => {
  const engineVINs = fullVcdbService.getAllEngineVINs();
  res.json(engineVINs);
});

router.get('/drivetypes', (req, res) => {
  const driveTypes = fullVcdbService.getAllDriveTypes();
  res.json(driveTypes);
});

router.get('/transmissiontypes', (req, res) => {
  const { baseVehicleId } = req.query;
  if (baseVehicleId) {
    const transmissions = fullVcdbService.getTransmissionsForBaseVehicle(parseInt(baseVehicleId));
    res.json(transmissions);
  } else {
    const transmissions = fullVcdbService.getAllTransmissionTypes();
    res.json(transmissions.slice(0, 10));
  }
});

router.get('/bodytypes', (req, res) => {
  const { baseVehicleId } = req.query;
  if (baseVehicleId) {
    const bodyTypes = fullVcdbService.getBodyTypesForBaseVehicle(parseInt(baseVehicleId));
    res.json(bodyTypes);
  } else {
    const bodyTypes = fullVcdbService.getAllBodyTypes();
    res.json(bodyTypes.slice(0, 10));
  }
});

router.get('/fueltypes', (req, res) => {
  const { baseVehicleId } = req.query;
  if (baseVehicleId) {
    const fuelTypes = fullVcdbService.getFuelTypesForBaseVehicle(parseInt(baseVehicleId));
    res.json(fuelTypes);
  } else {
    const fuelTypes = fullVcdbService.getAllFuelTypes();
    res.json(fuelTypes.slice(0, 5));
  }
});

router.get('/aspirations', (req, res) => {
  const aspirations = fullVcdbService.getAllAspirations();
  res.json(aspirations);
});

router.get('/vehicletypes', (req, res) => {
  const vehicleTypes = fullVcdbService.getAllVehicleTypes();
  res.json(vehicleTypes);
});

router.get('/manufacturers', (req, res) => {
  const manufacturers = fullVcdbService.getAllManufacturers();
  res.json(manufacturers);
});

router.get('/equipmentmodels', (req, res) => {
  const equipmentModels = fullVcdbService.getAllEquipmentModels();
  res.json(equipmentModels);
});

router.get('/years', (req, res) => {
  try {
    const { makeId, modelId } = req.query;
    const years = fullVcdbService.getAvailableYears(
      makeId ? parseInt(makeId) : undefined,
      modelId ? parseInt(modelId) : undefined
    );
    res.json(years.map(year => ({ id: year, name: year.toString() })));
  } catch (error) {
    console.error('Years endpoint error:', error);
    // Fallback to static years
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = 1980; year <= currentYear + 2; year++) {
      years.push({ id: year, name: year.toString() });
    }
    res.json(years);
  }
});

router.get('/basevehicles', (req, res) => {
  const { year, makeId, modelId } = req.query;
  const baseVehicles = fullVcdbService.findBaseVehiclesByYearMakeModel(
    year ? parseInt(year) : undefined,
    makeId ? parseInt(makeId) : undefined,
    modelId ? parseInt(modelId) : undefined
  );
  res.json(baseVehicles);
});

router.get('/parttypes', (req, res) => {
  const partTypes = pcdbPadbService.getAllPartTypes();
  res.json(partTypes);
});

router.get('/categories', (req, res) => {
  const categories = pcdbPadbService.getAllCategories();
  res.json(categories);
});

router.get('/subcategories', (req, res) => {
  const subcategories = pcdbPadbService.getAllSubcategories();
  res.json(subcategories);
});

router.get('/partattributes', (req, res) => {
  const partAttributes = pcdbPadbService.getAllPartAttributes();
  res.json(partAttributes);
});

router.get('/validvalues', (req, res) => {
  const validValues = pcdbPadbService.getAllValidValues();
  res.json(validValues);
});

router.get('/measurementgroups', (req, res) => {
  const measurementGroups = pcdbPadbService.getAllMeasurementGroups();
  res.json(measurementGroups);
});

router.get('/positions', (req, res) => {
  const positions = pcdbPadbService.getAllPositions();
  res.json(positions);
});

router.get('/qualifiers', (req, res) => {
  const qualifiers = qdbBrandService.getAllQualifiers();
  res.json(qualifiers);
});

router.get('/qualifiertypes', (req, res) => {
  const qualifierTypes = qdbBrandService.getAllQualifierTypes();
  res.json(qualifierTypes);
});

router.get('/qualifiergroups', (req, res) => {
  const qualifierGroups = qdbBrandService.getAllQualifierGroups();
  res.json(qualifierGroups);
});

router.get('/brands', (req, res) => {
  const brands = qdbBrandService.getAllBrands();
  res.json(brands);
});

// Debug endpoint for 2005 Dodge Ram 1500 (BaseVehicleID 18253)
router.get('/debug/ram1500', (req, res) => {
  const baseVehicleId = 18253; // 2005 Dodge Ram 1500
  const debugData = fullVcdbService.getDebugDataForBaseVehicle(baseVehicleId);
  res.json(debugData);
});

export default router;