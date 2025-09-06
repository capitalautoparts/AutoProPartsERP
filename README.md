# Auto Parts ERP with Integrated PIM (ACES/PIES)

A modern ERP + PIM system designed for the automotive aftermarket, replacing legacy .NET systems with a scalable **AWS + Vite + React + Node.js** stack.

## 🚀 Features

### Core ERP Modules
- **Product Management (PIM)** - Complete ACES 4.1 and PIES 7.2 compliance
- **Orders** - Sales orders, invoices, fulfillment
- **Customers** - CRM, contact data, B2B accounts
- **Marketing** - Campaign lists, feeds, advertisements
- **Accounting** - AR/AP, ledgers, journals
- **Purchasing** - Suppliers, purchase orders
- **Warehouse Management** - Bins, stock levels, transfers

### Universal Import/Export
- ✅ **Excel (.xlsx)** import/export for ALL modules
- ✅ **XML** import/export for PIM (ACES/PIES compliance)
- ✅ First row = field names, second row = data types
- ✅ Async processing for millions of rows
- ✅ S3 storage integration
- ✅ Background job processing

### PIM Structure
- **Product Profile** - Mfg, Brand, Part#, SKU, descriptions, stock
- **ACES Tabs** - Vehicle Fitment, Application Mapping, Attribute Filters, Validation
- **PIES Tabs** - Item, Description, Price, EXPI, Attributes, Package, Kit, Interchange, Assets, Assortments, Market Copy

## 🛠 Tech Stack

### Frontend
- **Vite** + **React** + **TypeScript**
- **TailwindCSS** for styling
- **React Query** for state management
- **React Router** for navigation
- **Lucide React** for icons

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Multer** for file uploads
- **XLSX** for Excel processing
- **xml2js** for XML processing
- **AWS SDK** for cloud services

### Database (Production)
- **DynamoDB** - Flexible schema for ACES/PIES JSON
- **Aurora Postgres** - Relational ERP entities
- **S3** - File storage and imports/exports

### Infrastructure
- **API Gateway** + **Lambda**
- **CloudWatch** for monitoring
- **AWS Cognito** for authentication

## 📦 Quick Start

### Prerequisites
- Node.js >= 18
- npm or yarn
- AWS CLI configured (for production)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd auto-parts-erp

# Install all dependencies
npm run install-all

# Start development servers
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000

### API Endpoints
- **Health Check**: `GET /api/health`
- **Products**: `GET|POST|PUT|DELETE /api/products`
- **Customers**: `GET|POST|PUT|DELETE /api/customers`
- **Orders**: `GET|POST|PUT|DELETE /api/orders`

### Import/Export Endpoints
```bash
# Excel Import
POST /api/products/import/excel
POST /api/customers/import/excel
POST /api/orders/import/excel

# Excel Export
GET /api/products/export/excel
GET /api/customers/export/excel
GET /api/orders/export/excel

# XML Import/Export (PIM only)
POST /api/products/import/xml
GET /api/products/export/xml
```

## 🎯 Example Usage

### Excel Import/Export Format

#### PIES-Compliant Excel Structure
The system supports comprehensive PIES 7.2 Excel import/export:

**Products Sheet:**
- Core fields: ID, Manufacturer, Brand, Part Number, SKU, Product Name
- PIES fields: Mfg Code, Brand ID, GTIN, UNSPSC, Part Type, Category Code
- Extended: Hazmat Code, Item Qty Size/UOM, VMRS Code

**PIES Descriptions Sheet:**
- Description codes: DES, LAB, MKT, FAB
- Multi-language support
- Sequence ordering

**PIES Attributes Sheet:**
- Attribute ID/Value pairs
- UOM support
- Unlimited attributes per product

**PIES Packages Sheet:**
- Dimensions and weight
- Multiple UOM support
- Package types and descriptions

#### Template Download
Use the "PIES Template" button to download a pre-formatted Excel template with:
- Field names and data types
- Sample data rows
- All PIES 7.2 compliant fields
- Multiple sheets for related data

### XML Import (ACES/PIES)
The system accepts standard ACES 4.1 and PIES 7.2 XML formats:
- ACES XML for vehicle fitment data
- PIES XML for product information

## 🏗 Architecture

### Frontend Structure
```
client/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API service layer
│   ├── types/         # TypeScript definitions
│   └── App.tsx        # Main application
```

### Backend Structure
```
server/
├── src/
│   ├── routes/        # API route handlers
│   ├── services/      # Business logic
│   ├── utils/         # Utility functions
│   ├── types/         # TypeScript definitions
│   └── index.ts       # Server entry point
```

## 🔧 Development

### Running Individual Services
```bash
# Frontend only
cd client && npm run dev

# Backend only
cd server && npm run dev
```

### Building for Production
```bash
npm run build
```

## 📋 Sample Data & PIES Seed Integration

The system automatically loads comprehensive PIES data on startup:

### PIES Text File Processing
- **PIES_ITEM.txt** - Core product identifiers and classifications
- **PIES_ITEM_DESC.txt** - Product descriptions (DES, LAB, MKT, FAB)
- **PIES_ITEM_ATRB.txt** - Product attributes (material, dimensions, etc.)
- **PIES_ITEM_PACK.txt** - Packaging information
- **PIES_ITEM_ASSET.txt** - Digital assets and images
- **PIES_ITEM_ASST.txt** - Product assortments

### Fallback Sample Data
If PIES files are not available, the system includes:
- **Products**: Brake pads and air filters with full PIES compliance
- **Customers**: B2B and B2C examples
- **Orders**: Sample orders with line items

### Data Loading Process
1. Server startup attempts to parse PIES text files
2. Converts pipe-delimited data to structured JSON
3. Creates products with complete PIES relationships
4. Falls back to sample data if PIES files unavailable
5. All data immediately available in Product Detail tabs

## 🚀 Deployment

### AWS Infrastructure
1. **API Gateway** + **Lambda** for serverless backend
2. **S3** for static frontend hosting and file storage
3. **DynamoDB** for ACES/PIES data
4. **Aurora Postgres** for relational data
5. **CloudWatch** for monitoring and logging

### Environment Variables
```bash
# Production
AWS_REGION=us-east-1
DYNAMODB_TABLE_PREFIX=auto-parts-erp
S3_BUCKET=auto-parts-erp-files
COGNITO_USER_POOL_ID=your-pool-id

# PIES Data Configuration
PIES_DATA_PATH=/path/to/pies/files
PIES_AUTO_LOAD=true
PIES_VALIDATION_STRICT=false
```

## 🔄 PIES Data Processing

### Startup Sequence
1. **File Detection**: Scans for PIES_*.txt files in project root
2. **Parsing**: Processes pipe-delimited format with headers
3. **Validation**: Checks required fields and data integrity
4. **Conversion**: Maps to internal PIES 7.2 schema
5. **Storage**: Populates in-memory store (DynamoDB in production)
6. **UI Population**: Immediately available in Product Detail tabs

### Supported PIES Files
- `PIES_ITEM.txt` - Core product data
- `PIES_ITEM_DESC.txt` - Descriptions and marketing copy
- `PIES_ITEM_ATRB.txt` - Product attributes and specifications
- `PIES_ITEM_PACK.txt` - Packaging and shipping data
- `PIES_ITEM_ASSET.txt` - Digital assets and media
- `PIES_ITEM_ASST.txt` - Product assortments and collections

### Processing Statistics
Server logs show:
- Files processed and record counts
- Validation errors and warnings
- Products created with PIES relationships
- Processing time and performance metrics

## 📚 ACES/PIES Compliance

### ACES 4.1 Support
- **Vehicle Fitment**: Year, Make, Model, Sub Model, Engine
- **Application Mapping**: Position, Quantity, Part Type
- **Extended Attributes**: Transmission, Drive Type, Body Type, Bed Length
- **Qualifiers**: Custom application qualifiers
- **Notes**: Application-specific notes and warnings

### PIES 7.2 Support
- **Item Information**: GTIN, UNSPSC, Part Type, Category Code, Hazmat
- **Descriptions**: DES, LAB, MKT, FAB with multi-language support
- **Pricing**: Multiple price types (LIST, MSRP, COST, JOBBER)
- **EXPI**: Extended product information and country of origin
- **Attributes**: Unlimited attribute/value pairs with UOM
- **Packaging**: Dimensions, weight, package types
- **Kits**: Multi-component kit relationships
- **Interchange**: OE and aftermarket part cross-references
- **Assets**: Digital images, documents, and media
- **Assortments**: Product groupings and collections
- **Market Copy**: SEO and marketing content

### Field Coverage
Implements **ALL** fields from:
- PIES 7.2 Technical Specifications (Excel)
- ACES 4.1 Technical Documentation
- Supports both required and conditional fields
- Color-coded field importance in UI
- Real-time validation and error checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Examine the sample data structure
- Test with the provided Excel/XML examples

---

## 🎯 PIES/ACES Integration Features

### ✅ Completed Implementation
- [x] Full PIES 7.2 type definitions
- [x] ACES 4.1 application mapping
- [x] Seed data parser for PIES text files
- [x] Comprehensive Excel import/export
- [x] Product Detail UI with all PIES tabs
- [x] Template generation and download
- [x] Real-time data loading on startup
- [x] Fallback sample data with PIES structure
- [x] Multi-sheet Excel support
- [x] Attribute and description management

### 🚀 Production Readiness
- DynamoDB schema for PIES JSON storage
- Aurora Postgres for relational ERP data
- S3 integration for file processing
- Background job processing
- AWS Lambda deployment ready
- CloudWatch monitoring integration

**Built with ❤️ for the automotive aftermarket industry**

*Fully compliant with ACES 4.1 and PIES 7.2 standards*