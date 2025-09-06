import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import ImportExportButtons from '../components/ImportExportButtons';
import JobStatusModal from '../components/JobStatusModal';

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobType, setActiveJobType] = useState<'import' | 'export'>('import');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const importExcelMutation = useMutation({
    mutationFn: productsApi.importExcel,
    onSuccess: (response) => {
      setActiveJobId(response.data.jobId);
      setActiveJobType('import');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert('Import job creation failed.');
    },
  });

  const importXMLMutation = useMutation({
    mutationFn: productsApi.importXML,
    onSuccess: (response) => {
      setActiveJobId(response.data.jobId);
      setActiveJobType('import');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert('Import job creation failed.');
    },
  });

  const handleExportExcel = async () => {
    try {
      const response = await productsApi.exportExcel();
      setActiveJobId(response.data.jobId);
      setActiveJobType('export');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export job creation failed.');
    }
  };

  const handleExportXML = async () => {
    try {
      const response = await productsApi.exportXML();
      setActiveJobId(response.data.jobId);
      setActiveJobType('export');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export job creation failed.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/export/template');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pies-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download failed:', error);
      alert('Template download failed.');
    }
  };



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
            showTemplate={true}
            onImportExcel={(file) => importExcelMutation.mutate(file)}
            onImportXML={(file) => importXMLMutation.mutate(file)}
            onExportExcel={handleExportExcel}
            onExportXML={handleExportXML}
            onDownloadTemplate={handleDownloadTemplate}
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
                        onClick={() => navigate(`/products/${product.id}`)}
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

      {/* Job Status Modal */}
      {activeJobId && (
        <JobStatusModal
          jobId={activeJobId}
          jobType={activeJobType}
          onClose={() => {
            setActiveJobId(null);
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
        />
      )}
    </div>
  );
};

export default ProductsPage;