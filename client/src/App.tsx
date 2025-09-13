import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import ModulePage from './pages/ModulePage';
import SettingsPage from './pages/SettingsPage';
import DashboardPage from './pages/DashboardPage';
import ShippingPage from './pages/ShippingPage';
import ShippingSettingsPage from './pages/ShippingSettingsPage';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout><Outlet /></Layout>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/:customerId" element={<CustomerDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="shipping" element={<ShippingPage />} />
        <Route path="shipping/settings" element={<ShippingSettingsPage />} />

        <Route 
          path="marketing" 
          element={
            <ModulePage 
              title="Marketing" 
              description="Manage campaign lists, feeds, and advertisements"
              moduleName="marketing"
            />
          } 
        />
        <Route 
          path="accounting" 
          element={
            <ModulePage 
              title="Accounting" 
              description="Handle AR/AP, ledgers, and journal entries"
              moduleName="accounting"
            />
          } 
        />
        <Route 
          path="purchasing" 
          element={
            <ModulePage 
              title="Purchasing" 
              description="Manage suppliers and purchase orders"
              moduleName="purchasing"
            />
          } 
        />
        <Route 
          path="warehouse" 
          element={
            <ModulePage 
              title="Warehouse Management" 
              description="Track bins, stock levels, and transfers"
              moduleName="warehouse"
            />
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;
