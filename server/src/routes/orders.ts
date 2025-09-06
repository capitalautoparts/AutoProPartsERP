import express from 'express';
import multer from 'multer';
import { dataService } from '../services/dataService.js';
import { ExcelHandler } from '../utils/excelHandler.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get all orders
router.get('/', (req, res) => {
  const orders = dataService.getAllOrders();
  res.json(orders);
});

// Get order by ID
router.get('/:id', (req, res) => {
  const order = dataService.getOrderById(req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  res.json(order);
});

// Create order
router.post('/', (req, res) => {
  try {
    const order = dataService.createOrder(req.body);
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ error: 'Invalid order data' });
  }
});

// Import orders from Excel
router.post('/import/excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const data = ExcelHandler.parseExcelFile(req.file.buffer);
    const requiredFields = ['orderNumber', 'customerId'];
    const validation = ExcelHandler.validateImportData(data, requiredFields);

    res.json({
      success: true,
      recordsProcessed: data.length,
      errors: [],
      warnings: ['Order import functionality will be implemented with full business logic']
    });
  } catch (error) {
    res.status(500).json({ error: 'Import failed' });
  }
});

// Export orders to Excel
router.get('/export/excel', (req, res) => {
  try {
    const orders = dataService.getAllOrders();
    const buffer = ExcelHandler.createExcelFile(orders, 'orders.xlsx');
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=orders.xlsx');
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

export default router;