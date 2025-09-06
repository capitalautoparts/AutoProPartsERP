# AutoCare Database Integration

Complete integration of extracted AutoCare databases (VCdb, PCdb, PAdb, Qdb) with API services and AWS DynamoDB preparation.

## 📊 Database Overview

### Extracted Databases
- **VCdb** (Vehicle Configuration Database) - 85+ tables with vehicle data
- **PCdb** (Product Category Database) - 25+ tables with part categories
- **PAdb** (Product Attribute Database) - 12+ tables with part attributes
- **Qdb** (Qualifier Database) - 13+ tables with application qualifiers

### Database Locations
```
C:\Users\Brian\Documents\AutoProPartsERP\extracted_databases\
├── VCdb\vcdb_ascii\     # 85+ .txt files
├── PCdb\pcdb_ascii\     # 25+ .txt files  
├── PAdb\padb_ascii\     # 12+ .txt files
└── Qdb\qdb_ascii\       # 13+ .txt files
```

## 🚀 API Endpoints

### Database Overview
```bash
GET /api/databases                    # All databases summary
```

### VCdb (Vehicle Configuration Database)
```bash
GET /api/databases/vcdb               # VCdb tables overview
GET /api/databases/vcdb/20231026_Make # Makes table
GET /api/databases/vcdb/20231026_Model # Models table
GET /api/databases/vcdb/20231026_BaseVehicle # Base vehicles
# ... 85+ more VCdb tables
```

### PCdb (Product Category Database)
```bash
GET /api/databases/pcdb               # PCdb tables overview
GET /api/databases/pcdb/Parts         # Parts table
GET /api/databases/pcdb/Categories    # Categories table
GET /api/databases/pcdb/Positions     # Positions table
# ... 25+ more PCdb tables
```

### PAdb (Product Attribute Database)
```bash
GET /api/databases/padb               # PAdb tables overview
GET /api/databases/padb/PartAttributes # Part attributes
GET /api/databases/padb/ValidValues   # Valid attribute values
GET /api/databases/padb/Style         # Attribute styles
# ... 12+ more PAdb tables
```

### Qdb (Qualifier Database)
```bash
GET /api/databases/qdb                # Qdb tables overview
GET /api/databases/qdb/Qualifier      # Qualifiers table
GET /api/databases/qdb/QualifierType  # Qualifier types
GET /api/databases/qdb/QualifierGroup # Qualifier groups
# ... 13+ more Qdb tables
```

### Query Parameters
All table endpoints support:
- `?limit=100` - Limit results
- `?search=brake` - Search all fields
- `?search=brake&field=PartTerminologyName` - Search specific field

## 🏗️ DynamoDB Integration

### Schema Generation
```bash
GET /api/databases/dynamodb/schema/VCdb/20231026_Make
```

### Item Preparation
```bash
GET /api/databases/dynamodb/items/VCdb/20231026_Make?limit=10
```

## 🚀 AWS Deployment

### Deployment Status
```bash
GET /api/deployment/status
```

### Create All Tables
```bash
POST /api/deployment/create-tables
```

### Populate All Tables
```bash
POST /api/deployment/populate-tables
```

### Full AWS Deployment
```bash
POST /api/deployment/deploy-aws
```

### Local Development Setup
```bash
POST /api/deployment/setup-local
```

### Individual Table Operations
```bash
POST /api/deployment/create-table/VCdb/20231026_Make
POST /api/deployment/populate-table/VCdb/20231026_Make
```

## 🔧 Environment Variables

```bash
# AWS Configuration
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=autoparts-erp
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key

# Local Development
NODE_ENV=development
```

## 📋 Sample Data Structure

### VCdb Make Table
```json
{
  "tableName": "20231026_Make",
  "headers": ["MakeID", "MakeName"],
  "data": [
    { "MakeID": "47", "MakeName": "Chevrolet" },
    { "MakeID": "54", "MakeName": "Ford" },
    { "MakeID": "76", "MakeName": "Toyota" }
  ]
}
```

### PCdb Parts Table
```json
{
  "tableName": "Parts",
  "headers": ["PartTerminologyID", "PartTerminologyName", "PartsDescriptionID", "RevDate"],
  "data": [
    { 
      "PartTerminologyID": "1684", 
      "PartTerminologyName": "Disc Brake Pad Set",
      "PartsDescriptionID": "11592",
      "RevDate": "05/01/2023"
    }
  ]
}
```

### PAdb Attributes Table
```json
{
  "tableName": "PartAttributes",
  "headers": ["PAID", "PAName", "PADescr"],
  "data": [
    {
      "PAID": "3",
      "PAName": "Friction Material Composition",
      "PADescr": "Describes The Friction Material Of The Brake Pad"
    }
  ]
}
```

### Qdb Qualifier Table
```json
{
  "tableName": "Qualifier",
  "headers": ["QualifierID", "QualifierText", "ExampleText", "QualifierTypeID", "NewQualifierID", "WhenModified"],
  "data": [
    {
      "QualifierID": "6537",
      "QualifierText": "Mounting Ears at <p1 type=\"clock\"/> O'Clock",
      "ExampleText": "Mounting Ears at 3 O'Clock",
      "QualifierTypeID": "1",
      "NewQualifierID": "",
      "WhenModified": "1/20/2010 2:31:00 PM"
    }
  ]
}
```

## 🏗️ DynamoDB Table Structure

### Table Naming Convention
```
{tablePrefix}-{DatabaseName}_{TableName}
```

Examples:
- `autoparts-erp-VCdb_20231026_Make`
- `autoparts-erp-PCdb_Parts`
- `autoparts-erp-PAdb_PartAttributes`
- `autoparts-erp-Qdb_Qualifier`

### Primary Key Strategy
- First column of each table becomes the primary key (HASH)
- All attributes stored as String type for flexibility
- Pay-per-request billing mode for cost optimization

## 📊 Database Statistics

### VCdb Tables (85+)
- Makes, Models, Years, BaseVehicles
- Engines, Transmissions, Body Types
- Vehicle-to-component mappings
- Equipment and non-vehicle applications

### PCdb Tables (25+)
- Parts, Categories, Subcategories
- Positions, Relationships, Supersessions
- PIES code mappings
- Change tracking tables

### PAdb Tables (12+)
- Part attributes and descriptions
- Valid values and assignments
- Measurement groups and UOM codes
- Style and type mappings

### Qdb Tables (13+)
- Qualifiers and types
- Groups and translations
- Language support
- Change tracking

## 🔄 Data Processing Flow

1. **File Detection** - Scans extracted database directories
2. **Parsing** - Processes pipe/tab delimited .txt files
3. **Validation** - Checks headers and data integrity
4. **Storage** - Loads into in-memory tables
5. **API Exposure** - Makes data available via REST endpoints
6. **DynamoDB Prep** - Generates schemas and items for AWS
7. **Deployment** - Creates and populates DynamoDB tables

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Start Server
```bash
npm run dev
```

### 3. Test Database Loading
```bash
curl http://localhost:3000/api/databases
```

### 4. Query Specific Tables
```bash
curl http://localhost:3000/api/databases/vcdb/20231026_Make?limit=5
curl http://localhost:3000/api/databases/pcdb/Parts?search=brake
```

### 5. Check Deployment Status
```bash
curl http://localhost:3000/api/deployment/status
```

## 🔧 Local DynamoDB Development

### Install DynamoDB Local
```bash
# Download from AWS
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html

# Run locally
java -Djava.library.path=./DynamoDBLocal_lib -jar DynamoDBLocal.jar -sharedDb
```

### Setup Local Tables
```bash
curl -X POST http://localhost:3000/api/deployment/setup-local
```

## 📈 Performance Considerations

### Memory Usage
- All databases loaded into memory for fast access
- ~135+ tables with varying row counts
- Estimated memory usage: 100-500MB depending on data size

### API Performance
- In-memory queries for sub-millisecond response times
- Search functionality across all fields
- Pagination support for large result sets

### DynamoDB Optimization
- Pay-per-request billing for variable workloads
- String-only attributes for schema flexibility
- Batch operations for efficient data loading

## 🔒 Security & Best Practices

### AWS Credentials
- Use IAM roles in production
- Never commit credentials to code
- Use environment variables or AWS credential files

### Data Validation
- Input sanitization on all API endpoints
- Error handling for malformed requests
- Logging for debugging and monitoring

### Scalability
- Stateless API design for horizontal scaling
- DynamoDB auto-scaling capabilities
- CloudWatch monitoring integration

---

**Built for the automotive aftermarket industry with complete AutoCare standards compliance**