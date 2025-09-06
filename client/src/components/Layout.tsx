import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Calculator, 
  ShoppingBag, 
  Warehouse,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigation = [
    { name: 'Products (PIM)', href: '/products', icon: Package },
    { name: 'Orders', href: '/orders', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },

    { name: 'Marketing', href: '/marketing', icon: TrendingUp },
    { name: 'Accounting', href: '/accounting', icon: Calculator },
    { name: 'Purchasing', href: '/purchasing', icon: ShoppingBag },
    { name: 'Warehouse', href: '/warehouse', icon: Warehouse },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Auto Parts ERP</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.name}>
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`
                    }
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;