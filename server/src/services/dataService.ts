import { v4 as uuidv4 } from 'uuid';
import { Product, Customer, Order } from '../types/index.js';

// In-memory data store (replace with DynamoDB/Aurora in production)
class DataService {
  private products: Product[] = [];
  private customers: Customer[] = [];
  private orders: Order[] = [];

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample product with dummy ACES + PIES data
    this.products = [
      {
        id: uuidv4(),
        manufacturer: 'AutoParts Inc',
        brand: 'ProBrand',
        partNumber: 'PB-12345',
        sku: 'SKU-PB-12345',
        productName: 'Premium Brake Pad Set',
        shortDescription: 'High-performance ceramic brake pads',
        longDescription: 'Premium ceramic brake pads designed for superior stopping power and reduced brake dust. Compatible with multiple vehicle applications.',
        stock: 150,
        unitType: 'Set',
        qtyOnHand: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: uuidv4(),
        manufacturer: 'FilterTech',
        brand: 'CleanAir',
        partNumber: 'CA-67890',
        sku: 'SKU-CA-67890',
        productName: 'Engine Air Filter',
        shortDescription: 'High-flow engine air filter',
        longDescription: 'Advanced filtration technology for improved engine performance and protection.',
        stock: 200,
        unitType: 'Each',
        qtyOnHand: 200,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

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

    // Sample orders
    this.orders = [
      {
        id: uuidv4(),
        customerId: this.customers[0].id,
        orderNumber: 'ORD-001',
        status: 'processing',
        items: [
          {
            id: uuidv4(),
            productId: this.products[0].id,
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

  // Products
  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: string): Product | undefined {
    return this.products.find(p => p.id === id);
  }

  createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.products.push(newProduct);
    return newProduct;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.products[index] = {
      ...this.products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    return this.products[index];
  }

  deleteProduct(id: string): boolean {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
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