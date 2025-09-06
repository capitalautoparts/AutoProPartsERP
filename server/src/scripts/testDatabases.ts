import { extractedDatabaseService } from '../services/extractedDatabaseService.js';

async function testDatabaseIntegration() {
  console.log('🧪 Testing Database Integration...\n');
  
  try {
    // Load all databases
    const databases = await extractedDatabaseService.loadAllDatabases();
    
    console.log('📊 Database Summary:');
    for (const [dbName, dbInfo] of databases) {
      console.log(`  ${dbName}: ${dbInfo.tables.length} tables, ${dbInfo.totalRows} rows`);
    }
    
    console.log('\n🔍 Sample Data Tests:');
    
    // Test VCdb Make table
    const makes = extractedDatabaseService.getTableData('VCdb', '20231026_Make', 5);
    console.log(`VCdb Makes (first 5):`, makes.map(m => `${m.MakeID}: ${m.MakeName}`));
    
    // Test PCdb Parts table
    const parts = extractedDatabaseService.getTableData('PCdb', 'Parts', 3);
    console.log(`PCdb Parts (first 3):`, parts.map(p => p.PartTerminologyName));
    
    // Test PAdb Attributes
    const attributes = extractedDatabaseService.getTableData('PAdb', 'PartAttributes', 3);
    console.log(`PAdb Attributes (first 3):`, attributes.map(a => a.PAName));
    
    // Test Qdb Qualifiers
    const qualifiers = extractedDatabaseService.getTableData('Qdb', 'Qualifier', 3);
    console.log(`Qdb Qualifiers (first 3):`, qualifiers.map(q => q.QualifierID));
    
    console.log('\n🔍 Search Tests:');
    
    // Test search functionality
    const brakeSearch = extractedDatabaseService.searchTable('PCdb', 'Parts', 'brake');
    console.log(`Brake parts found: ${brakeSearch.length}`);
    
    const colorSearch = extractedDatabaseService.searchTable('PAdb', 'PartAttributes', 'color');
    console.log(`Color attributes found: ${colorSearch.length}`);
    
    console.log('\n🏗️ DynamoDB Schema Tests:');
    
    // Test DynamoDB schema generation
    const makeSchema = extractedDatabaseService.prepareDynamoDBSchema('VCdb', '20231026_Make');
    console.log(`VCdb Make schema:`, makeSchema?.TableName);
    
    const partSchema = extractedDatabaseService.prepareDynamoDBSchema('PCdb', 'Parts');
    console.log(`PCdb Parts schema:`, partSchema?.TableName);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseIntegration();
}

export { testDatabaseIntegration };