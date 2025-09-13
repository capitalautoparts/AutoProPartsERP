import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, Eye, Search as SearchIcon, MoreHorizontal,
  Users, Mail, Phone, AlertTriangle, ShoppingCart
} from 'lucide-react';
import { customersApi } from '../services/api';
import { Customer } from '../types';
import ImportExportButtons from '../components/ImportExportButtons';
import JobStatusModal from '../components/JobStatusModal';
import CustomerModal from '../components/CustomerModal';

interface CustomerDataView extends Customer {
  accountNumber: string;
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  customerType: 'B2B' | 'B2C';
  businessType: 'auto_repair' | 'body_shop' | 'dealership' | 'fleet' | 'retail' | 'wholesale' | 'individual';
  territory: string;
  defaultWarehouse: string;
  salesRep: string;
  status: 'active' | 'inactive' | 'suspended' | 'prospect';
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  daysSinceLastOrder: number;
  creditLimit: number;
  currentBalance: number;
  paymentTerms: string;
  profileCompleteness: number;
  missingFields: string[];
  hasShippingAddress: boolean;
  hasAdditionalContacts: boolean;
  tags: string[];
  isVIP: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  dateCreated: string;
  lastUpdated: string;
  lastActivityDate: string;
}

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobType, setActiveJobType] = useState<'import' | 'export'>('import');

  const { data: customersResponse, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customersApi.getAll().then(res => res.data),
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });

  const customers: Customer[] = (customersResponse as any) || [];

  // Local search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [territoryFilter, setTerritoryFilter] = useState('');
  const [salesRepFilter, setSalesRepFilter] = useState('');
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [showB2BOnly, setShowB2BOnly] = useState(false);
  const [showHighValueOnly, setShowHighValueOnly] = useState(false);
  const [showAtRiskOnly, setShowAtRiskOnly] = useState(false);
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [showRecentOnly, setShowRecentOnly] = useState(false);
  const [selectedCustomers, setSelectedCustomers] = useState<Set<string>>(new Set());
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerDataView | null>(null);

  const calculateProfileCompleteness = (c: CustomerDataView): number => {
    const checks: boolean[] = [];
    checks.push(!!c.companyName);
    checks.push(!!c.primaryContactName);
    checks.push(!!c.primaryContactEmail);
    checks.push(!!c.primaryContactPhone);
    checks.push(!!c.billingAddress?.street1);
    checks.push(!!c.billingAddress?.city);
    checks.push(!!c.billingAddress?.province);
    checks.push(!!c.billingAddress?.postalCode);
    checks.push(!!c.territory);
    checks.push(!!c.defaultWarehouse);
    checks.push(!!c.salesRep);
    checks.push(!!(c.shippingAddresses && c.shippingAddresses.length > 0));
    const total = checks.length;
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / total) * 100);
  };

  const getMissingFields = (c: CustomerDataView): string[] => {
    const missing: string[] = [];
    if (!c.companyName) missing.push('Company Name');
    if (!c.primaryContactName) missing.push('Primary Contact');
    if (!c.primaryContactEmail) missing.push('Email');
    if (!c.primaryContactPhone) missing.push('Phone');
    if (!c.territory) missing.push('Territory');
    if (!c.defaultWarehouse) missing.push('Default Warehouse');
    if (!c.salesRep) missing.push('Sales Rep');
    if (!c.billingAddress?.street1) missing.push('Billing Address');
    if (!c.shippingAddresses?.length) missing.push('Shipping Address');
    return missing;
  };

  const getRiskLevel = (c: CustomerDataView): 'low' | 'medium' | 'high' => {
    if (!c.lastOrderDate) return 'high';
    const daysSince = Math.floor((Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince > 180) return 'high';
    if (daysSince > 90) return 'medium';
    return 'low';
  };

  // Enrich base customers safely from legacy/minimal data
  const normalizedCustomers: CustomerDataView[] = useMemo(() => {
    return customers.map((c) => {
      const companyName = c.companyName || c.name || '—';
      const primaryContactName = c.primaryContact?.name || c.contactName || c.name || '—';
      const primaryContactEmail = c.primaryContact?.email || c.email || '';
      const primaryContactPhone = c.primaryContact?.phone || c.phone || '';
      const customerType = (c.customerType || c.type || 'B2C') as 'B2B' | 'B2C';
      const businessType = (c.businessType || 'individual') as CustomerDataView['businessType'];
      const status = (c.status || 'active') as CustomerDataView['status'];
      const dateCreated = c.dateCreated || new Date().toISOString();
      const lastUpdated = c.lastUpdated || dateCreated;
      const lastOrderDate = c.lastOrderDate;
      const lastActivityDate = c.lastActivityDate || lastOrderDate || dateCreated;
      const totalOrders = c.totalOrders || 0;
      const totalRevenue = c.totalRevenue || 0;
      const averageOrderValue = c.averageOrderValue || 0;
      const territory = c.territory || '';
      const defaultWarehouse = c.defaultWarehouse || '';
      const salesRep = c.salesRep || '';
      const creditLimit = c.creditLimit || 0;
      const currentBalance = (c as any).currentBalance || 0;
      const paymentTerms = c.paymentTerms || '';
      const tags = c.tags || [];
      const accountNumber = c.accountNumber || `C${(territory || 'XX').substring(0,2).toUpperCase()}${String(c.id).slice(-6)}`;

      const base: CustomerDataView = {
        ...c,
        accountNumber,
        companyName,
        primaryContactName,
        primaryContactEmail,
        primaryContactPhone,
        customerType,
        businessType,
        territory,
        defaultWarehouse,
        salesRep,
        status,
        totalOrders,
        totalRevenue,
        averageOrderValue,
        lastOrderDate,
        daysSinceLastOrder: lastOrderDate ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000*60*60*24)) : -1,
        creditLimit,
        currentBalance,
        paymentTerms,
        profileCompleteness: 0,
        missingFields: [],
        hasShippingAddress: !!(c.shippingAddresses && c.shippingAddresses.length > 0),
        hasAdditionalContacts: !!(c.additionalContacts && c.additionalContacts.length > 0),
        tags,
        isVIP: tags.includes('VIP'),
        riskLevel: 'low',
        dateCreated,
        lastUpdated,
        lastActivityDate,
      };
      base.profileCompleteness = calculateProfileCompleteness(base);
      base.missingFields = getMissingFields(base);
      base.riskLevel = getRiskLevel(base);
      return base;
    });
  }, [customers]);

  // Filter options
  const territoryOptions = useMemo(() => Array.from(new Set(normalizedCustomers.map(c => c.territory).filter(Boolean))).sort(), [normalizedCustomers]);
  const salesRepOptions = useMemo(() => Array.from(new Set(normalizedCustomers.map(c => c.salesRep).filter(Boolean))).sort(), [normalizedCustomers]);

  // Apply filters/search
  const filteredCustomers = useMemo(() => {
    let list = normalizedCustomers;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(c =>
        c.companyName.toLowerCase().includes(q) ||
        c.accountNumber.toLowerCase().includes(q) ||
        c.primaryContactName.toLowerCase().includes(q) ||
        c.primaryContactEmail.toLowerCase().includes(q) ||
        c.primaryContactPhone.includes(q) ||
        (c.territory || '').toLowerCase().includes(q)
      );
    }
    if (customerTypeFilter) list = list.filter(c => c.customerType === (customerTypeFilter as any));
    if (businessTypeFilter) list = list.filter(c => c.businessType === (businessTypeFilter as any));
    if (statusFilter) list = list.filter(c => c.status === (statusFilter as any));
    if (territoryFilter) list = list.filter(c => c.territory === territoryFilter);
    if (salesRepFilter) list = list.filter(c => c.salesRep === salesRepFilter);
    if (showActiveOnly) list = list.filter(c => c.status === 'active');
    if (showB2BOnly) list = list.filter(c => c.customerType === 'B2B');
    if (showHighValueOnly) list = list.filter(c => c.totalRevenue > 10000);
    if (showAtRiskOnly) list = list.filter(c => c.riskLevel === 'high');
    if (showIncompleteOnly) list = list.filter(c => c.profileCompleteness < 90);
    if (showRecentOnly) {
      const now = new Date().getTime();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;
      list = list.filter(c => now - new Date(c.lastActivityDate).getTime() <= thirtyDays);
    }
    return list;
  }, [normalizedCustomers, searchTerm, customerTypeFilter, businessTypeFilter, statusFilter, territoryFilter, salesRepFilter, showActiveOnly, showB2BOnly, showHighValueOnly, showAtRiskOnly, showIncompleteOnly, showRecentOnly]);

  // KPIs
  const customerKPIs = useMemo(() => {
    const total = normalizedCustomers.length;
    const active = normalizedCustomers.filter(c => c.status === 'active').length;
    const b2b = normalizedCustomers.filter(c => c.customerType === 'B2B').length;
    const highValue = normalizedCustomers.filter(c => c.totalRevenue > 10000).length;
    const atRisk = normalizedCustomers.filter(c => c.riskLevel === 'high').length;
    const incomplete = normalizedCustomers.filter(c => c.profileCompleteness < 90).length;
    const totalRevenue = normalizedCustomers.reduce((sum, c) => sum + c.totalRevenue, 0);
    const avgCompleteness = total ? Math.round(normalizedCustomers.reduce((acc, c) => acc + c.profileCompleteness, 0) / total) : 0;
    return { total, active, b2b, highValue, atRisk, incomplete, totalRevenue, avgCompleteness };
  }, [normalizedCustomers]);

  // Badges and bars
  const CustomerTypeBadge: React.FC<{ type: 'B2B' | 'B2C' }> = ({ type }) => (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
      {type}
    </span>
  );

  const BusinessTypeBadge: React.FC<{ type: CustomerDataView['businessType'] }> = ({ type }) => {
    const typeLabels: Record<CustomerDataView['businessType'], string> = {
      auto_repair: 'Auto Repair',
      body_shop: 'Body Shop',
      dealership: 'Dealership',
      fleet: 'Fleet',
      retail: 'Retail',
      wholesale: 'Wholesale',
      individual: 'Individual'
    };
    const colors: Record<CustomerDataView['businessType'], string> = {
      auto_repair: 'bg-blue-100 text-blue-800',
      body_shop: 'bg-purple-100 text-purple-800',
      dealership: 'bg-indigo-100 text-indigo-800',
      fleet: 'bg-yellow-100 text-yellow-800',
      retail: 'bg-green-100 text-green-800',
      wholesale: 'bg-orange-100 text-orange-800',
      individual: 'bg-gray-100 text-gray-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
        {typeLabels[type]}
      </span>
    );
  };

  const StatusBadge: React.FC<{ status: CustomerDataView['status'] }> = ({ status }) => {
    const colors: Record<CustomerDataView['status'], string> = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      prospect: 'bg-yellow-100 text-yellow-800'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const ProfileCompletenessBar: React.FC<{ percentage: number }> = ({ percentage }) => (
    <div className="flex items-center gap-2">
      <div className="w-16 bg-gray-200 rounded-full h-2">
        <div className={`h-2 rounded-full ${percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs text-gray-600">{percentage}%</span>
    </div>
  );

  // Selection handlers
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!checked) setSelectedCustomers(new Set());
    else setSelectedCustomers(new Set(filteredCustomers.map(c => c.id)));
  };

  const openCreateCustomer = () => { setEditingCustomer(null); setIsCustomerModalOpen(true); };
  const openEditCustomer = (c: CustomerDataView) => { setEditingCustomer(c); setIsCustomerModalOpen(true); };

  const handleSaveCustomer = async (payload: Partial<CustomerDataView>) => {
    try {
      if (editingCustomer) {
        await customersApi.update(editingCustomer.id, payload as any);
      } else {
        await customersApi.create(payload as any);
      }
      setIsCustomerModalOpen(false);
      setEditingCustomer(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (e) {
      console.error('Save customer failed', e);
      alert('Failed to save customer');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Customers (CRM)</h1>
          <p className="mt-2 text-sm text-gray-700">Manage customer relationships and B2B/B2C accounts</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center gap-2">
          <button onClick={openCreateCustomer} className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">New Customer</button>
          <ImportExportButtons
            showXML={false}
            showTemplate={true}
            onImportExcel={(file) => console.log('Import customers:', file)}
            onExportExcel={() => console.log('Export customers')}
            onDownloadTemplate={() => console.log('Download template')}
          />
        </div>
      </div>

      {/* KPI cards (compact, reorganized) */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: 'Total', value: customerKPIs.total, color: 'text-gray-900' },
          { label: 'Active', value: customerKPIs.active, color: 'text-green-600' },
          { label: 'B2B', value: customerKPIs.b2b, color: 'text-blue-600' },
          { label: 'High Value', value: customerKPIs.highValue, color: 'text-purple-600' },
          { label: 'At Risk', value: customerKPIs.atRisk, color: 'text-red-600' },
          { label: 'Revenue', value: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact', maximumFractionDigits: 1 }).format(customerKPIs.totalRevenue), color: 'text-emerald-600' },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-md border bg-white p-3">
            <div className="text-[11px] uppercase tracking-wide text-gray-500">{kpi.label}</div>
            <div className={`mt-1 text-lg font-semibold ${kpi.color}`}>{kpi.value}</div>
            {/* Optional subtext example: <div className="text-[11px] text-gray-400">vs last 30d</div> */}
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mt-6 mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers by company, account #, contact name, email, or phone"
            className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <select value={customerTypeFilter} onChange={(e) => setCustomerTypeFilter(e.target.value)} className="border rounded px-3 py-1 text-sm bg-white">
          <option value="">All Types</option>
          <option value="B2B">B2B</option>
          <option value="B2C">B2C</option>
        </select>
        <select value={businessTypeFilter} onChange={(e) => setBusinessTypeFilter(e.target.value)} className="border rounded px-3 py-1 text-sm bg-white">
          <option value="">All Business Types</option>
          <option value="auto_repair">Auto Repair</option>
          <option value="body_shop">Body Shop</option>
          <option value="dealership">Dealership</option>
          <option value="fleet">Fleet</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
          <option value="individual">Individual</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-1 text-sm bg-white">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="prospect">Prospect</option>
        </select>
        <select value={territoryFilter} onChange={(e) => setTerritoryFilter(e.target.value)} className="border rounded px-3 py-1 text-sm bg-white">
          <option value="">All Territories</option>
          {territoryOptions.map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select value={salesRepFilter} onChange={(e) => setSalesRepFilter(e.target.value)} className="border rounded px-3 py-1 text-sm bg-white">
          <option value="">All Sales Reps</option>
          {salesRepOptions.map(sr => (<option key={sr} value={sr}>{sr}</option>))}
        </select>
        <button onClick={() => setShowActiveOnly(!showActiveOnly)} className={`px-3 py-1 rounded text-sm ${showActiveOnly ? 'bg-green-100 text-green-800' : 'bg-gray-100'}`}>Active Only</button>
        <button onClick={() => setShowB2BOnly(!showB2BOnly)} className={`px-3 py-1 rounded text-sm ${showB2BOnly ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}>B2B Only</button>
        <button onClick={() => setShowHighValueOnly(!showHighValueOnly)} className={`px-3 py-1 rounded text-sm ${showHighValueOnly ? 'bg-purple-100 text-purple-800' : 'bg-gray-100'}`}>High Value</button>
        <button onClick={() => setShowAtRiskOnly(!showAtRiskOnly)} className={`px-3 py-1 rounded text-sm ${showAtRiskOnly ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>At Risk</button>
        <button onClick={() => setShowIncompleteOnly(!showIncompleteOnly)} className={`px-3 py-1 rounded text-sm ${showIncompleteOnly ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'}`}>Incomplete Profile</button>
        <button onClick={() => setShowRecentOnly(!showRecentOnly)} className={`px-3 py-1 rounded text-sm ${showRecentOnly ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>Recent Activity</button>
        <button onClick={() => { setCustomerTypeFilter(''); setBusinessTypeFilter(''); setStatusFilter(''); setTerritoryFilter(''); setSalesRepFilter(''); setShowActiveOnly(false); setShowB2BOnly(false); setShowHighValueOnly(false); setShowAtRiskOnly(false); setShowIncompleteOnly(false); setShowRecentOnly(false); }} className="ml-auto px-3 py-1 rounded text-sm bg-gray-200">Reset</button>
      </div>

      {/* Bulk actions */}
      {selectedCustomers.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">{selectedCustomers.size} customer(s) selected</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Export Selected</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Update Territory</button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Add Tags</button>
              <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">Change Status</button>
              <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">Assign Sales Rep</button>
              <button onClick={() => setSelectedCustomers(new Set())} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">Clear</button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-4 text-sm text-gray-500">Showing {filteredCustomers.length} of {normalizedCustomers.length} customers</div>

      {/* Table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3">
                    <input type="checkbox" checked={selectedCustomers.size === filteredCustomers.length && filteredCustomers.length > 0} onChange={handleSelectAll} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                  </th>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Account #</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Company & Contact</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Business Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Territory</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Profile Complete</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Order</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Revenue</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="py-4 pl-4 pr-3">
                      <input type="checkbox" checked={selectedCustomers.has(customer.id)} onChange={() => handleSelectCustomer(customer.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    </td>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{customer.accountNumber}</td>
                    <td className="px-3 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{customer.companyName}</div>
                        <div className="text-gray-500 flex items-center gap-4">
                          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{customer.primaryContactName}</span>
                          <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{customer.primaryContactEmail}</span>
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{customer.primaryContactPhone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm"><CustomerTypeBadge type={customer.customerType} /></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm"><BusinessTypeBadge type={customer.businessType} /></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500"><div><div>{customer.territory}</div><div className="text-xs text-gray-400">{customer.salesRep}</div></div></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm"><ProfileCompletenessBar percentage={customer.profileCompleteness} /></td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={customer.status} />
                        {customer.riskLevel === 'high' && (<AlertTriangle className="h-4 w-4 text-red-500" title="At Risk Customer" />)}
                        {customer.isVIP && (<span className="bg-purple-100 text-purple-800 text-xs px-1.5 py-0.5 rounded-full">VIP</span>)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div>
                        <div>{customer.lastOrderDate ? new Date(customer.lastOrderDate).toLocaleDateString() : 'Never'}</div>
                        {customer.daysSinceLastOrder >= 0 && (<div className="text-xs text-gray-400">{customer.daysSinceLastOrder} days ago</div>)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div>
                        <div className="font-medium text-gray-900">${customer.totalRevenue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{customer.totalOrders} orders</div>
                      </div>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/customers/${customer.id}`)} className="text-blue-600 hover:text-blue-900" title="View Customer Details"><Eye className="h-4 w-4" /></button>
                        <button onClick={() => openEditCustomer(customer)} className="text-blue-600 hover:text-blue-900" title="Edit Customer"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => navigate(`/orders/new?customerId=${customer.id}`)} className="text-green-600 hover:text-green-900" title="Create Order"><ShoppingCart className="h-4 w-4" /></button>
                        <button onClick={() => console.log('More actions', customer.id)} className="text-gray-600 hover:text-gray-900" title="More Actions"><MoreHorizontal className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {activeJobId && (
        <JobStatusModal
          jobId={activeJobId}
          jobType={activeJobType}
          onClose={() => setActiveJobId(null)}
          onComplete={() => {
            setActiveJobId(null);
            queryClient.invalidateQueries({ queryKey: ['customers'] });
          }}
        />
      )}

      <CustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => { setIsCustomerModalOpen(false); setEditingCustomer(null); }}
        customer={editingCustomer || undefined}
        onSave={handleSaveCustomer}
      />
    </div>
  );
};

export default CustomersPage;
