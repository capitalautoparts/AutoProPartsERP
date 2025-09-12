import React from 'react';
import { LayoutDashboard, TrendingUp, ShoppingCart, Users, Package, DollarSign, Truck } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; delta?: string; }> = ({ title, value, icon: Icon, delta }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-gray-900 mt-1">{value}</div>
        {delta && <div className="text-xs text-green-600 mt-1">{delta}</div>}
      </div>
      <div className="p-2 rounded bg-blue-50">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-gray-800" />
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="text-sm text-gray-500">Personal KPIs and reports</div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Open Orders" value={124} icon={ShoppingCart} delta="+8% vs last week" />
        <StatCard title="New Customers" value={32} icon={Users} delta="+3 this week" />
        <StatCard title="Items to Review" value={57} icon={Package} delta="-5 pending" />
        <StatCard title="Revenue (MTD)" value="$248,930" icon={DollarSign} delta="+12%" />
      </div>

      {/* Two panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-4 h-full">
            <div className="flex items-center justify-between">
              <div className="font-medium text-gray-900">Performance Overview</div>
              <div className="text-xs text-gray-500">Last 30 days</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              Charts and trends coming soon.
            </div>
            <div className="mt-6 flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-700">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Conversion rate up 2.1%</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-700">
                <Truck className="w-4 h-4" />
                <span className="text-sm">Avg. ship time 1.8 days</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="font-medium text-gray-900">My Actions</div>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span>Approve 3 new SKUs</span>
                <button className="px-2 py-1 text-xs border rounded">Open</button>
              </li>
              <li className="flex items-center justify-between">
                <span>Review 5 price changes</span>
                <button className="px-2 py-1 text-xs border rounded">Open</button>
              </li>
              <li className="flex items-center justify-between">
                <span>2 orders need attention</span>
                <button className="px-2 py-1 text-xs border rounded">Open</button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

