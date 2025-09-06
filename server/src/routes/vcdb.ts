import express from 'express';
import { fullVcdbService } from '../services/fullVcdbService';
import { pcdbPadbService } from '../services/pcdbPadbService';
import { qdbBrandService } from '../services/qdbBrandService';

const router = express.Router();

router.get('/makes', (req, res) => {
  const makes = fullVcdbService.getAllMakes();
  res.json(makes);
});

router.get('/models', (req, res) => {
  const models = fullVcdbService.getAllModels();
  res.json(models);
});

router.get('/submodels', (req, res) => {
  const subModels = fullVcdbService.getAllSubModels();
  res.json(subModels);
});

router.get('/enginebases', (req, res) => {
  const engineBases = fullVcdbService.getAllEngineBases();
  res.json(engineBases);
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
  const transmissionTypes = fullVcdbService.getAllTransmissionTypes();
  res.json(transmissionTypes);
});

router.get('/bodytypes', (req, res) => {
  const bodyTypes = fullVcdbService.getAllBodyTypes();
  res.json(bodyTypes);
});

router.get('/fueltypes', (req, res) => {
  const fuelTypes = fullVcdbService.getAllFuelTypes();
  res.json(fuelTypes);
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
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = 1980; year <= currentYear + 2; year++) {
    years.push(year);
  }
  res.json(years);
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

export default router;