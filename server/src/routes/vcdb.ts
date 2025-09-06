import express from 'express';
import { vcdbService } from '../services/vcdbService';

const router = express.Router();

router.get('/makes', (req, res) => {
  const makes = vcdbService.getAllMakes();
  res.json(makes);
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
  // PCdb data - essential part types
  const partTypes = [
    { id: 5340, name: 'Engine Oil Filter' },
    { id: 1896, name: 'Disc Brake Rotor' },
    { id: 4472, name: 'Headlight Switch' },
    { id: 4188, name: 'Starter Solenoid' },
    { id: 10068, name: 'Radiator Coolant Hose' }
  ];
  res.json(partTypes);
});

router.get('/positions', (req, res) => {
  // PAdb data - common positions
  const positions = [
    { id: 22, name: 'Front' },
    { id: 30, name: 'Rear' },
    { id: 46, name: 'Upper' },
    { id: 47, name: 'Lower' },
    { id: 48, name: 'Left' },
    { id: 49, name: 'Right' }
  ];
  res.json(positions);
});

router.get('/qualifiers', (req, res) => {
  // Qdb data - common qualifiers
  const qualifiers = [
    { id: 12877, name: 'With A/C' },
    { id: 945, name: '1st Design' },
    { id: 14031, name: 'With Dual Exhaust' },
    { id: 3368, name: 'Except California Built' },
    { id: 8101, name: 'Replaces Both Front & Rear OE Converters' }
  ];
  res.json(qualifiers);
});

router.get('/brands', (req, res) => {
  // Brand table data
  const brands = [
    { id: 'ZZZZ', name: 'Generic Brand' },
    { id: 'FORD', name: 'Ford Motor Company' },
    { id: 'CHEV', name: 'General Motors' },
    { id: 'TOYO', name: 'Toyota Motor Corporation' },
    { id: 'HOND', name: 'Honda Motor Company' }
  ];
  res.json(brands);
});

export default router;