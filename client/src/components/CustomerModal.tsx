import React, { useState } from 'react';
import { X, User, Users as UsersIcon, MapPin as MapPinIcon, Building as BuildingIcon, Settings as SettingsIcon, Plus as PlusIcon, Trash2 as TrashIcon } from 'lucide-react';

type CustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customer?: any;
  onSave: (customer: any) => void;
};

const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, customer, onSave }) => {
  const [activeTab, setActiveTab] = useState<'basic'|'contacts'|'addresses'|'business'|'settings'>('basic');
  const [formData, setFormData] = useState<any>({
    companyName: '',
    customerType: 'B2B',
    businessType: 'auto_repair',
    primaryContactName: '',
    primaryContactEmail: '',
    primaryContactPhone: '',
    billingAddress: { street1: '', street2: '', city: '', province: '', postalCode: '', country: 'CA' },
    shippingAddresses: [],
    additionalContacts: [],
    territory: '',
    defaultWarehouse: '',
    salesRep: '',
    creditLimit: 0,
    paymentTerms: 'Net 30',
    taxExempt: false,
    tags: [],
    status: 'active',
  });

  React.useEffect(() => {
    if (customer) setFormData(customer);
    else setFormData(prev => ({ ...prev, accountNumber: undefined }));
  }, [customer?.id, isOpen]);

  const generateAccountNumber = (customerType: string, territory: string): string => {
    const prefix = customerType === 'B2B' ? 'B' : 'C';
    const territoryCode = (territory || '').substring(0,2).toUpperCase();
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random()*100).toString().padStart(2,'0');
    return `${prefix}${territoryCode}${timestamp}${random}`;
  };

  const handleSave = () => {
    const payload = { ...formData } as any;
    if (!customer && !payload.accountNumber) {
      payload.accountNumber = generateAccountNumber(payload.customerType || 'B2B', payload.territory || '');
    }
    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-black/40" onClick={onClose} />
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          <div className="flex items-center justify-between border-b bg-white px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900">{customer ? 'Edit Customer' : 'Create New Customer'}</h3>
            <button onClick={onClose} className="rounded-md text-gray-400 hover:text-gray-600 focus:outline-none">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="border-b bg-gray-50">
            <nav className="flex space-x-6 px-6 overflow-x-auto">
              {[
                { id: 'basic', name: 'Basic Info', icon: User },
                { id: 'contacts', name: 'Contacts', icon: UsersIcon },
                { id: 'addresses', name: 'Addresses', icon: MapPinIcon },
                { id: 'business', name: 'Business', icon: BuildingIcon },
                { id: 'settings', name: 'Settings', icon: SettingsIcon }
              ].map(tab => {
                const Icon = tab.icon as any;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center py-3 px-1 border-b-2 text-sm font-medium ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                    <Icon className="h-4 w-4 mr-2" />{tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-white px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'basic' && <BasicInfoTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'contacts' && <ContactsTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'addresses' && <AddressesTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'business' && <BusinessTab formData={formData} setFormData={setFormData} />}
            {activeTab === 'settings' && <SettingsTab formData={formData} setFormData={setFormData} />}
          </div>

          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-2">
            <button onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">{customer ? 'Update Customer' : 'Create Customer'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BasicInfoTab: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Account Number</label>
        <input type="text" value={formData.accountNumber || 'Auto-generated'} disabled className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-sm shadow-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Customer Type *</label>
        <select value={formData.customerType} onChange={(e:any)=>setFormData({ ...formData, customerType: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value="B2B">B2B - Business</option>
          <option value="B2C">B2C - Consumer</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name *</label>
        <input type="text" value={formData.companyName || ''} onChange={(e:any)=>setFormData({ ...formData, companyName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" placeholder="Enter company name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Business Type *</label>
        <select value={formData.businessType} onChange={(e:any)=>setFormData({ ...formData, businessType: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500">
          <option value="auto_repair">Auto Repair Shop</option>
          <option value="body_shop">Body Shop</option>
          <option value="dealership">Dealership</option>
          <option value="fleet">Fleet Management</option>
          <option value="retail">Retail</option>
          <option value="wholesale">Wholesale</option>
          <option value="individual">Individual</option>
        </select>
      </div>
    </div>
    <div className="border-t pt-6">
      <h4 className="text-base font-medium text-gray-900 mb-4">Primary Contact</h4>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Name *</label>
          <input type="text" value={formData.primaryContactName || ''} onChange={(e:any)=>setFormData({ ...formData, primaryContactName: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input type="text" value={formData.primaryContactTitle || ''} onChange={(e:any)=>setFormData({ ...formData, primaryContactTitle: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email *</label>
          <input type="email" value={formData.primaryContactEmail || ''} onChange={(e:any)=>setFormData({ ...formData, primaryContactEmail: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone *</label>
          <input type="tel" value={formData.primaryContactPhone || ''} onChange={(e:any)=>setFormData({ ...formData, primaryContactPhone: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Mobile</label>
          <input type="tel" value={formData.primaryContactMobile || ''} onChange={(e:any)=>setFormData({ ...formData, primaryContactMobile: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500" />
        </div>
      </div>
    </div>
  </div>
);

const ContactsTab: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const contacts = (formData.additionalContacts || []) as any[];
  const add = () => setFormData({ ...formData, additionalContacts: [...contacts, { id: crypto.randomUUID(), name: '', email: '', phone: '', isPrimary: false }] });
  const remove = (id: string) => setFormData({ ...formData, additionalContacts: contacts.filter(c => c.id !== id) });
  const update = (id: string, patch: any) => setFormData({ ...formData, additionalContacts: contacts.map(c => c.id === id ? { ...c, ...patch } : c) });
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-base font-medium text-gray-900">Additional Contacts</h4>
        <button onClick={add} className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"><PlusIcon className="h-3 w-3"/>Add</button>
      </div>
      {contacts.length === 0 && <p className="text-sm text-gray-500">No additional contacts.</p>}
      {contacts.map(c => (
        <div key={c.id} className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
          <input className="border rounded px-2 py-1 text-sm" placeholder="Name" value={c.name || ''} onChange={(e)=>update(c.id,{name:e.target.value})} />
          <input className="border rounded px-2 py-1 text-sm" placeholder="Email" value={c.email || ''} onChange={(e)=>update(c.id,{email:e.target.value})} />
          <input className="border rounded px-2 py-1 text-sm" placeholder="Phone" value={c.phone || ''} onChange={(e)=>update(c.id,{phone:e.target.value})} />
          <input className="border rounded px-2 py-1 text-sm" placeholder="Department" value={c.department || ''} onChange={(e)=>update(c.id,{department:e.target.value})} />
          <button onClick={()=>remove(c.id)} className="justify-self-end text-red-600 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
        </div>
      ))}
    </div>
  );
};

const AddressesTab: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const shipping = (formData.shippingAddresses || []) as any[];
  const addShip = () => setFormData({ ...formData, shippingAddresses: [...shipping, { id: crypto.randomUUID(), name: '', isDefault: shipping.length===0, street1:'', city:'', province:'', postalCode:'', country:'CA' }] });
  const removeShip = (id: string) => setFormData({ ...formData, shippingAddresses: shipping.filter((s:any)=>s.id !== id) });
  const updateShip = (id: string, patch: any) => setFormData({ ...formData, shippingAddresses: shipping.map((s:any)=> s.id===id ? { ...s, ...patch } : s) });
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-base font-medium text-gray-900 mb-2">Billing Address</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {['street1','street2','city','province','postalCode','country'].map((k)=> (
            <input key={k} className="border rounded px-3 py-2 text-sm" placeholder={k} value={(formData.billingAddress?.[k] || '') as any} onChange={(e:any)=> setFormData({ ...formData, billingAddress: { ...(formData.billingAddress||{}), [k]: e.target.value }}) } />
          ))}
        </div>
      </div>
      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-medium text-gray-900">Shipping Addresses</h4>
          <button onClick={addShip} className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"><PlusIcon className="h-3 w-3"/>Add</button>
        </div>
        {shipping.length === 0 && <p className="text-sm text-gray-500 mt-2">No shipping addresses.</p>}
        <div className="space-y-3 mt-2">
          {shipping.map((s:any)=> (
            <div key={s.id} className="grid grid-cols-1 sm:grid-cols-6 gap-2 items-end">
              <input className="border rounded px-2 py-1 text-sm" placeholder="Name" value={s.name||''} onChange={(e)=>updateShip(s.id,{name:e.target.value})} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Street" value={s.street1||''} onChange={(e)=>updateShip(s.id,{street1:e.target.value})} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="City" value={s.city||''} onChange={(e)=>updateShip(s.id,{city:e.target.value})} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Province" value={s.province||''} onChange={(e)=>updateShip(s.id,{province:e.target.value})} />
              <input className="border rounded px-2 py-1 text-sm" placeholder="Postal" value={s.postalCode||''} onChange={(e)=>updateShip(s.id,{postalCode:e.target.value})} />
              <button onClick={()=>removeShip(s.id)} className="justify-self-end text-red-600 hover:text-red-700"><TrashIcon className="h-4 w-4"/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BusinessTab: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <div><label className="block text-sm font-medium text-gray-700">Territory</label><input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={formData.territory||''} onChange={(e:any)=>setFormData({...formData,territory:e.target.value})} /></div>
    <div><label className="block text-sm font-medium text-gray-700">Default Warehouse</label><input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={formData.defaultWarehouse||''} onChange={(e:any)=>setFormData({...formData,defaultWarehouse:e.target.value})} /></div>
    <div><label className="block text-sm font-medium text-gray-700">Sales Rep</label><input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={formData.salesRep||''} onChange={(e:any)=>setFormData({...formData,salesRep:e.target.value})} /></div>
    <div><label className="block text-sm font-medium text-gray-700">Credit Limit</label><input type="number" className="mt-1 w-full border rounded px-3 py-2 text-sm" value={formData.creditLimit||0} onChange={(e:any)=>setFormData({...formData,creditLimit:Number(e.target.value)})} /></div>
    <div><label className="block text-sm font-medium text-gray-700">Payment Terms</label><input className="mt-1 w-full border rounded px-3 py-2 text-sm" value={formData.paymentTerms||''} onChange={(e:any)=>setFormData({...formData,paymentTerms:e.target.value})} /></div>
    <div className="flex items-center gap-2 mt-6"><input id="taxExempt_cm" type="checkbox" checked={!!formData.taxExempt} onChange={(e:any)=>setFormData({...formData,taxExempt:e.target.checked})} /><label htmlFor="taxExempt_cm" className="text-sm text-gray-700">Tax Exempt</label></div>
  </div>
);

const SettingsTab: React.FC<{ formData: any; setFormData: any }> = ({ formData, setFormData }) => {
  const [tagInput, setTagInput] = useState('');
  const addTag = () => { if (!tagInput.trim()) return; setFormData({ ...formData, tags: [ ...(formData.tags||[]), tagInput.trim() ]}); setTagInput(''); };
  const removeTag = (t: string) => setFormData({ ...formData, tags: (formData.tags||[]).filter((x:string)=>x!==t) });
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select value={formData.status||'active'} onChange={(e:any)=>setFormData({...formData,status:e.target.value})} className="border rounded px-3 py-2 text-sm">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
          <option value="prospect">Prospect</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
        <div className="flex gap-2 mb-2">
          <input className="border rounded px-3 py-2 text-sm flex-1" placeholder="Add tag" value={tagInput} onChange={(e)=>setTagInput(e.target.value)} />
          <button onClick={addTag} className="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Add</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(formData.tags||[]).map((t:string)=> (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{t}<button onClick={()=>removeTag(t)} className="text-gray-500 hover:text-gray-700">×</button></span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomerModal;

