import { DynamoDBClient, CreateTableCommand, PutItemCommand, BatchWriteItemCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { extractedDatabaseService } from './extractedDatabaseService.js';

export class DynamoDBService {
  private client: DynamoDBClient;
  private region = process.env.AWS_REGION || 'us-east-1';
  private tablePrefix = process.env.DYNAMODB_TABLE_PREFIX || 'autoparts-erp';

  constructor() {
    this.client = new DynamoDBClient({ 
      region: this.region,
      // For local development, you can use DynamoDB Local
      ...(process.env.NODE_ENV === 'development' && {
        endpoint: 'http://localhost:8000'
      })
    });
  }

  async createAllTables(): Promise<void> {
    console.log('🏗️ Creating DynamoDB tables for all extracted databases...');
    
    const databases = extractedDatabaseService.getAllDatabases();
    
    for (const db of databases) {
      for (const table of db.tables) {
        await this.createTable(db.name, table.name);
      }
    }
    
    console.log('✅ All DynamoDB tables created successfully');
  }

  async createTable(dbName: string, tableName: string): Promise<void> {
    try {
      const schema = extractedDatabaseService.prepareDynamoDBSchema(dbName, tableName);
      if (!schema) {
        console.warn(`⚠️ No schema found for ${dbName}.${tableName}`);
        return;
      }

      // Add table prefix
      schema.TableName = `${this.tablePrefix}-${schema.TableName}`;

      const command = new CreateTableCommand(schema);
      await this.client.send(command);
      
      console.log(`✅ Created table: ${schema.TableName}`);
      
      // Wait for table to be active
      await this.waitForTableActive(schema.TableName);
      
    } catch (error: any) {
      if (error.name === 'ResourceInUseException') {
        console.log(`ℹ️ Table already exists: ${this.tablePrefix}-${dbName}_${tableName}`);
      } else {
        console.error(`❌ Error creating table ${dbName}.${tableName}:`, error);
        throw error;
      }
    }
  }

  async populateTable(dbName: string, tableName: string): Promise<void> {
    try {
      const items = extractedDatabaseService.prepareDynamoDBItems(dbName, tableName);
      const dynamoTableName = `${this.tablePrefix}-${dbName}_${tableName}`;
      
      console.log(`📊 Populating ${dynamoTableName} with ${items.length} items...`);
      
      // DynamoDB batch write limit is 25 items
      const batchSize = 25;
      const batches = [];
      
      for (let i = 0; i < items.length; i += batchSize) {
        batches.push(items.slice(i, i + batchSize));
      }
      
      for (const batch of batches) {
        const writeRequests = batch.map(item => ({
          PutRequest: { Item: item }
        }));
        
        const command = new BatchWriteItemCommand({
          RequestItems: {
            [dynamoTableName]: writeRequests
          }
        });
        
        await this.client.send(command);
      }
      
      console.log(`✅ Populated ${dynamoTableName} with ${items.length} items`);
      
    } catch (error) {
      console.error(`❌ Error populating table ${dbName}.${tableName}:`, error);
      throw error;
    }
  }

  async populateAllTables(): Promise<void> {
    console.log('📊 Populating all DynamoDB tables...');
    
    const databases = extractedDatabaseService.getAllDatabases();
    
    for (const db of databases) {
      for (const table of db.tables) {
        await this.populateTable(db.name, table.name);
      }
    }
    
    console.log('✅ All DynamoDB tables populated successfully');
  }

  private async waitForTableActive(tableName: string): Promise<void> {
    const maxAttempts = 30;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        const command = new DescribeTableCommand({ TableName: tableName });
        const response = await this.client.send(command);
        
        if (response.Table?.TableStatus === 'ACTIVE') {
          return;
        }
        
        console.log(`⏳ Waiting for table ${tableName} to become active...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
        
      } catch (error) {
        console.error(`Error checking table status:`, error);
        throw error;
      }
    }
    
    throw new Error(`Table ${tableName} did not become active within timeout`);
  }

  // Utility methods for deployment
  async deployToAWS(): Promise<void> {
    console.log('🚀 Deploying extracted databases to AWS DynamoDB...');
    
    try {
      await this.createAllTables();
      await this.populateAllTables();
      
      console.log('🎉 Successfully deployed all databases to AWS DynamoDB!');
      
    } catch (error) {
      console.error('❌ Deployment failed:', error);
      throw error;
    }
  }

  getTableName(dbName: string, tableName: string): string {
    return `${this.tablePrefix}-${dbName}_${tableName}`;
  }

  // Development helper - create tables locally
  async setupLocalDevelopment(): Promise<void> {
    console.log('🔧 Setting up local DynamoDB development environment...');
    
    // This assumes DynamoDB Local is running on localhost:8000
    try {
      await this.createAllTables();
      console.log('✅ Local DynamoDB tables created');
      
      // Optionally populate with sample data
      const sampleTables = [
        { db: 'VCdb', table: '20231026_Make' },
        { db: 'PCdb', table: 'Parts' },
        { db: 'PAdb', table: 'PartAttributes' },
        { db: 'Qdb', table: 'Qualifier' }
      ];
      
      for (const { db, table } of sampleTables) {
        await this.populateTable(db, table);
      }
      
      console.log('✅ Local DynamoDB setup complete');
      
    } catch (error) {
      console.error('❌ Local setup failed:', error);
      throw error;
    }
  }
}

export const dynamoDBService = new DynamoDBService();