# Automotive Reference Databases Integration

## Overview
The Auto Parts ERP system integrates with all major automotive industry reference databases to provide complete ACES/PIES compliance and accurate vehicle/part data.

## Integrated Databases

### 1. VCdb (Vehicle Configuration Database)
**Purpose**: Vehicle identification and configuration data
**Version**: Global enUS 2023-10-26

**Tables Loaded**:
- `Makes` - Vehicle manufacturers (Ford, Toyota, etc.)
- `Models` - Vehicle models (F-150, Camry, etc.)
- `SubModels` - Model variants (XLT, LE, etc.)
- `BaseVehicles` - Complete vehicle configurations
- `EngineBase` - Engine families
- `EngineBlock` - Specific engine blocks
- `EngineVIN` - VIN-specific engines
- `DriveTypes` - FWD, RWD, AWD, 4WD
- `TransmissionTypes` - Automatic, Manual, CVT
- `BodyTypes` - Sedan, SUV, Truck, etc.
- `FuelTypes` - Gasoline, Diesel, Electric, etc.
- `Aspirations` - Naturally Aspirated, Turbo, etc.
- `VehicleTypes` - Equipment categories
- `Manufacturers` - Equipment manufacturers
- `EquipmentModels` - Non-vehicle equipment

**API Endpoints**: `/api/vcdb/makes`, `/api/vcdb/models`, etc.

### 2. PCdb (Part Category Database)
**Purpose**: Part classification and categorization
**Version**: enUS 2023-05-18

**Tables Loaded**:
- `Parts` - Part types (Oil Filter, Brake Rotor, etc.)
- `Categories` - High-level part categories
- `Subcategories` - Detailed part subcategories
- `Positions` - Part positions (Front, Rear, Left, Right)

**API Endpoints**: `/api/vcdb/parttypes`, `/api/vcdb/categories`, etc.

### 3. PAdb (Part Attribute Database)
**Purpose**: Part attributes and specifications
**Version**: enUS 2023-05-18

**Tables Loaded**:
- `PartAttributes` - Available part attributes
- `ValidValues` - Valid attribute values
- `MeasurementGroups` - Measurement groupings

**API Endpoints**: `/api/vcdb/partattributes`, `/api/vcdb/validvalues`, etc.

### 4. Qdb (Qualifier Database)
**Purpose**: Application qualifiers and conditions
**Version**: enUS 2023-09-21

**Tables Loaded**:
- `Qualifiers` - Application qualifiers (With A/C, Dual Exhaust, etc.)
- `QualifierTypes` - Qualifier categories
- `QualifierGroups` - Qualifier groupings

**API Endpoints**: `/api/vcdb/qualifiers`, `/api/vcdb/qualifiertypes`, etc.

### 5. Brand Table
**Purpose**: Brand identification and mapping
**Format**: AAIA Brand IDs

**Data Loaded**:
- Major automotive brands with AAIA IDs
- OEM and aftermarket brand mappings

**API Endpoint**: `/api/vcdb/brands`

## Data Loading Process

### 1. Extraction
- ASCII text files extracted from ZIP archives
- Files located in `extracted_databases/` directory
- Pipe-delimited format with headers

### 2. Parsing
- UTF-8 encoding with Windows CRLF support
- Header row skipped, data rows parsed
- ID/Name pairs loaded into Maps for fast lookup

### 3. Services
- `fullVcdbService` - Vehicle configuration data
- `pcdbPadbService` - Part categories and attributes
- `qdbBrandService` - Qualifiers and brands

### 4. API Exposure
- RESTful endpoints for all reference data
- JSON format responses
- Real-time lookups for ACES applications

## Usage in ACES Applications

### Vehicle Identification
```javascript
// BaseVehicle pattern
const vehicle = fullVcdbService.resolveVehicleInfo(baseVehicleId);
// Returns: { year, make, model, baseVehicleId }

// Year/Make/Model pattern
const makes = fullVcdbService.getAllMakes();
const models = fullVcdbService.getAllModels();
```

### Part Classification
```javascript
// Part types for ACES applications
const partTypes = pcdbPadbService.getAllPartTypes();
const positions = pcdbPadbService.getAllPositions();
```

### Application Qualifiers
```javascript
// Qualifiers for conditional applications
const qualifiers = qdbBrandService.getAllQualifiers();
// Example: "With A/C", "Dual Exhaust", "California Emissions"
```

## File Structure
```
extracted_databases/
├── VCdb/
│   └── vcdb_ascii/
│       ├── 20231026_Make.txt
│       ├── 20231026_Model.txt
│       └── ... (20+ files)
├── PCdb/
│   └── pcdb_ascii/
│       ├── Parts.txt
│       ├── Categories.txt
│       └── ... (15+ files)
├── PAdb/
│   └── padb_ascii/
│       ├── PartAttributes.txt
│       └── ... (10+ files)
└── Qdb/
    └── qdb_ascii/
        ├── Qualifier.txt
        └── ... (8+ files)
```

## Statistics (Typical Counts)
- **Makes**: ~1,400 vehicle manufacturers
- **Models**: ~15,000 vehicle models
- **Part Types**: ~8,000 automotive part types
- **Qualifiers**: ~14,000 application qualifiers
- **Positions**: ~200 part positions
- **Brands**: ~25 major automotive brands

## Benefits

### 1. **Data Accuracy**
- Industry-standard reference data
- Regular updates from Auto Care Association
- Consistent across all automotive systems

### 2. **ACES Compliance**
- Complete ACES 4.2 support
- All required reference tables loaded
- Proper ID-based relationships

### 3. **Performance**
- In-memory Maps for fast lookups
- Single server startup load
- No database queries for reference data

### 4. **Scalability**
- Handles millions of vehicle configurations
- Thousands of part types and qualifiers
- Ready for production workloads

## Maintenance

### Updates
1. Download new reference database files
2. Replace files in `extracted_databases/`
3. Restart server to reload data
4. Verify counts in startup logs

### Monitoring
- Server logs show load statistics
- API endpoints return data counts
- Health check includes reference data status

---

This integration provides the foundation for building industry-compliant ACES applications with accurate, up-to-date automotive reference data.