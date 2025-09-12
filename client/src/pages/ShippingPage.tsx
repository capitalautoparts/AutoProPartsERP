import React, { useState } from 'react';
import { Truck, Package, Settings as SettingsIcon } from 'lucide-react';
import RateShoppingTab from '../components/shipping/RateShoppingTab';
import OrdersToShipTab from '../components/shipping/OrdersToShipTab';
import { Link } from 'react-router-dom';

type TabId = 'rate-shopping' | 'orders';

const tabs: { id: TabId; name: string; icon: React.ElementType }[] = [
  { id: 'rate-shopping', name: 'Rate Shopping', icon: Truck },
  { id: 'orders', name: 'Orders To Ship', icon: Package },
];

const ShippingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('rate-shopping');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipping</h1>
          <p className="text-sm text-gray-600">Rate shopping and order fulfillment</p>
        </div>
        <Link
          to="/settings?tab=Shipping"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <SettingsIcon className="h-4 w-4 mr-2" />
          Settings
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 text-sm font-medium ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'rate-shopping' && <RateShoppingTab />}
        {activeTab === 'orders' && <OrdersToShipTab />}
      </div>
    </div>
  );
};

export default ShippingPage;
