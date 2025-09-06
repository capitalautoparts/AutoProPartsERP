import express from 'express';
import multer from 'multer';
import { dataService } from '../services/dataService.js';
import { ExcelHandler } from '../utils/excelHandler.js';
import { Customer } from '../types/index.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all customers
router.get('/', (req, res) => {
  const customers = dataService.getAllCustomers();
  res.json(customers);
});

// Get customer by ID
router.get('/:id', (req, res) => {
  const customer = dataService.getCustomerById(req.params.id);
  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }
  res.json(customer);
});

// Create customer
router.post('/', (req, res) => {
  try {
    const customer = dataService.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: 'Invalid customer data' });
  }
});

// Import customers from Excel
router.post('/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = ExcelHandler.parseExcelFile(req.file.buffer);
    const requiredFields = ['name', 'email'];
    const validation = ExcelHandler.validateImportData(data, requiredFields);

    if (!validation.success) {
      return res.status(400).json(validation);
    }

    let imported = 0;
    data.forEach(row => {
      try {
        const customer: Omit<Customer, 'id'> = {
          name: row.name || '',
          email: row.email || '',
          phone: row.phone || '',
          address: row.address || '',
          type: (row.type === 'B2B' || row.type === 'B2C') ? row.type : 'B2C',
          status: (row.status === 'active' || row.status === 'inactive') ? row.status : 'active'
        };
        dataService.createCustomer(customer);
        imported++;
      } catch (error) {
        console.error('Error importing customer:', error);
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

// Export customers to Excel
router.get('/export/excel', (req, res) => {
  try {
    const customers = dataService.getAllCustomers();
    const buffer = ExcelHandler.createExcelFile(customers, 'customers.xlsx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=customers.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;