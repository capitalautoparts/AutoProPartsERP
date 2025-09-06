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

### Excel Import Format
Products Excel file should have:
- **Row 1**: `manufacturer, brand, partNumber, sku, productName, shortDescription, longDescription, stock, unitType, qtyOnHand`
- **Row 2**: `string, string, string, string, string, string, string, number, string, number` (optional)
- **Row 3+**: Data rows

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

## 📋 Sample Data

The system comes with sample data including:
- **Products**: Brake pads and air filters with ACES/PIES compliance
- **Customers**: B2B and B2C examples
- **Orders**: Sample orders with line items

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
```

## 📚 ACES/PIES Compliance

### ACES 4.1 Support
- Vehicle fitment data
- Application mapping
- Attribute filters
- Schema validation

### PIES 7.2 Support
- Complete product information
- All required and conditional fields
- Multi-language support
- Digital asset management

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

**Built with ❤️ for the automotive aftermarket industry**