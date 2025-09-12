import React, { useState } from 'react';
import { Package, Users, TrendingUp, Calculator, ShoppingBag, Warehouse, Plug, Truck, Shield } from 'lucide-react';

type SettingsTab = 'PIM' | 'Customers' | 'Marketing' | 'Accounting' | 'Purchasing' | 'Warehouse' | 'Integrations' | 'Shipping' | 'UsersRoles';

const tabs: { id: SettingsTab; name: string; icon: React.ElementType; description: string }[] = [
  { id: 'PIM', name: 'PIM', icon: Package, description: 'Product Information Management defaults and behaviors' },
  { id: 'Customers', name: 'Customers', icon: Users, description: 'Customer defaults, grouping and permissions' },
  { id: 'Marketing', name: 'Marketing', icon: TrendingUp, description: 'Campaign, feeds and marketplace integrations' },
  { id: 'Accounting', name: 'Accounting', icon: Calculator, description: 'AR/AP, tax, currency and ledger settings' },
  { id: 'Purchasing', name: 'Purchasing', icon: ShoppingBag, description: 'Suppliers, POs and cost management' },
  { id: 'Warehouse', name: 'Warehouse', icon: Warehouse, description: 'Bins, stock rules and fulfillment' },
  { id: 'Integrations', name: 'Integrations', icon: Plug, description: 'APIs, credentials and sync schedules' },
  { id: 'Shipping', name: 'Shipping', icon: Truck, description: 'Carriers, service levels and packing rules' },
  { id: 'UsersRoles', name: 'Users & Roles', icon: Shield, description: 'Manage users, roles, and permissions' },
];

const SettingsPage: React.FC = () => {
  const [active, setActive] = useState<SettingsTab>('PIM');

  const ActiveIcon = tabs.find(t => t.id === active)?.icon || Package;
  const ActiveDesc = tabs.find(t => t.id === active)?.description || '';

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-sm text-gray-600 mt-1">Configure modules, defaults and integrations</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`inline-flex items-center px-3 py-2 border-b-2 text-sm font-medium whitespace-nowrap ${
                  isActive ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Active Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ActiveIcon className="w-5 h-5 text-gray-700 mr-2" />
          <h2 className="text-lg font-medium text-gray-900">{active} Settings</h2>
        </div>
        <p className="text-sm text-gray-600 mb-4">{ActiveDesc}</p>

        {/* Placeholder form content; easy to expand per module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Enable {active}</label>
            <select className="w-full border rounded px-2 py-2 text-sm">
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700 mb-1">Default View</label>
            <select className="w-full border rounded px-2 py-2 text-sm">
              <option>Summary</option>
              <option>Details</option>
              <option>Advanced</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Notes</label>
            <textarea rows={3} className="w-full border rounded px-2 py-2 text-sm" placeholder={`Notes for ${active} configuration`} />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
