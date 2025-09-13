import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Edit, ShoppingCart, Mail, Phone, MapPin as MapPinIcon,
  Building, Users, DollarSign, Clock, TrendingUp, FileText, Package,
  AlertTriangle
} from 'lucide-react';
import { customersApi } from '../services/api';
import { Customer } from '../types';

// Local view model to match CustomersPage enrichment
interface CustomerDataView extends Customer {
  accountNumber: string;
  companyName: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  primaryContactMobile?: string;
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
}

const CustomerDetailPage: React.FC = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview'|'contacts'|'addresses'|'orders'|'activity'|'notes'|'statements'>('overview');

  const queryClient = useQueryClient();
  const { data: rawCustomer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: () => customersApi.getById(customerId!).then(res => res.data),
    enabled: !!customerId,
    staleTime: 0,
  });

  const normalize = (c: Customer | undefined): CustomerDataView | null => {
    if (!c) return null;
    const companyName = c.companyName || c.name || '—';
    const primaryContactName = c.primaryContact?.name || c.contactName || c.name || '—';
    const primaryContactEmail = c.primaryContact?.email || c.email || '';
    const primaryContactPhone = c.primaryContact?.phone || c.phone || '';
    const primaryContactMobile = (c as any).primaryContactMobile || c.primaryContact?.mobile;
    const customerType = (c.customerType || c.type || 'B2C') as 'B2B' | 'B2C';
    const businessType = (c.businessType || 'individual') as CustomerDataView['businessType'];
    const status = (c.status || 'active') as CustomerDataView['status'];
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
    const lastOrderDate = c.lastOrderDate;
    const daysSinceLastOrder = lastOrderDate ? Math.floor((Date.now() - new Date(lastOrderDate).getTime()) / (1000*60*60*24)) : -1;
    const accountNumber = c.accountNumber || `C${(territory || 'XX').substring(0,2).toUpperCase()}${String(c.id).slice(-6)}`;
    const hasShippingAddress = !!(c.shippingAddresses && c.shippingAddresses.length > 0);
    const hasAdditionalContacts = !!(c.additionalContacts && c.additionalContacts.length > 0);
    const profileCompleteness = calculateProfileCompleteness({
      companyName, primaryContactName, primaryContactEmail, primaryContactPhone,
      billingAddress: c.billingAddress, territory, defaultWarehouse, salesRep,
      shippingLen: c.shippingAddresses?.length || 0
    });
    const missingFields = getMissingFields({
      companyName, primaryContactName, primaryContactEmail, primaryContactPhone,
      billingAddress: c.billingAddress, territory, defaultWarehouse, salesRep,
      shippingLen: c.shippingAddresses?.length || 0
    });
    const riskLevel: CustomerDataView['riskLevel'] = (!lastOrderDate || daysSinceLastOrder > 180) ? 'high' : (daysSinceLastOrder > 90 ? 'medium' : 'low');

    return {
      ...c,
      accountNumber,
      companyName,
      primaryContactName,
      primaryContactEmail,
      primaryContactPhone,
      primaryContactMobile,
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
      daysSinceLastOrder,
      creditLimit,
      currentBalance,
      paymentTerms,
      profileCompleteness,
      missingFields,
      hasShippingAddress,
      hasAdditionalContacts,
      tags,
      isVIP: tags.includes('VIP'),
      riskLevel,
    };
  };

  const customer = useMemo(() => normalize(rawCustomer), [rawCustomer?.id]);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<any>(null);

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => customersApi.update(customerId!, payload).then(r => r.data),
    onSuccess: () => {
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['customer', customerId] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (e) => { console.error('Update customer failed', e); alert('Failed to update customer'); }
  });

  console.log('CustomerDetailPage render:', { customerId, isLoading, rawCustomer, customer });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!customer) {
    return <div className="text-center py-12">Customer not found</div>;
  }

  // Initialize draft when entering edit mode or when customer changes
  React.useEffect(() => {
    if (!customer) return;
    if (!editMode) return;
    setDraft({
      companyName: customer.companyName,
      customerType: customer.customerType,
      businessType: customer.businessType,
      primaryContactName: customer.primaryContactName,
      primaryContactEmail: customer.primaryContactEmail,
      primaryContactPhone: customer.primaryContactPhone,
      primaryContactMobile: (customer as any).primaryContactMobile || '',
      primaryContactTitle: (customer as any).primaryContactTitle || '',
      territory: customer.territory,
      defaultWarehouse: customer.defaultWarehouse,
      salesRep: customer.salesRep,
      creditLimit: customer.creditLimit,
      paymentTerms: customer.paymentTerms,
      taxExempt: (customer as any).taxExempt || false,
      tags: [...(customer.tags || [])],
      status: customer.status,
      billingAddress: customer.billingAddress ? { ...customer.billingAddress } : { street1: '', city: '', province: '', postalCode: '', country: 'CA' },
      shippingAddresses: customer.shippingAddresses ? JSON.parse(JSON.stringify(customer.shippingAddresses)) : [],
      additionalContacts: customer.additionalContacts ? JSON.parse(JSON.stringify(customer.additionalContacts)) : [],
    });
  }, [editMode, customer?.id]);

  const handleSave = () => {
    if (!draft) return;
    const payload: any = {
      companyName: draft.companyName,
      customerType: draft.customerType,
      businessType: draft.businessType,
      primaryContact: {
        name: draft.primaryContactName,
        email: draft.primaryContactEmail,
        phone: draft.primaryContactPhone,
        mobile: draft.primaryContactMobile,
        title: draft.primaryContactTitle,
        isPrimary: true,
      },
      territory: draft.territory,
      defaultWarehouse: draft.defaultWarehouse,
      salesRep: draft.salesRep,
      creditLimit: Number(draft.creditLimit) || 0,
      paymentTerms: draft.paymentTerms,
      taxExempt: !!draft.taxExempt,
      tags: draft.tags || [],
      status: draft.status,
      billingAddress: draft.billingAddress,
      shippingAddresses: draft.shippingAddresses,
      additionalContacts: draft.additionalContacts,
    };
    updateMutation.mutate(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/customers')}
                className="rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{customer.companyName}</h1>
                <p className="text-sm text-gray-500">Account #{customer.accountNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <CustomerTypeBadge type={customer.customerType} />
              <BusinessTypeBadge type={customer.businessType} />
              <StatusBadge status={customer.status} />
              {!editMode ? (
                <button onClick={()=>setEditMode(true)} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  <Edit className="h-4 w-4 mr-2 inline" />
                  Edit Customer
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button onClick={handleSave} disabled={updateMutation.isLoading} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">{updateMutation.isLoading ? 'Saving…' : 'Save'}</button>
                  <button onClick={()=>{ setEditMode(false); setDraft(null); }} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-gray-50">Cancel</button>
                </div>
              )}
              <button className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                <ShoppingCart className="h-4 w-4 mr-2 inline" />
                Create Order
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Stats */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Total Orders" value={customer.totalOrders} color="text-blue-600" Icon={Package} />
          <StatCard label="Total Revenue" value={`$${customer.totalRevenue.toLocaleString()}`} color="text-green-600" Icon={DollarSign} />
          <StatCard label="Avg Order Value" value={`$${customer.averageOrderValue.toLocaleString()}`} color="text-purple-600" Icon={TrendingUp} />
          <StatCard label="Last Order" value={customer.daysSinceLastOrder >= 0 ? `${customer.daysSinceLastOrder}d` : 'Never'} color="text-orange-600" Icon={Clock} />
          <StatCard label="Return Rate" value={`${(() => { const r=(rawCustomer as any)?.totalReturns||0; const o=customer.totalOrders||0; return o? Math.round((r/o)*100):0; })()}%`} color="text-rose-600" Icon={FileText} />
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', icon: Building },
              { id: 'contacts', name: 'Contacts', icon: Users },
              { id: 'addresses', name: 'Addresses', icon: MapPinIcon },
              { id: 'orders', name: 'Orders', icon: ShoppingCart },
              { id: 'statements', name: 'Statements', icon: FileText },
              { id: 'activity', name: 'Activity', icon: Clock },
              { id: 'notes', name: 'Notes', icon: FileText },
            ].map(tab => {
              const Icon = tab.icon as any;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center py-4 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
                >
                  <Icon className="h-4 w-4 mr-2" />{tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'overview' && <CustomerOverviewTab customer={customer} editMode={editMode} draft={draft} setDraft={setDraft} />}
        {activeTab === 'contacts' && <CustomerContactsTab customer={customer} editMode={editMode} draft={draft} setDraft={setDraft} />}
        {activeTab === 'addresses' && <CustomerAddressesTab customer={customer} editMode={editMode} draft={draft} setDraft={setDraft} />}
        {activeTab === 'orders' && <CustomerOrdersTab customer={customer} />}
        {activeTab === 'activity' && <CustomerActivityTab customer={customer} />}
        {activeTab === 'notes' && <CustomerNotesTab customer={customer} />}
        {activeTab === 'statements' && <CustomerStatementsTab customer={customer} />}
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string | number; color: string; Icon: any }> = ({ label, value, color, Icon }) => (
  <div className="rounded-lg border bg-white p-4">
    <div className="flex items-center">
      <div className="flex-1">
        <div className="text-xs text-gray-500">{label}</div>
        <div className={`text-xl font-semibold ${color}`}>{value}</div>
      </div>
      <Icon className={`h-8 w-8 ${color}`} />
    </div>
  </div>
);

// Badges / Bars
const CustomerTypeBadge: React.FC<{ type: 'B2B' | 'B2C' }> = ({ type }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${type === 'B2B' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{type}</span>
);

const BusinessTypeBadge: React.FC<{ type: CustomerDataView['businessType'] }> = ({ type }) => {
  const labels: Record<CustomerDataView['businessType'], string> = {
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
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>{labels[type]}</span>;
};

const StatusBadge: React.FC<{ status: CustomerDataView['status'] }> = ({ status }) => {
  const colors: Record<CustomerDataView['status'], string> = {
    active: 'bg-green-100 text-green-800', 
    inactive: 'bg-gray-100 text-gray-800', 
    suspended: 'bg-red-100 text-red-800', 
    prospect: 'bg-yellow-100 text-yellow-800'
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>{status.charAt(0).toUpperCase() + status.slice(1)}</span>;
};

const ProfileCompletenessBar: React.FC<{ percentage: number }> = ({ percentage }) => (
  <div className="flex items-center gap-2">
    <div className="w-24 bg-gray-200 rounded h-2">
      <div className={`h-2 rounded ${percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }} />
    </div>
    <span className="text-xs text-gray-600">{percentage}%</span>
  </div>
);

// Tabs
const CustomerOverviewTab: React.FC<any> = ({ customer, editMode, draft, setDraft }) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
    <div className="lg:col-span-2">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Company Name</dt>
            <dd className="mt-1 text-sm text-gray-900">{editMode ? (<input className="w-full border rounded px-2 py-1" value={draft?.companyName||''} onChange={e=>setDraft({ ...draft, companyName: e.target.value })} />) : customer.companyName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Business Type</dt>
            <dd className="mt-1">{editMode ? (
              <select className="border rounded px-2 py-1" value={draft?.businessType||'individual'} onChange={e=>setDraft({ ...draft, businessType: e.target.value })}>
                <option value="auto_repair">Auto Repair</option>
                <option value="body_shop">Body Shop</option>
                <option value="dealership">Dealership</option>
                <option value="fleet">Fleet</option>
                <option value="retail">Retail</option>
                <option value="wholesale">Wholesale</option>
                <option value="individual">Individual</option>
              </select>
            ) : (<BusinessTypeBadge type={customer.businessType} />)}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Primary Contact</dt>
            <dd className="mt-1 text-sm text-gray-900">{editMode ? (<input className="w-full border rounded px-2 py-1" value={draft?.primaryContactName||''} onChange={e=>setDraft({ ...draft, primaryContactName: e.target.value })} />) : customer.primaryContactName}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Territory</dt>
            <dd className="mt-1 text-sm text-gray-900">{editMode ? (<input className="w-full border rounded px-2 py-1" value={draft?.territory||''} onChange={e=>setDraft({ ...draft, territory: e.target.value })} />) : customer.territory}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sales Rep</dt>
            <dd className="mt-1 text-sm text-gray-900">{editMode ? (<input className="w-full border rounded px-2 py-1" value={draft?.salesRep||''} onChange={e=>setDraft({ ...draft, salesRep: e.target.value })} />) : customer.salesRep}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Default Warehouse</dt>
            <dd className="mt-1 text-sm text-gray-900">{editMode ? (<input className="w-full border rounded px-2 py-1" value={draft?.defaultWarehouse||''} onChange={e=>setDraft({ ...draft, defaultWarehouse: e.target.value })} />) : customer.defaultWarehouse}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center"><Mail className="h-5 w-5 text-gray-400 mr-3" />{editMode ? (<input className="border rounded px-2 py-1 text-sm flex-1" value={draft?.primaryContactEmail||''} onChange={e=>setDraft({ ...draft, primaryContactEmail: e.target.value })} />) : (<span className="text-sm text-gray-900">{customer.primaryContactEmail}</span>)}</div>
          <div className="flex items-center"><Phone className="h-5 w-5 text-gray-400 mr-3" />{editMode ? (<input className="border rounded px-2 py-1 text-sm flex-1" value={draft?.primaryContactPhone||''} onChange={e=>setDraft({ ...draft, primaryContactPhone: e.target.value })} />) : (<span className="text-sm text-gray-900">{customer.primaryContactPhone}</span>)}</div>
          <div className="flex items-center"><Phone className="h-5 w-5 text-gray-400 mr-3" />{editMode ? (<input className="border rounded px-2 py-1 text-sm flex-1" placeholder="Mobile" value={draft?.primaryContactMobile||''} onChange={e=>setDraft({ ...draft, primaryContactMobile: e.target.value })} />) : (customer.primaryContactMobile && (<span className="text-sm text-gray-900">{customer.primaryContactMobile} (Mobile)</span>))}</div>
        </div>
      </div>
    </div>

    <div>
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Completeness</h3>
        <div className="mb-4"><ProfileCompletenessBar percentage={customer.profileCompleteness} /></div>
        {customer.missingFields.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Missing Information:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {customer.missingFields.map((field, index) => (
                <li key={index} className="flex items-center"><AlertTriangle className="h-4 w-4 text-yellow-500 mr-2" />{field}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Business Details</h3>
        <dl className="space-y-3">
          <div><dt className="text-sm font-medium text-gray-500">Credit Limit</dt><dd className="mt-1 text-sm text-gray-900">{editMode ? (<input type="number" className="border rounded px-2 py-1" value={draft?.creditLimit||0} onChange={e=>setDraft({ ...draft, creditLimit: Number(e.target.value) })} />) : `$${customer.creditLimit.toLocaleString()}`}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Current Balance</dt><dd className="mt-1 text-sm text-gray-900">${customer.currentBalance.toLocaleString()}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Payment Terms</dt><dd className="mt-1 text-sm text-gray-900">{editMode ? (<input className="border rounded px-2 py-1" value={draft?.paymentTerms||''} onChange={e=>setDraft({ ...draft, paymentTerms: e.target.value })} />) : customer.paymentTerms}</dd></div>
          <div><dt className="text-sm font-medium text-gray-500">Tax Status</dt><dd className="mt-1">{editMode ? (<label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={!!draft?.taxExempt} onChange={e=>setDraft({ ...draft, taxExempt: e.target.checked })} /> Tax Exempt</label>) : ((customer as any).taxExempt ? (<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Tax Exempt</span>) : (<span className="text-sm text-gray-900">Taxable</span>))}</dd></div>
        </dl>
      </div>

      <div className="mt-6 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tags</h3>
        {editMode ? (
          <TagEditor tags={draft?.tags||[]} onChange={(tags)=>setDraft({ ...draft, tags })} />
        ) : (
          <div className="flex flex-wrap gap-2">{customer.tags.map((tag, i)=>(<span key={i} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{tag}</span>))}</div>
        )}
      </div>
    </div>
  </div>
);

const CustomerContactsTab: React.FC<any> = ({ customer, editMode, draft, setDraft }) => (
  <div className="bg-white shadow rounded-lg p-6">
    <h3 className="text-lg font-medium text-gray-900 mb-4">Contacts</h3>
    <div className="space-y-2">
      <div className="font-medium">Primary: {editMode ? (<input className="border rounded px-2 py-1 text-sm" value={draft?.primaryContactName||''} onChange={e=>setDraft({ ...draft, primaryContactName: e.target.value })} />) : customer.primaryContactName}</div>
      {(customer.additionalContacts || []).length === 0 ? (
        <div className="text-sm text-gray-500">No additional contacts.</div>
      ) : (
        <ul className="list-disc list-inside text-sm text-gray-700">
          {(customer.additionalContacts as any[]).map((c: any) => (
            <li key={c.id}>{c.name} — {c.email || '—'} {c.phone ? `(${c.phone})` : ''}</li>
          ))}
        </ul>
      )}
    </div>
  </div>
);

const CustomerAddressesTab: React.FC<any> = ({ customer, editMode, draft, setDraft }) => (
  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Address</h3>
      <AddressBlock address={customer.billingAddress as any} />
    </div>
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Addresses</h3>
      {(customer.shippingAddresses || []).length === 0 ? (
        <div className="text-sm text-gray-500">No shipping addresses.</div>
      ) : (
        <div className="space-y-3">
          {(customer.shippingAddresses as any[]).map((a: any) => (
            <div key={a.id} className="border rounded p-3">
              <div className="flex items-center justify-between"><div className="font-medium text-sm">{a.name || 'Address'}</div>{a.isDefault && <span className="text-xs bg-green-100 text-green-800 rounded px-2 py-0.5">Default</span>}</div>
              <AddressBlock address={a} />
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

function AddressBlock({ address }: any) {
  return (
    <div className="text-sm text-gray-700">
      <div>{address?.street1} {address?.street2}</div>
      <div>{address?.city}, {address?.province} {address?.postalCode}</div>
      <div>{address?.country}</div>
    </div>
  );
}

function TagEditor({ tags, onChange }: any) {
  const [val, setVal] = useState('');
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input className="border rounded px-3 py-2 text-sm flex-1" placeholder="Add tag" value={val} onChange={(e)=>setVal(e.target.value)} />
        <button className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700" onClick={()=>{ if(!val.trim()) return; onChange([...(tags||[]), val.trim()]); setVal(''); }}>Add</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {(tags||[]).map((t: string)=> (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{t}<button onClick={()=>onChange((tags||[]).filter((x: string)=>x!==t))} className="text-gray-500 hover:text-gray-700">×</button></span>
        ))}
      </div>
    </div>
  );
}

function CustomerOrdersTab() { 
  return <div className="bg-white shadow rounded-lg p-6 text-sm text-gray-600">Orders list coming soon.</div>;
}

function CustomerActivityTab({ customer }: any) { 
  return <div className="bg-white shadow rounded-lg p-6 text-sm text-gray-600">Last activity: {customer.lastActivityDate || '—'}</div>;
}

function CustomerNotesTab() { 
  return <div className="bg-white shadow rounded-lg p-6 text-sm text-gray-600">Notes interface coming soon.</div>;
}

function CustomerStatementsTab({ customer }: any) { 
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Statements</h3>
      <p className="text-sm text-gray-600 mb-4">View and download monthly statements for this account.</p>
      <div className="flex items-center gap-2 text-sm">
        <button className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Download Latest Statement</button>
        <button className="rounded-md border px-3 py-2 hover:bg-gray-50">View History</button>
      </div>
    </div>
  );
}

// Helpers
function calculateProfileCompleteness(args: { companyName: string; primaryContactName: string; primaryContactEmail: string; primaryContactPhone: string; billingAddress: any; territory: string; defaultWarehouse: string; salesRep: string; shippingLen: number; }): number {
  const checks = [
    !!args.companyName,
    !!args.primaryContactName,
    !!args.primaryContactEmail,
    !!args.primaryContactPhone,
    !!args.billingAddress?.street1,
    !!args.billingAddress?.city,
    !!args.billingAddress?.province,
    !!args.billingAddress?.postalCode,
    !!args.territory,
    !!args.defaultWarehouse,
    !!args.salesRep,
    args.shippingLen > 0,
  ];
  const total = checks.length;
  const passed = checks.filter(Boolean).length;
  return Math.round((passed / total) * 100);
}

function getMissingFields(args: { companyName: string; primaryContactName: string; primaryContactEmail: string; primaryContactPhone: string; billingAddress: any; territory: string; defaultWarehouse: string; salesRep: string; shippingLen: number; }): string[] {
  const missing: string[] = [];
  if (!args.companyName) missing.push('Company Name');
  if (!args.primaryContactName) missing.push('Primary Contact');
  if (!args.primaryContactEmail) missing.push('Email');
  if (!args.primaryContactPhone) missing.push('Phone');
  if (!args.territory) missing.push('Territory');
  if (!args.defaultWarehouse) missing.push('Default Warehouse');
  if (!args.salesRep) missing.push('Sales Rep');
  if (!args.billingAddress?.street1) missing.push('Billing Address');
  if (!(args.shippingLen > 0)) missing.push('Shipping Address');
  return missing;
}

export default CustomerDetailPage;