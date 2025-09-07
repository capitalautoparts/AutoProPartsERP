/**
 * Cross-Module Integration Service
 * Manages relationships between products and other ERP modules using internal IDs
 */

import { v4 as uuidv4 } from 'uuid';
import { dataService } from './dataService.js';

// Cross-module types using internal IDs
export interface InventoryTransaction {
  id: string;
  internalProductId: string;
  transactionType: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
  quantity: number;
  reason?: string;
  orderId?: string;
  purchaseOrderId?: string;
  transactionDate: string;
  unitCost?: number;
}

export interface OrderLineItem {
  id: string;
  orderId: string;
  internalProductId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  productName?: string;
  partNumber?: string;
}

export interface PurchaseOrderLineItem {
  id: string;
  purchaseOrderId: string;
  internalProductId: string;
  quantity: number;
  unitCost: number;
  total: number;
  productName?: string;
  partNumber?: string;
  supplierId?: string;
}

export interface InventorySummary {
  internalProductId: string;
  qtyOnHand: number;
  qtyReserved: number;
  qtyAvailable: number;
  unitCost: number;
  totalValue: number;
  lastUpdated: string;
}

class CrossModuleService {
  private inventoryTransactions: InventoryTransaction[] = [];
  private orderLineItems: OrderLineItem[] = [];
  private purchaseOrderLineItems: PurchaseOrderLineItem[] = [];

  // Inventory Management
  
  /**
   * Create inventory transaction
   */
  createInventoryTransaction(transaction: Omit<InventoryTransaction, 'id' | 'transactionDate'>): InventoryTransaction {
    const product = dataService.getProductById(transaction.internalProductId);
    if (!product) {
      throw new Error(`Product not found: ${transaction.internalProductId}`);
    }

    const newTransaction: InventoryTransaction = {
      ...transaction,
      id: uuidv4(),
      transactionDate: new Date().toISOString()
    };

    this.inventoryTransactions.push(newTransaction);

    // Update product quantity
    const newQty = product.qtyOnHand + (transaction.transactionType === 'OUT' ? -transaction.quantity : transaction.quantity);
    dataService.updateProduct(transaction.internalProductId, {
      qtyOnHand: Math.max(0, newQty),
      stock: Math.max(0, newQty)
    });

    return newTransaction;
  }

  /**
   * Get inventory transactions for product
   */
  getInventoryTransactions(internalProductId: string): InventoryTransaction[] {
    return this.inventoryTransactions.filter(t => t.internalProductId === internalProductId);
  }

  /**
   * Get inventory summary for product
   */
  getInventorySummary(internalProductId: string): InventorySummary | null {
    const product = dataService.getProductById(internalProductId);
    if (!product) return null;

    const reservedQty = this.getReservedQuantity(internalProductId);
    const unitCost = this.getAverageUnitCost(internalProductId);

    return {
      internalProductId,
      qtyOnHand: product.qtyOnHand,
      qtyReserved: reservedQty,
      qtyAvailable: Math.max(0, product.qtyOnHand - reservedQty),
      unitCost,
      totalValue: product.qtyOnHand * unitCost,
      lastUpdated: product.updatedAt
    };
  }

  /**
   * Batch inventory lookup
   */
  batchInventorySummary(internalProductIds: string[]): InventorySummary[] {
    return internalProductIds
      .map(id => this.getInventorySummary(id))
      .filter(summary => summary !== null) as InventorySummary[];
  }

  // Order Management

  /**
   * Create order line item
   */
  createOrderLineItem(orderLineItem: Omit<OrderLineItem, 'id' | 'productName' | 'partNumber'>): OrderLineItem {
    const product = dataService.getProductById(orderLineItem.internalProductId);
    if (!product) {
      throw new Error(`Product not found: ${orderLineItem.internalProductId}`);
    }

    const newLineItem: OrderLineItem = {
      ...orderLineItem,
      id: uuidv4(),
      productName: product.productName,
      partNumber: product.partNumber
    };

    this.orderLineItems.push(newLineItem);

    // Create inventory transaction for order
    this.createInventoryTransaction({
      internalProductId: orderLineItem.internalProductId,
      transactionType: 'OUT',
      quantity: orderLineItem.quantity,
      reason: 'Sales Order',
      orderId: orderLineItem.orderId
    });

    return newLineItem;
  }

  /**
   * Get order line items for order
   */
  getOrderLineItems(orderId: string): OrderLineItem[] {
    return this.orderLineItems.filter(item => item.orderId === orderId);
  }

  /**
   * Get order line items for product
   */
  getOrderLineItemsByProduct(internalProductId: string): OrderLineItem[] {
    return this.orderLineItems.filter(item => item.internalProductId === internalProductId);
  }

  // Purchase Order Management

  /**
   * Create purchase order line item
   */
  createPurchaseOrderLineItem(poLineItem: Omit<PurchaseOrderLineItem, 'id' | 'productName' | 'partNumber'>): PurchaseOrderLineItem {
    const product = dataService.getProductById(poLineItem.internalProductId);
    if (!product) {
      throw new Error(`Product not found: ${poLineItem.internalProductId}`);
    }

    const newLineItem: PurchaseOrderLineItem = {
      ...poLineItem,
      id: uuidv4(),
      productName: product.productName,
      partNumber: product.partNumber
    };

    this.purchaseOrderLineItems.push(newLineItem);
    return newLineItem;
  }

  /**
   * Receive purchase order (add to inventory)
   */
  receivePurchaseOrder(purchaseOrderId: string): InventoryTransaction[] {
    const poLineItems = this.purchaseOrderLineItems.filter(item => item.purchaseOrderId === purchaseOrderId);
    const transactions: InventoryTransaction[] = [];

    for (const lineItem of poLineItems) {
      const transaction = this.createInventoryTransaction({
        internalProductId: lineItem.internalProductId,
        transactionType: 'IN',
        quantity: lineItem.quantity,
        reason: 'Purchase Order Receipt',
        purchaseOrderId,
        unitCost: lineItem.unitCost
      });
      transactions.push(transaction);
    }

    return transactions;
  }

  /**
   * Get purchase order line items
   */
  getPurchaseOrderLineItems(purchaseOrderId: string): PurchaseOrderLineItem[] {
    return this.purchaseOrderLineItems.filter(item => item.purchaseOrderId === purchaseOrderId);
  }

  // Accounting Integration

  /**
   * Calculate COGS for product sales
   */
  calculateCOGS(internalProductId: string, quantitySold: number): number {
    const unitCost = this.getAverageUnitCost(internalProductId);
    return unitCost * quantitySold;
  }

  /**
   * Get inventory valuation for product
   */
  getInventoryValue(internalProductId: string): number {
    const summary = this.getInventorySummary(internalProductId);
    return summary ? summary.totalValue : 0;
  }

  /**
   * Get total inventory valuation
   */
  getTotalInventoryValue(): number {
    const allProducts = dataService.getAllProducts();
    return allProducts.reduce((total, product) => {
      return total + this.getInventoryValue(product.internalProductId);
    }, 0);
  }

  // Utility Methods

  /**
   * Get reserved quantity for product (from pending orders)
   */
  private getReservedQuantity(internalProductId: string): number {
    // Mock implementation - in real system, check pending orders
    return 0;
  }

  /**
   * Calculate average unit cost from inventory transactions
   */
  private getAverageUnitCost(internalProductId: string): number {
    const product = dataService.getProductById(internalProductId);
    if (!product) return 0;

    const costTransactions = this.inventoryTransactions.filter(
      t => t.internalProductId === internalProductId && 
           t.transactionType === 'IN' && 
           t.unitCost !== undefined
    );

    if (costTransactions.length === 0) {
      // Fallback to product's base cost or default
      return 10.00; // Mock default cost
    }

    const totalCost = costTransactions.reduce((sum, t) => sum + (t.unitCost! * t.quantity), 0);
    const totalQuantity = costTransactions.reduce((sum, t) => sum + t.quantity, 0);

    return totalQuantity > 0 ? totalCost / totalQuantity : 0;
  }

  // External System Integration

  /**
   * Map internal ID to external system identifiers
   */
  mapToExternalSystem(internalProductId: string): {
    buyerPartNumber: string;
    vendorPartNumber: string;
    manufacturerPartNumber: string;
    brandCode: string;
  } | null {
    const product = dataService.getProductById(internalProductId);
    if (!product) return null;

    return {
      buyerPartNumber: internalProductId,
      vendorPartNumber: product.partNumber,
      manufacturerPartNumber: product.partNumber,
      brandCode: product.brandId
    };
  }

  /**
   * Sync inventory with external warehouse
   */
  async syncInventoryWithWarehouse(internalProductId: string): Promise<{
    success: boolean;
    externalReference?: string;
    error?: string;
  }> {
    const product = dataService.getProductById(internalProductId);
    if (!product) {
      return { success: false, error: 'Product not found' };
    }

    // Mock external API call
    try {
      const externalMapping = this.mapToExternalSystem(internalProductId);
      
      // Simulate API call
      console.log(`Syncing inventory for ${internalProductId} with external warehouse`);
      
      return {
        success: true,
        externalReference: `EXT-${Date.now()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Reporting and Analytics

  /**
   * Get product movement report
   */
  getProductMovementReport(internalProductId: string, days: number = 30): {
    internalProductId: string;
    productName: string;
    partNumber: string;
    totalIn: number;
    totalOut: number;
    netMovement: number;
    transactionCount: number;
    period: string;
  } | null {
    const product = dataService.getProductById(internalProductId);
    if (!product) return null;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const transactions = this.inventoryTransactions.filter(
      t => t.internalProductId === internalProductId && 
           new Date(t.transactionDate) >= cutoffDate
    );

    const totalIn = transactions
      .filter(t => ['IN', 'ADJUST'].includes(t.transactionType) && t.quantity > 0)
      .reduce((sum, t) => sum + t.quantity, 0);

    const totalOut = transactions
      .filter(t => ['OUT'].includes(t.transactionType) || (t.transactionType === 'ADJUST' && t.quantity < 0))
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

    return {
      internalProductId,
      productName: product.productName,
      partNumber: product.partNumber,
      totalIn,
      totalOut,
      netMovement: totalIn - totalOut,
      transactionCount: transactions.length,
      period: `${days} days`
    };
  }
}

export const crossModuleService = new CrossModuleService();