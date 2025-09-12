import React, { useState } from 'react';
import { Search, Package, DollarSign, Truck } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  items: number;
  weight: number;
  value: number;
  destination: string;
  priority: 'standard' | 'urgent' | 'express';
  status: 'ready' | 'processing' | 'shipped';
  orderDate: string;
}

const OrdersToShipTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'processing' | 'shipped'>('all');
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const orders: Order[] = [
    { id: '1', orderNumber: 'ORD-2025-001', customer: 'ABC Auto Repair', items: 3, weight: 15.5, value: 245.99, destination: 'Toronto, ON', priority: 'standard', status: 'ready', orderDate: '2025-09-10' },
    { id: '2', orderNumber: 'ORD-2025-002', customer: 'Quick Fix Garage', items: 1, weight: 8.2, value: 89.5, destination: 'Vancouver, BC', priority: 'urgent', status: 'ready', orderDate: '2025-09-10' },
    { id: '3', orderNumber: 'ORD-2025-003', customer: 'Metro Motors', items: 5, weight: 22.1, value: 456.75, destination: 'Calgary, AB', priority: 'express', status: 'processing', orderDate: '2025-09-09' },
  ];

  const filtered = orders.filter(o => (o.orderNumber+o.customer).toLowerCase().includes(searchTerm.toLowerCase()) && (statusFilter==='all' || o.status===statusFilter));

  const toggle = (id: string) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  const priorityClass = (p: Order['priority']) => p==='express' ? 'bg-red-100 text-red-800' : p==='urgent' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
  const statusClass = (s: Order['status']) => s==='shipped' ? 'bg-blue-100 text-blue-800' : s==='processing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search orders..." className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="px-3 py-2 border rounded-md">
            <option value="all">All Status</option>
            <option value="ready">Ready to Ship</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
        <div className="flex items-center space-x-2">
          {selectedOrders.length>0 && (
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded text-sm">
              <Truck className="h-4 w-4 mr-2"/> Ship Selected ({selectedOrders.length})
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Select</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Weight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Destination</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Status</th>
                <th className="px-6 py-3"/>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map(o => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4"><input type="checkbox" checked={selectedOrders.includes(o.id)} onChange={()=>toggle(o.id)} className="rounded border-gray-300 text-blue-600"/></td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{o.orderNumber}</div>
                    <div className="text-xs text-gray-500">{o.orderDate}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">{o.customer}</td>
                  <td className="px-6 py-4 text-sm"><div className="flex items-center"><Package className="h-4 w-4 text-gray-400 mr-1"/> {o.items}</div></td>
                  <td className="px-6 py-4 text-sm">{o.weight} lbs</td>
                  <td className="px-6 py-4 text-sm"><div className="flex items-center"><DollarSign className="h-4 w-4 text-gray-400 mr-1"/> {o.value.toFixed(2)}</div></td>
                  <td className="px-6 py-4 text-sm">{o.destination}</td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs rounded-full ${priorityClass(o.priority)}`}>{o.priority}</span></td>
                  <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 text-xs rounded-full ${statusClass(o.status)}`}>{o.status}</span></td>
                  <td className="px-6 py-4 text-sm text-right space-x-3"><button className="text-blue-600">Ship</button><button className="text-gray-600">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length===0 && (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400"/>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p className="mt-1 text-sm text-gray-500">{searchTerm || statusFilter!=='all' ? 'Try adjusting search or filters.' : 'No orders are ready to ship.'}</p>
        </div>
      )}
    </div>
  );
};

export default OrdersToShipTab;

