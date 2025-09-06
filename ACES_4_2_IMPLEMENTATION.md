# ACES 4.2 Implementation Guide

## Overview
This document outlines the implementation of ACES 4.2 support in the Auto Parts ERP system, building upon the existing ACES 4.1 foundation.

## Key ACES 4.2 Features Implemented

### 1. Equipment Applications (NEW)
- **Manufacturer + Equipment Model**: Support for non-vehicle equipment
- **Equipment Base**: Simplified equipment identification
- **Vehicle Type**: Equipment categories (generators, pumps, etc.)
- **Production Year Ranges**: More precise date specifications

### 2. Enhanced Asset Management
- **Separate Asset Entities**: Assets can exist independently of applications
- **Asset References**: Applications can reference assets via AssetName
- **Asset Item Order**: Ordering for multiple assets per application
- **Digital Asset Improvements**: Enhanced metadata and linking

### 3. Validation Controls
- **Optional Validation**: `validate="no"` flag for intentionally invalid configs
- **Improved Error Handling**: Better parsing and validation feedback

## Files Created/Modified

### Backend Implementation

#### New Files:
- `server/src/types/aces42.ts` - Complete ACES 4.2 type definitions
- `server/src/services/aces42Service.ts` - XML parsing and generation service
- `server/src/routes/aces42.ts` - API endpoints for import/export/validation

#### Modified Files:
- `server/src/types/index.ts` - Added ACES 4.2 types and backward compatibility
- `server/src/index.ts` - Added ACES 4.2 router

### Frontend Implementation

#### New Files:
- `client/src/components/ACES42Tab.tsx` - Complete ACES 4.2 UI component

#### Modified Files:
- `client/src/types/index.ts` - Added ACES 4.2 client types
- `client/src/pages/ProductDetailPage.tsx` - Added ACES 4.2 tab

## API Endpoints

### ACES 4.2 Endpoints
```
POST /api/aces42/import/xml     - Import ACES 4.2 XML file
GET  /api/aces42/export/xml     - Export ACES 4.2 XML file
POST /api/aces42/validate       - Validate ACES 4.2 XML file
```

### Query Parameters for Export
- `brandAAIAID` - Brand identifier (required)
- `subBrandAAIAID` - Sub-brand identifier (optional)
- `submissionType` - FULL or INCREMENTAL
- `effectiveDate` - Effective date (optional)
- `includeAssets` - Include asset entities (boolean)
- `includeDigitalAssets` - Include digital assets (boolean)

## ACES 4.2 XML Structure Support

### Application Patterns
1. **BaseVehicle Pattern** (Legacy compatibility)
   ```xml
   <BaseVehicle id="1939"/>
   <SubModel id="39"/>
   <EngineBase id="143"/>
   ```

2. **Year/Make/Model Pattern** (Legacy compatibility)
   ```xml
   <Years from="1994" to="1995"/>
   <Make id="54"/>
   <Model id="688"/>
   ```

3. **Equipment Pattern** (NEW in 4.2)
   ```xml
   <Mfr id="22"/>
   <EquipmentModel id="1"/>
   <VehicleType id="2194"/>
   <ProductionYears ProductionStart="1990" ProductionEnd="1996"/>
   ```

### Asset Management
1. **Asset References in Applications**
   ```xml
   <AssetName>123</AssetName>
   <AssetItemOrder>1</AssetItemOrder>
   ```

2. **Separate Asset Entities**
   ```xml
   <Asset action="A" id="1">
     <Years from="1994" to="1995"/>
     <Make id="54"/>
     <AssetName>704</AssetName>
   </Asset>
   ```

3. **Digital Asset Information**
   ```xml
   <DigitalFileInformation AssetName="123" action="A" LanguageCode="EN">
     <FileName>abc.jpg</FileName>
     <AssetDetailType>BRO</AssetDetailType>
     <URI>http://www.mfg.com/Images/abc.jpg</URI>
   </DigitalFileInformation>
   ```

## UI Features

### ACES 4.2 Tab Components
- **Import/Export Controls**: XML file handling with progress feedback
- **Validation Tool**: Real-time XML validation with error reporting
- **Application Display**: Enhanced view showing equipment vs vehicle applications
- **Asset Management**: Visual representation of asset references
- **Feature Highlights**: Information panel about ACES 4.2 improvements

### Application Type Icons
- 🚛 Vehicle applications (BaseVehicle or Year/Make/Model)
- 🔧 Equipment applications (Manufacturer + Equipment Model)
- 📅 Date-range applications (Production Years)

## Data Flow

### Import Process
1. User uploads ACES 4.2 XML file
2. `aces42Service.parseACES42XML()` validates and parses
3. Applications, Assets, and Digital Assets extracted
4. Results displayed with error/warning feedback
5. Data stored in product records

### Export Process
1. User requests export with parameters
2. `aces42Service.generateACES42XML()` builds XML structure
3. Products with ACES 4.2 applications included
4. XML file generated and downloaded

### Validation Process
1. User uploads XML for validation only
2. Parse and validate without storing data
3. Return validation results with statistics

## Backward Compatibility

### ACES 4.1 Support Maintained
- All existing ACES 4.1 functionality preserved
- Legacy `ACESApplication` interface unchanged
- New `ACES42ApplicationInternal` interface for enhanced features

### Migration Path
- Products can have both `acesApplications` (4.1) and `aces42Applications` (4.2)
- UI shows separate tabs for each version
- Export endpoints available for both formats

## Sample Data Integration

### ACES 4.2 Sample XML
- Included sample file: `ACES_4_2_Sample_Rev1.xml`
- Demonstrates all new features:
  - Equipment applications
  - Asset references
  - Production year ranges
  - Validation flags

### Test Cases Covered
- Vehicle applications (legacy compatibility)
- Equipment applications (generators, pumps)
- Asset entity management
- Digital asset linking
- Validation controls

## Production Deployment

### Environment Variables
```bash
ACES42_VALIDATION_STRICT=false    # Allow validation bypass
ACES42_ASSET_STORAGE_PATH=/assets # Asset file storage
ACES42_MAX_FILE_SIZE=50MB         # Upload limit
```

### Database Schema
- DynamoDB: ACES 4.2 JSON storage with flexible schema
- Aurora Postgres: Relational equipment and asset references
- S3: XML file storage and asset management

## Testing

### Unit Tests
- XML parsing for all application patterns
- Asset reference validation
- Equipment application handling
- Error condition testing

### Integration Tests
- Full import/export cycle
- UI component interaction
- API endpoint validation
- File upload/download

## Future Enhancements

### Planned Features
1. **Equipment Database Integration**: Link to PAdb for equipment validation
2. **Asset Management UI**: Visual asset browser and editor
3. **Batch Processing**: Handle large ACES 4.2 files asynchronously
4. **Advanced Validation**: Real-time VCdb/PAdb validation

### Performance Optimizations
1. **Streaming XML Parser**: Handle very large files
2. **Caching Layer**: Cache parsed equipment and asset data
3. **Background Processing**: Async import/export jobs

## Documentation References

### ACES 4.2 Documentation
- `ACES_4_2_TechnicalDocumentation_Rev2_10_31_2024.pdf`
- `ACES_4_2_XSDSchema_Rev2_11_19_2021.xsd`
- `ACES_4_2_Sample_Rev1.xml`

### Implementation Files
- Type definitions: `server/src/types/aces42.ts`
- Service layer: `server/src/services/aces42Service.ts`
- API routes: `server/src/routes/aces42.ts`
- UI component: `client/src/components/ACES42Tab.tsx`

---

## Summary

The ACES 4.2 implementation provides:
- ✅ Complete equipment application support
- ✅ Enhanced asset management with separate entities
- ✅ Production year range specifications
- ✅ Optional validation controls
- ✅ Backward compatibility with ACES 4.1
- ✅ Full XML import/export/validation
- ✅ Modern React UI with comprehensive features
- ✅ Type-safe TypeScript implementation

This implementation positions the Auto Parts ERP system as fully compliant with the latest ACES 4.2 standard while maintaining all existing functionality.