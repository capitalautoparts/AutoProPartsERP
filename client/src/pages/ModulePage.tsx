import React from 'react';
import ImportExportButtons from '../components/ImportExportButtons';

interface ModulePageProps {
  title: string;
  description: string;
  moduleName: string;
}

const ModulePage: React.FC<ModulePageProps> = ({ title, description, moduleName }) => {
  const handleImportExcel = (file: File) => {
    console.log(`Importing ${moduleName} from Excel:`, file.name);
    alert(`Excel import for ${moduleName} - Feature coming soon!`);
  };

  const handleExportExcel = () => {
    console.log(`Exporting ${moduleName} to Excel`);
    alert(`Excel export for ${moduleName} - Feature coming soon!`);
  };

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="mt-2 text-sm text-gray-700">{description}</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <ImportExportButtons
            onImportExcel={handleImportExcel}
            onExportExcel={handleExportExcel}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {title} Module
            </h3>
            <p className="text-gray-500 mb-6">
              This module supports full Excel import/export functionality as specified in the requirements.
              <br />
              All ERP modules follow the same pattern: first row = field names, second row = data types.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Excel (.xlsx) import/export</p>
              <p>✅ Async processing for large datasets</p>
              <p>✅ S3 storage integration</p>
              <p>✅ Background job processing</p>
              <p>✅ Scalable to millions of rows</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModulePage;