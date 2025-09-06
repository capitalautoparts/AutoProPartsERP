import React, { useState } from 'react';
import { Upload, Download, FileCheck, AlertCircle, CheckCircle, Truck, Wrench, Calendar } from 'lucide-react';
import { Product, ACES42ApplicationInternal, ACES42ImportResult } from '../types';

interface ACES42TabProps {
  product: Product;
  onUpdate: (product: Product) => void;
}

export const ACES42Tab: React.FC<ACES42TabProps> = ({ product, onUpdate }) => {
  const [importResult, setImportResult] = useState<ACES42ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/aces42/import/xml', {
        method: 'POST',
        body: formData,
      });

      const result: ACES42ImportResult = await response.json();
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: false,
        applicationsProcessed: 0,
        assetsProcessed: 0,
        digitalAssetsProcessed: 0,
        errors: ['Import failed: ' + (error as Error).message],
        warnings: []
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/aces42/export/xml?brandAAIAID=ZZZZ&submissionType=FULL');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aces_4_2_export.xml';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleValidate = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/aces42/validate', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setImportResult({
        success: result.valid,
        applicationsProcessed: result.applicationsFound,
        assetsProcessed: result.assetsFound,
        digitalAssetsProcessed: result.digitalAssetsFound,
        errors: result.errors,
        warnings: result.warnings
      });
    } catch (error) {
      console.error('Validation failed:', error);
    }
  };

  const applications = product.aces42Applications || [];

  const getApplicationTypeIcon = (app: ACES42ApplicationInternal) => {
    if (app.equipmentModel || app.equipmentBase) return <Wrench className="w-4 h-4" />;
    if (app.baseVehicle) return <Truck className="w-4 h-4" />;
    return <Calendar className="w-4 h-4" />;
  };

  const getApplicationDescription = (app: ACES42ApplicationInternal) => {
    if (app.equipmentModel && app.manufacturerName) {
      return `${app.manufacturerName} ${app.equipmentModelName} (Equipment)`;
    }
    if (app.baseVehicle && app.year && app.make && app.model) {
      return `${app.year} ${app.make} ${app.model}${app.subModelName ? ` ${app.subModelName}` : ''}`;
    }
    if (app.years && app.make && app.model) {
      return `${app.years.from}-${app.years.to} ${app.make} ${app.model}`;
    }
    return 'Application';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">ACES 4.2 Applications</h3>
          <p className="text-sm text-gray-600">
            Vehicle fitment data with equipment support and enhanced asset management
          </p>
        </div>
        <div className="flex space-x-2">
          <label className="btn btn-outline btn-sm">
            <Upload className="w-4 h-4 mr-2" />
            Import XML
            <input
              type="file"
              accept=".xml"
              onChange={handleImport}
              className="hidden"
              disabled={isImporting}
            />
          </label>
          <label className="btn btn-outline btn-sm">
            <FileCheck className="w-4 h-4 mr-2" />
            Validate
            <input
              type="file"
              accept=".xml"
              onChange={handleValidate}
              className="hidden"
            />
          </label>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn btn-outline btn-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export XML
          </button>
        </div>
      </div>

      {/* Import Results */}
      {importResult && (
        <div className={`alert ${importResult.success ? 'alert-success' : 'alert-error'}`}>
          <div className="flex items-start">
            {importResult.success ? (
              <CheckCircle className="w-5 h-5 mr-2 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">
                {importResult.success ? 'Import Successful' : 'Import Failed'}
              </div>
              <div className="text-sm mt-1">
                Applications: {importResult.applicationsProcessed} | 
                Assets: {importResult.assetsProcessed} | 
                Digital Assets: {importResult.digitalAssetsProcessed}
              </div>
              {importResult.errors.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-sm">Errors:</div>
                  <ul className="list-disc list-inside text-sm">
                    {importResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {importResult.warnings.length > 0 && (
                <div className="mt-2">
                  <div className="font-medium text-sm">Warnings:</div>
                  <ul className="list-disc list-inside text-sm">
                    {importResult.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white rounded-lg border">
        <div className="px-4 py-3 border-b">
          <h4 className="font-medium text-gray-900">
            Applications ({applications.length})
          </h4>
        </div>
        
        {applications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No ACES 4.2 applications found</p>
            <p className="text-sm">Import an ACES 4.2 XML file to see vehicle fitment data</p>
          </div>
        ) : (
          <div className="divide-y">
            {applications.map((app, index) => (
              <div key={app.id || index} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getApplicationTypeIcon(app)}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {getApplicationDescription(app)}
                      </div>
                      
                      {/* Application Details */}
                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Part Type:</span> {app.partTypeName || app.partType.id}
                        </div>
                        <div>
                          <span className="font-medium">Quantity:</span> {app.quantity}
                        </div>
                        {app.positionName && (
                          <div>
                            <span className="font-medium">Position:</span> {app.positionName}
                          </div>
                        )}
                        {app.engine && (
                          <div>
                            <span className="font-medium">Engine:</span> {app.engine}
                          </div>
                        )}
                        {app.vehicleTypeName && (
                          <div>
                            <span className="font-medium">Vehicle Type:</span> {app.vehicleTypeName}
                          </div>
                        )}
                        {app.productionYears && (
                          <div>
                            <span className="font-medium">Production:</span> {app.productionYears.productionStart}-{app.productionYears.productionEnd}
                          </div>
                        )}
                      </div>

                      {/* Qualifiers */}
                      {app.qualifiers && app.qualifiers.length > 0 && (
                        <div className="mt-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Qualifiers:</div>
                          <div className="space-y-1">
                            {app.qualifiers.map((qual, qIndex) => (
                              <div key={qIndex} className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded">
                                {qual.text}
                                {qual.parameters && qual.parameters.length > 0 && (
                                  <span className="ml-2 text-gray-500">
                                    ({qual.parameters.map(p => p.value).join(', ')})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {app.notes && app.notes.length > 0 && (
                        <div className="mt-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Notes:</div>
                          <div className="space-y-1">
                            {app.notes.map((note, nIndex) => (
                              <div key={nIndex} className="text-sm text-gray-600 bg-yellow-50 px-2 py-1 rounded">
                                {note}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Asset References */}
                      {app.assetName && (
                        <div className="mt-3">
                          <div className="font-medium text-sm text-gray-700 mb-1">Asset Reference:</div>
                          <div className="text-sm text-gray-600 bg-blue-50 px-2 py-1 rounded">
                            Asset: {app.assetName}
                            {app.assetItemOrder && ` (Order: ${app.assetItemOrder})`}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.action === 'A' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {app.action === 'A' ? 'Add' : 'Delete'}
                    </span>
                    {app.validate === 'no' && (
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        No Validation
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ACES 4.2 Features */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">ACES 4.2 New Features</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <div className="font-medium">Equipment Applications</div>
            <div>Support for non-vehicle equipment like generators, pumps, etc.</div>
          </div>
          <div>
            <div className="font-medium">Enhanced Asset Management</div>
            <div>Separate Asset entities with improved digital asset linking</div>
          </div>
          <div>
            <div className="font-medium">Production Year Ranges</div>
            <div>More precise production date specifications for equipment</div>
          </div>
          <div>
            <div className="font-medium">Improved Validation</div>
            <div>Optional validation flags for intentionally invalid configurations</div>
          </div>
        </div>
      </div>
    </div>
  );
};