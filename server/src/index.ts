import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import customersRouter from './routes/customers.js';
import ordersRouter from './routes/orders.js';

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Auto Parts ERP API is running',
    timestamp: new Date().toISOString()
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

app.listen(PORT, () => {
  console.log(`🚀 Auto Parts ERP Server running on port ${PORT}`);
  console.log(`📊 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🔧 Products API: http://localhost:${PORT}/api/products`);
  console.log(`👥 Customers API: http://localhost:${PORT}/api/customers`);
  console.log(`📦 Orders API: http://localhost:${PORT}/api/orders`);
});