import express from 'express';
import { databaseExtractor } from '../services/databaseExtractor.js';

const router = express.Router();

// Test ZIP extraction
router.get('/test-extraction', async (req, res) => {
  try {
    console.log('🧪 Testing database extraction...');
    
    const results = {
      vcdb: await databaseExtractor.extractVCdbData(),
      pcdb: await databaseExtractor.extractPCdbData(),
      padb: await databaseExtractor.extractPAdbData(),
      qdb: await databaseExtractor.extractQdbData(),
      brandTable: await databaseExtractor.extractBrandTableData()
    };

    const summary = {
      vcdb: results.vcdb.length,
      pcdb: results.pcdb.length,
      padb: results.padb.length,
      qdb: results.qdb.length,
      brandTable: results.brandTable.length,
      sampleData: {
        vcdb: results.vcdb.slice(0, 3),
        pcdb: results.pcdb.slice(0, 3),
        padb: results.padb.slice(0, 3),
        qdb: results.qdb.slice(0, 3),
        brandTable: results.brandTable.slice(0, 3)
      }
    };

    res.json(summary);
  } catch (error) {
    console.error('Database extraction test failed:', error);
    res.status(500).json({ 
      error: 'Database extraction failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get vehicle data specifically
router.get('/vehicle-data', async (req, res) => {
  try {
    const vehicleData = await databaseExtractor.extractVehicleData();
    res.json({
      count: vehicleData.length,
      sample: vehicleData.slice(0, 10)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to extract vehicle data' });
  }
});

router.get('/tables', async (req, res) => {
  try {
    const records = await databaseExtractor.extractVCdbData();
    const tables = [...new Set(records.map(r => r.table))].sort();
    const tableCounts = {};
    
    tables.forEach(table => {
      tableCounts[table] = records.filter(r => r.table === table).length;
    });
    
    res.json({
      totalRecords: records.length,
      tableCount: tables.length,
      tables: tableCounts
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get tables' });
  }
});

router.get('/sample-data', async (req, res) => {
  try {
    const records = await databaseExtractor.extractVCdbData();
    
    const make = records.find(r => r.table === 'Make');
    const model = records.find(r => r.table === 'Model');
    const baseVehicle = records.find(r => r.table === 'BaseVehicle');
    
    res.json({
      make: make ? make.data : null,
      model: model ? model.data : null,
      baseVehicle: baseVehicle ? baseVehicle.data : null
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sample data' });
  }
});

export default router;