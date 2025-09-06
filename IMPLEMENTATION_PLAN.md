# ACES/PIES Reference Database Implementation Plan

## Phase 1: Database Schema Setup
### 1.1 Reference Tables (Read-Only Lookups)
- **VCdb** - Vehicle Configuration Database (Make, Model, Year, Engine)
- **PCdb** - Product Category Database (Part types, categories)
- **PAdb** - Product Attribute Database (Attribute definitions, UOM)
- **Qdb** - Qualifier Database (Application qualifiers)
- **BrandTable** - Brand identifiers and mappings

### 1.2 Implementation Steps
```bash
# 1. Extract reference data from documentation
server/src/services/referenceDataService.ts

# 2. Create lookup interfaces
server/src/types/referenceTypes.ts

# 3. Load reference data on startup
server/src/services/dataService.ts (update)
```

## Phase 2: Complete Field Implementation
### 2.1 ACES Fields (78 total)
- Base Vehicle ID, Sub Model ID, Year ID, Make ID, Model ID, Engine ID
- Vehicle attributes (transmission, drive type, steering, body type)
- Application attributes (position, quantity, part type)
- Qualifiers and notes

### 2.2 PIES Fields by Sheet
- **PIES_ITEM** (28 fields): Core identifiers, classifications
- **PIES_ITEM_DESC** (6 fields): Description types and languages  
- **PIES_ITEM_PRCE** (13 fields): Pricing with breaks and multipliers
- **PIES_ITEM_EXPI** (6 fields): Extended product information
- **PIES_ITEM_ATRB** (9 fields): Attributes with UOM
- **PIES_ITEM_PACK** (44 fields): Complete packaging specifications
- **PIES_ITEM_KITS** (14 fields): Kit components and relationships
- **PIES_ITEM_INTE** (18 fields): Interchange and cross-references
- **PIES_ITEM_ASST** (40 fields): Digital assets and media
- **PIES_MKTC** (46 fields): Marketing copy and SEO content

## Phase 3: UI/UX Enhancement
### 3.1 Smart Form Fields
- Dropdown lookups from reference databases
- Auto-complete for vehicle selection
- Validation against reference data
- Required field indicators

### 3.2 Tab Structure
```typescript
// Each tab shows actual field count and completion status
{ id: 'aces', name: 'ACES (78 fields)', completed: '12/78' }
{ id: 'pies-item', name: 'PIES Item (28 fields)', completed: '8/28' }
```

## Phase 4: Data Integration
### 4.1 Reference Data Loading
```typescript
// Load all reference databases on startup
class ReferenceDataService {
  loadVCdb(): VehicleData[]
  loadPCdb(): CategoryData[]  
  loadPAdb(): AttributeData[]
  loadQdb(): QualifierData[]
  loadBrandTable(): BrandData[]
}
```

### 4.2 Validation Engine
- Cross-reference validation
- Required field checking
- Data type validation
- Business rule enforcement

## Next Steps Priority
1. **Extract field definitions** from Excel specs using the reader utility
2. **Create complete TypeScript interfaces** for all 78 ACES + 184 PIES fields
3. **Load reference databases** from documentation files
4. **Build smart UI components** with dropdowns and validation
5. **Implement field completion tracking** and progress indicators

## File Structure
```
server/src/
├── types/
│   ├── acesTypes.ts (78 fields)
│   ├── piesTypes.ts (184 fields)  
│   └── referenceTypes.ts
├── services/
│   ├── referenceDataService.ts
│   └── validationService.ts
└── data/
    ├── vcdb.json
    ├── pcdb.json
    ├── padb.json
    ├── qdb.json
    └── brandTable.json
```

## Immediate Action Required
1. Run field extraction script on Excel files
2. Generate complete type definitions
3. Create reference data loaders
4. Update UI with all actual fields