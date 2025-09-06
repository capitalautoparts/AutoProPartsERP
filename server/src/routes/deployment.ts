import express from 'express';
import { dynamoDBService } from '../services/dynamoDBService.js';
import { extractedDatabaseService } from '../services/extractedDatabaseService.js';

const router = express.Router();

// Get deployment status
router.get('/status', async (req, res) => {
  try {
    const databases = extractedDatabaseService.getAllDatabases();
    const status = {
      environment: process.env.NODE_ENV || 'development',
      region: process.env.AWS_REGION || 'us-east-1',
      tablePrefix: process.env.DYNAMODB_TABLE_PREFIX || 'autoparts-erp',
      databases: databases.map(db => ({
        name: db.name,
        tables: db.tables.map(t => ({
          name: t.name,
          rowCount: t.rowCount,
          dynamoTableName: dynamoDBService.getTableName(db.name, t.name)
        }))
      }))
    };
    
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get deployment status' });
  }
});

// Create all DynamoDB tables
router.post('/create-tables', async (req, res) => {
  try {
    await dynamoDBService.createAllTables();
    res.json({ message: 'All DynamoDB tables created successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to create tables', 
      details: error.message 
    });
  }
});

// Populate all DynamoDB tables
router.post('/populate-tables', async (req, res) => {
  try {
    await dynamoDBService.populateAllTables();
    res.json({ message: 'All DynamoDB tables populated successfully' });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to populate tables', 
      details: error.message 
    });
  }
});

// Full deployment to AWS
router.post('/deploy-aws', async (req, res) => {
  try {
    await dynamoDBService.deployToAWS();
    res.json({ 
      message: 'Successfully deployed all databases to AWS DynamoDB',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'AWS deployment failed', 
      details: error.message 
    });
  }
});

// Setup local development environment
router.post('/setup-local', async (req, res) => {
  try {
    await dynamoDBService.setupLocalDevelopment();
    res.json({ 
      message: 'Local DynamoDB development environment setup complete',
      note: 'Make sure DynamoDB Local is running on localhost:8000'
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Local setup failed', 
      details: error.message 
    });
  }
});

// Create specific table
router.post('/create-table/:dbName/:tableName', async (req, res) => {
  try {
    const { dbName, tableName } = req.params;
    await dynamoDBService.createTable(dbName, tableName);
    res.json({ 
      message: `Table ${dbName}.${tableName} created successfully`,
      dynamoTableName: dynamoDBService.getTableName(dbName, tableName)
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: `Failed to create table ${req.params.dbName}.${req.params.tableName}`, 
      details: error.message 
    });
  }
});

// Populate specific table
router.post('/populate-table/:dbName/:tableName', async (req, res) => {
  try {
    const { dbName, tableName } = req.params;
    await dynamoDBService.populateTable(dbName, tableName);
    res.json({ 
      message: `Table ${dbName}.${tableName} populated successfully`,
      dynamoTableName: dynamoDBService.getTableName(dbName, tableName)
    });
  } catch (error: any) {
    res.status(500).json({ 
      error: `Failed to populate table ${req.params.dbName}.${req.params.tableName}`, 
      details: error.message 
    });
  }
});

export default router;