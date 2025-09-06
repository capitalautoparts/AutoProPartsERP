import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import ordersRouter from './routes/orders.js';
import jobsRouter from './routes/jobs.js';
import acesRouter from './routes/aces.js';

import databaseRouter from './routes/database.js';
import debugRouter from './routes/debug.js';
import referenceRouter from './routes/reference.js';
import vcdbRouter from './routes/vcdb.js';
import { dataService } from './services/dataService.js';
import { vcdbService } from './services/vcdbService.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/products', productsRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/jobs', jobsRouter);
app.use('/api/aces', acesRouter);

app.use('/api/database', databaseRouter);
app.use('/api/debug', debugRouter);
app.use('/api/reference', referenceRouter);
app.use('/api/vcdb', vcdbRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auto Parts ERP API is running',
    timestamp: new Date().toISOString(),
    productsLoaded: dataService.getAllProducts().length
  });
});

// Generic routes for other ERP modules (placeholder)
const modules = ['marketing', 'accounting', 'purchasing', 'warehouse'];

modules.forEach(module => {
  app.get(`/api/${module}`, (req, res) => {
    res.json({ 
      message: `${module.charAt(0).toUpperCase() + module.slice(1)} module API`,
      features: ['Excel import/export', 'CRUD operations', 'Async processing']
    });
  });
  
  app.get(`/api/${module}/export/excel`, (req, res) => {
    res.json({ 
      message: `${module} Excel export endpoint - Feature coming soon!` 
    });
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize data and start server
async function startServer() {
  try {
    console.log('🚀 Starting Auto Parts ERP Server...');
    console.log('📊 Initializing PIES/ACES data...');
    
    // Data service initialization happens in constructor
    // Give it a moment to complete async initialization
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const productCount = dataService.getAllProducts().length;
    console.log(`✅ Loaded ${productCount} products with PIES/ACES data`);
    
    // Test VCdb loading
    const makes = vcdbService.getAllMakes();
    console.log(`📊 VCdb makes loaded: ${makes.length}`);
    if (makes.length > 0) {
      console.log(`📊 Sample makes: ${makes.slice(0, 3).map(m => m.name).join(', ')}`);
    }
    
    app.listen(PORT, () => {
      console.log(`🚀 Auto Parts ERP Server running on port ${PORT}`);
      console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
      console.log(`🔧 Products API: http://localhost:${PORT}/api/products`);
      console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
      console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();