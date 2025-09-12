import React, { useState } from 'react';
import { X, Package, Users, TrendingUp, Calculator, ShoppingBag, Warehouse, Plug, Truck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'PIM' | 'Customers' | 'Marketing' | 'Accounting' | 'Purchasing' | 'Warehouse' | 'Integrations' | 'Shipping';

const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'PIM', label: 'PIM', icon: Package },
  { id: 'Customers', label: 'Customers', icon: Users },
  { id: 'Marketing', label: 'Marketing', icon: TrendingUp },
  { id: 'Accounting', label: 'Accounting', icon: Calculator },
  { id: 'Purchasing', label: 'Purchasing', icon: ShoppingBag },
  { id: 'Warehouse', label: 'Warehouse', icon: Warehouse },
  { id: 'Integrations', label: 'Integrations', icon: Plug },
  { id: 'Shipping', label: 'Shipping', icon: Truck },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [active, setActive] = useState<SettingsTab>('PIM');

  if (!isOpen) return null;

  const ActiveIcon = tabs.find(t => t.id === active)?.icon || Package;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center">
        <div className="bg-white w-full md:max-w-4xl md:rounded-lg md:shadow-xl md:mx-4">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <div className="flex items-center space-x-2">
              <ActiveIcon className="w-5 h-5 text-gray-700" />
              <h3 className="text-base font-medium text-gray-900">Settings</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="px-4 pt-3">
            <div className="flex flex-wrap gap-2">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActive(id)}
                  className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm border ${
                    active === id ? 'bg-blue-50 text-blue-700 border-blue-200' : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-4">
            <div className="bg-gray-50 border border-gray-200 rounded p-4">
              <h4 className="font-medium text-gray-900 mb-1">{active} Settings</h4>
              <p className="text-sm text-gray-600 mb-4">Module preferences and defaults. Coming soon.</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Enable {active}</label>
                  <select className="w-full border rounded px-2 py-1.5 text-sm">
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-1">Default View</label>
                  <select className="w-full border rounded px-2 py-1.5 text-sm">
                    <option>Summary</option>
                    <option>Details</option>
                    <option>Advanced</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">Save</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

