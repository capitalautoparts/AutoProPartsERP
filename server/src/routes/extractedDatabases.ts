import express from 'express';
import { extractedDatabaseService } from '../services/extractedDatabaseService.js';

const router = express.Router();

// Get all databases overview
router.get('/', async (req, res) => {
  try {
    const databases = extractedDatabaseService.getAllDatabases();
    const summary = databases.map(db => ({
      name: db.name,
      tableCount: db.tables.length,
      totalRows: db.totalRows,
      tables: db.tables.map(t => ({ name: t.name, rowCount: t.rowCount }))
    }));
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load databases' });
  }
});

// VCdb Routes
router.get('/vcdb', async (req, res) => {
  try {
    const vcdb = extractedDatabaseService.getDatabase('VCdb');
    if (!vcdb) return res.status(404).json({ error: 'VCdb not found' });
    
    res.json({
      name: vcdb.name,
      tableCount: vcdb.tables.length,
      totalRows: vcdb.totalRows,
      tables: vcdb.tables.map(t => ({ name: t.name, rowCount: t.rowCount, headers: t.headers }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load VCdb' });
  }
});

router.get('/vcdb/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit, search, field } = req.query;
    
    let data;
    if (search) {
      data = extractedDatabaseService.searchTable('VCdb', tableName, search as string, field as string);
    } else {
      data = extractedDatabaseService.getTableData('VCdb', tableName, limit ? parseInt(limit as string) : undefined);
    }
    
    const table = extractedDatabaseService.getTable('VCdb', tableName);
    res.json({
      tableName,
      headers: table?.headers || [],
      rowCount: table?.rowCount || 0,
      data
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to load VCdb table: ${req.params.tableName}` });
  }
});

// PCdb Routes
router.get('/pcdb', async (req, res) => {
  try {
    const pcdb = extractedDatabaseService.getDatabase('PCdb');
    if (!pcdb) return res.status(404).json({ error: 'PCdb not found' });
    
    res.json({
      name: pcdb.name,
      tableCount: pcdb.tables.length,
      totalRows: pcdb.totalRows,
      tables: pcdb.tables.map(t => ({ name: t.name, rowCount: t.rowCount, headers: t.headers }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load PCdb' });
  }
});

router.get('/pcdb/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit, search, field } = req.query;
    
    let data;
    if (search) {
      data = extractedDatabaseService.searchTable('PCdb', tableName, search as string, field as string);
    } else {
      data = extractedDatabaseService.getTableData('PCdb', tableName, limit ? parseInt(limit as string) : undefined);
    }
    
    const table = extractedDatabaseService.getTable('PCdb', tableName);
    res.json({
      tableName,
      headers: table?.headers || [],
      rowCount: table?.rowCount || 0,
      data
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to load PCdb table: ${req.params.tableName}` });
  }
});

// PAdb Routes
router.get('/padb', async (req, res) => {
  try {
    const padb = extractedDatabaseService.getDatabase('PAdb');
    if (!padb) return res.status(404).json({ error: 'PAdb not found' });
    
    res.json({
      name: padb.name,
      tableCount: padb.tables.length,
      totalRows: padb.totalRows,
      tables: padb.tables.map(t => ({ name: t.name, rowCount: t.rowCount, headers: t.headers }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load PAdb' });
  }
});

router.get('/padb/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit, search, field } = req.query;
    
    let data;
    if (search) {
      data = extractedDatabaseService.searchTable('PAdb', tableName, search as string, field as string);
    } else {
      data = extractedDatabaseService.getTableData('PAdb', tableName, limit ? parseInt(limit as string) : undefined);
    }
    
    const table = extractedDatabaseService.getTable('PAdb', tableName);
    res.json({
      tableName,
      headers: table?.headers || [],
      rowCount: table?.rowCount || 0,
      data
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to load PAdb table: ${req.params.tableName}` });
  }
});

// Qdb Routes
router.get('/qdb', async (req, res) => {
  try {
    const qdb = extractedDatabaseService.getDatabase('Qdb');
    if (!qdb) return res.status(404).json({ error: 'Qdb not found' });
    
    res.json({
      name: qdb.name,
      tableCount: qdb.tables.length,
      totalRows: qdb.totalRows,
      tables: qdb.tables.map(t => ({ name: t.name, rowCount: t.rowCount, headers: t.headers }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Qdb' });
  }
});

// Brand Routes (ASCII)
router.get('/brand', async (req, res) => {
  try {
    const brand = extractedDatabaseService.getDatabase('Brand');
    if (!brand) return res.status(404).json({ error: 'Brand not found' });
    res.json({
      name: brand.name,
      tableCount: brand.tables.length,
      totalRows: brand.totalRows,
      tables: brand.tables.map(t => ({ name: t.name, rowCount: t.rowCount, headers: t.headers }))
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load Brand' });
  }
});

router.get('/brand/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit, search, field } = req.query;
    let data;
    if (search) {
      data = extractedDatabaseService.searchTable('Brand', tableName, search as string, field as string);
    } else {
      data = extractedDatabaseService.getTableData('Brand', tableName, limit ? parseInt(limit as string) : undefined);
    }
    const table = extractedDatabaseService.getTable('Brand', tableName);
    res.json({
      tableName,
      headers: table?.headers || [],
      rowCount: table?.rowCount || 0,
      data
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to load Brand table: ${req.params.tableName}` });
  }
});

router.get('/qdb/:tableName', async (req, res) => {
  try {
    const { tableName } = req.params;
    const { limit, search, field } = req.query;
    
    let data;
    if (search) {
      data = extractedDatabaseService.searchTable('Qdb', tableName, search as string, field as string);
    } else {
      data = extractedDatabaseService.getTableData('Qdb', tableName, limit ? parseInt(limit as string) : undefined);
    }
    
    const table = extractedDatabaseService.getTable('Qdb', tableName);
    res.json({
      tableName,
      headers: table?.headers || [],
      rowCount: table?.rowCount || 0,
      data
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to load Qdb table: ${req.params.tableName}` });
  }
});

// DynamoDB preparation endpoints
router.get('/dynamodb/schema/:dbName/:tableName', async (req, res) => {
  try {
    const { dbName, tableName } = req.params;
    const schema = extractedDatabaseService.prepareDynamoDBSchema(dbName, tableName);
    if (!schema) return res.status(404).json({ error: 'Table not found' });
    
    res.json(schema);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate DynamoDB schema' });
  }
});

router.get('/dynamodb/items/:dbName/:tableName', async (req, res) => {
  try {
    const { dbName, tableName } = req.params;
    const { limit } = req.query;
    
    const items = extractedDatabaseService.prepareDynamoDBItems(dbName, tableName);
    const limitedItems = limit ? items.slice(0, parseInt(limit as string)) : items;
    
    res.json({
      tableName: `${dbName}_${tableName}`,
      itemCount: limitedItems.length,
      totalItems: items.length,
      items: limitedItems
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to prepare DynamoDB items' });
  }
});

export default router;
