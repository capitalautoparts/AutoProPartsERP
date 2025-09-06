import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import ImportExportButtons from '../components/ImportExportButtons';

const ProductsPage: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
  });

  const importExcelMutation = useMutation({
    mutationFn: productsApi.importExcel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      alert('Excel import completed successfully!');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    },
  });

  const importXMLMutation = useMutation({
    mutationFn: productsApi.importXML,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      alert('XML import completed successfully!');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert('Import failed. Please check the file format.');
    },
  });

  const handleExportExcel = async () => {
    try {
      const response = await productsApi.exportExcel();
      const blob = new Blob([response.data], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed.');
    }
  };

  const handleExportXML = async () => {
    try {
      const response = await productsApi.exportXML();
      const blob = new Blob([response.data], { type: 'application/xml' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.xml';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed.');
    }
  };

  const tabs = [
    { id: 'profile', name: 'Product Profile' },
    { id: 'aces-fitment', name: 'ACES - Vehicle Fitment' },
    { id: 'aces-application', name: 'ACES - Application Mapping' },
    { id: 'aces-attributes', name: 'ACES - Attribute Filters' },
    { id: 'aces-validation', name: 'ACES - Validation' },
    { id: 'pies-item', name: 'PIES - Item' },
    { id: 'pies-description', name: 'PIES - Description' },
    { id: 'pies-price', name: 'PIES - Price' },
    { id: 'pies-expi', name: 'PIES - EXPI' },
    { id: 'pies-attributes', name: 'PIES - Attributes' },
    { id: 'pies-package', name: 'PIES - Package' },
    { id: 'pies-kit', name: 'PIES - Kit' },
    { id: 'pies-interchange', name: 'PIES - Interchange' },
    { id: 'pies-assets', name: 'PIES - Assets' },
    { id: 'pies-assortments', name: 'PIES - Assortments' },
    { id: 'pies-market-copy', name: 'PIES - Market Copy' },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products (PIM)</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product catalog with ACES and PIES compliance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <ImportExportButtons
            showXML={true}
            onImportExcel={(file) => importExcelMutation.mutate(file)}
            onImportXML={(file) => importXMLMutation.mutate(file)}
            onExportExcel={handleExportExcel}
            onExportXML={handleExportXML}
          />
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">
                    Part Number
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Product Name
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Brand
                  </th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Stock
                  </th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {product.partNumber}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.productName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.brand}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {product.qtyOnHand}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <button
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 mr-4">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">
                  {selectedProduct.productName}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto max-h-96">
                {activeTab === 'profile' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.manufacturer}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Brand</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.brand}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Part Number</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.partNumber}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">SKU</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.sku}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Product Name</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.productName}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Short Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.shortDescription}</p>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Long Description</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedProduct.longDescription}</p>
                    </div>
                  </div>
                )}
                {activeTab !== 'profile' && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {tabs.find(t => t.id === activeTab)?.name} data will be displayed here.
                      <br />
                      This tab will show form fields auto-generated from PIES/ACES specifications.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;