import { v4 as uuidv4 } from 'uuid';
import { Product, Customer, Order } from '../types/index.js';
import { piesSeedService } from './piesSeedService.js';
import { internalIdService, InternalIdProduct } from './internalIdService.js';

// In-memory data store (replace with DynamoDB/Aurora in production)
// WARNING: This implementation will not scale beyond ~10K products
// For 1M+ products, use ScalableDataService with database backend
class DataService {
  public products: InternalIdProduct[] = [];
  private productLookupMap: Map<string, InternalIdProduct> = new Map();
  private customers: Customer[] = [];
  private orders: Order[] = [];
  private initialized = false;

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    if (this.initialized) return;
    
    try {
      // Load reference databases first
      const { referenceDataService } = await import('./referenceDataService.js');
      await referenceDataService.loadAllReferenceDatabases();
      
      // Then load PIES seed data
      console.log('Loading PIES seed data...');
      const seedResult = await piesSeedService.processSeedData();
      
      if (seedResult.success && seedResult.itemsProcessed > 0) {
        console.log('PIES seed data loaded successfully');
      } else {
        console.warn('PIES seed data not available or empty. No products loaded.');
      }
    } catch (error) {
      console.warn('Failed to load PIES/reference data:', error);
    }
    
    this.initializeCustomersAndOrders();
    this.initialized = true;
  }

  // Set products strictly from PIES-converted Product[] and build lookup map
  setProductsFromPIES(products: Product[]) {
    const converted: InternalIdProduct[] = products.map(p => {
      const brandId = p.piesItem?.brandId;
      if (!brandId) {
        throw new Error(`Missing BrandID for PartNo ${p.partNumber}`);
      }
      const internal = internalIdService.convertToInternalId(p, brandId);
      return internal;
    });

    this.products = converted;
    this.productLookupMap = new Map();
    converted.forEach(prod => {
      this.productLookupMap.set(prod.internalProductId, prod);
    });
  }

  private initializeCustomersAndOrders() {

    if (this.customers.length > 0) return;
    
    // Sample customers
    this.customers = [
      {
        id: uuidv4(),
        name: 'ABC Auto Parts',
        email: 'orders@abcauto.com',
        phone: '555-0123',
        address: '123 Main St, Anytown, ST 12345',
        type: 'B2B',
        status: 'active'
      },
      {
        id: uuidv4(),
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '555-0456',
        address: '456 Oak Ave, Somewhere, ST 67890',
        type: 'B2C',
        status: 'active'
      }
    ];
    console.log('Created sample customers:', this.customers.map(c => ({ id: c.id, name: c.name })));

    if (this.orders.length > 0) return;
    
    // Sample orders (only create if products exist)
    if (this.products.length > 0) {
      this.orders = [
        {
          id: uuidv4(),
          customerId: this.customers[0].id,
          orderNumber: 'ORD-001',
          status: 'processing',
          items: [
            {
              id: uuidv4(),
              productId: this.products[0].id, // This should now be the internal ID
              quantity: 2,
              unitPrice: 89.99,
              total: 179.98
            }
          ],
          total: 179.98,
          orderDate: new Date().toISOString()
        }
      ];
    }
  }

  // Products
  getAllProducts(): InternalIdProduct[] {
    return this.products;
  }

  // Enhanced product lookup with dual ID support
  // NOTE: For production with 1M+ products, this should be async with database lookup
  getProductById(id: string): InternalIdProduct | undefined {
    // First try internal ID lookup (primary method)
    let product = this.productLookupMap.get(id);
    
    // If not found, try UUID lookup for backward compatibility
    if (!product) {
      product = this.products.find(p => p.id === id);
    }
    
    return product;
  }

  // Dedicated internal ID lookup method
  getProductByInternalId(internalId: string): InternalIdProduct | undefined {
    return this.productLookupMap.get(internalId);
  }

  // Brand + part number lookup
  getProductByBrandAndPartNumber(brand: string, partNumber: string): InternalIdProduct | undefined {
    const internalId = `${brand.toUpperCase().replace(/[^A-Z0-9]/g, '')}${partNumber.replace(/[^A-Za-z0-9]/g, '')}`;
    return this.getProductByInternalId(internalId);
  }

  // ID validation methods
  isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  }

  isValidInternalId(id: string): boolean {
    return /^[A-Z0-9]{3,60}$/i.test(id);
  }

  getProductsByInternalIds(internalIds: string[]): InternalIdProduct[] {
    const result = internalIdService.batchLookup(internalIds, this.productLookupMap);
    return result.products;
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): InternalIdProduct {
    // Validate product for internal ID generation
    const validation = internalIdService.validateProductForInternalId(product);
    if (!validation.valid) {
      throw new Error(`Cannot create product: ${validation.errors.join(', ')}`);
    }

    const baseProduct: Product = {
      ...product,
      id: '', // Will be set by internal ID
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newProduct = internalIdService.convertToInternalId(baseProduct, validation.brandId);
    
    // Check for duplicates
    if (this.productLookupMap.has(newProduct.internalProductId)) {
      throw new Error(`Product already exists: ${newProduct.internalProductId}`);
    }
    
    this.products.push(newProduct);
    this.productLookupMap.set(newProduct.internalProductId, newProduct);
    return newProduct;
  }

  updateProduct(internalId: string, updates: Partial<Product>): InternalIdProduct | null {
    const existingProduct = this.productLookupMap.get(internalId);
    if (!existingProduct) return null;
    
    const updatedProduct: InternalIdProduct = {
      ...existingProduct,
      ...updates,
      internalProductId: existingProduct.internalProductId, // Preserve internal ID
      brandId: existingProduct.brandId, // Preserve brand ID
      updatedAt: new Date().toISOString()
    };
    
    // Update in array
    const index = this.products.findIndex(p => p.internalProductId === internalId);
    if (index !== -1) {
      this.products[index] = updatedProduct;
    }
    
    // Update in lookup map
    this.productLookupMap.set(internalId, updatedProduct);
    return updatedProduct;
  }

  deleteProduct(internalId: string): boolean {
    const index = this.products.findIndex(p => p.internalProductId === internalId);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    this.productLookupMap.delete(internalId);
    return true;
  }

  // Internal ID specific methods
  generateInternalId(brandId: string, partNumber: string): string {
    return internalIdService.generateProductId(brandId, partNumber);
  }

  validateInternalId(internalId: string): boolean {
    return internalIdService.validateProductId(internalId);
  }

  // Customers
  getAllCustomers(): Customer[] {
    return this.customers;
  }

  getCustomerById(id: string): Customer | undefined {
    return this.customers.find(c => c.id === id);
  }

  createCustomer(customer: Omit<Customer, 'id'>): Customer {
    const newCustomer: Customer = {
      ...customer,
      id: uuidv4()
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  updateCustomer(id: string, updates: Partial<Customer>): Customer | null {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    const current = this.customers[idx];
    const updated: Customer = {
      ...current,
      ...updates,
    } as Customer;
    this.customers[idx] = updated;
    return updated;
  }

  deleteCustomer(id: string): boolean {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx === -1) return false;
    this.customers.splice(idx, 1);
    return true;
  }

  // Orders
  getAllOrders(): Order[] {
    return this.orders;
  }

  getOrderById(id: string): Order | undefined {
    return this.orders.find(o => o.id === id);
  }

  createOrder(order: Omit<Order, 'id'>): Order {
    const newOrder: Order = {
      ...order,
      id: uuidv4()
    };
    this.orders.push(newOrder);
    return newOrder;
  }
}

export const dataService = new DataService();
