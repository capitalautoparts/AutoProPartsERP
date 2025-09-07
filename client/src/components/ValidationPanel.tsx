import React, { useState } from 'react';

interface ValidationPanelProps {
  applications: any[];
  allMakes: any[];
  allModels: any[];
  allBaseVehicles: any[];
  pcdbRefData: any;
  onEdit: (id: string) => void;
  onRemove: (id: string) => void;
  onExport: () => void;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  applications,
  allMakes,
  allModels,
  allBaseVehicles,
  pcdbRefData,
  onEdit,
  onRemove,
  onExport
}) => {
  const [validationFilter, setValidationFilter] = useState('All');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const validateApplications = () => {
    const errors = [];
    
    applications.forEach(app => {
      const appErrors = [];
      
      if (!app.year) appErrors.push('Year is required');
      if (!app.make) appErrors.push('Make is required');
      if (!app.model) appErrors.push('Model is required');
      if (!app.baseVehicleId) appErrors.push('BaseVehicle is required');
      if (!app.partType) appErrors.push('Part Type is required');
      
      const baseVehicle = allBaseVehicles.find(bv => bv.BaseVehicleID === app.baseVehicleId);
      if (baseVehicle) {
        if (baseVehicle.YearID !== app.year) appErrors.push('Year does not match BaseVehicle');
        if (baseVehicle.MakeID !== app.make) appErrors.push('Make does not match BaseVehicle');
        if (baseVehicle.ModelID !== app.model) appErrors.push('Model does not match BaseVehicle');
      }
      
      if (app.partType && !pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === app.partType)) {
        appErrors.push('Invalid Part Type');
      }
      
      if (app.position && !pcdbRefData.positions?.find(pos => pos.PositionID === app.position)) {
        appErrors.push('Invalid Position');
      }
      
      if (appErrors.length > 0) {
        const yearName = app.year;
        const makeName = allMakes.find(m => m.MakeID === app.make)?.MakeName || app.make;
        const modelName = allModels.find(m => m.ModelID === app.model)?.ModelName || app.model;
        errors.push(`${yearName} ${makeName} ${modelName}: ${appErrors.join(', ')}`);
      }
    });
    
    setValidationErrors(errors);
    
    if (errors.length === 0) {
      alert(`✓ Validation successful! All ${applications.length} applications are valid.`);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (validationFilter === 'All') return true;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h4 className="text-md font-medium mb-3">Mapping Validation</h4>
        
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm font-medium">Filter:</span>
          {['All', 'Valid', 'Invalid', 'Conflict'].map(filter => (
            <label key={filter} className="flex items-center">
              <input 
                type="radio"
                name="validationFilter"
                value={filter}
                checked={validationFilter === filter}
                onChange={(e) => setValidationFilter(e.target.value)}
                className="mr-1"
              />
              <span className="text-sm">{filter}</span>
            </label>
          ))}
        </div>
        
        <div className="flex space-x-2 mb-4">
          <button 
            onClick={onExport}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
          >
            Export
          </button>
          <button 
            onClick={() => selectedApplications.forEach(onRemove)}
            disabled={selectedApplications.length === 0}
            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400"
          >
            Delete
          </button>
          <button 
            onClick={validateApplications}
            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
          >
            Validate
          </button>
        </div>
        
        {validationErrors.length > 0 && (
          <div>
            <label className="block text-sm font-medium mb-1">Mapping Errors</label>
            <textarea 
              value={validationErrors.join('\n')}
              readOnly
              className="w-full p-2 border rounded text-sm bg-red-50"
              rows={4}
            />
          </div>
        )}
      </div>
      
      <div className="border rounded-lg p-4">
        <h4 className="text-md font-medium mb-3">Application Mapping ({filteredApplications.length})</h4>
        
        {filteredApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <input 
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApplications(filteredApplications.map(app => app.id));
                        } else {
                          setSelectedApplications([]);
                        }
                      }}
                    />
                  </th>
                  <th className="text-left p-2">Vehicle</th>
                  <th className="text-left p-2">Item</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app: any) => {
                  const makeName = allMakes.find(m => m.MakeID === app.make)?.MakeName || app.make;
                  const modelName = allModels.find(m => m.ModelID === app.model)?.ModelName || app.model;
                  const partTypeName = pcdbRefData.partTypes?.find(pt => pt.PartTerminologyID === app.partType)?.PartTerminologyName || app.partType || 'No Part Type';
                  const positionName = pcdbRefData.positions?.find(pos => pos.PositionID === app.position)?.Position || app.position;
                  
                  return (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="p-2">
                        <input 
                          type="checkbox"
                          checked={selectedApplications.includes(app.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedApplications([...selectedApplications, app.id]);
                            } else {
                              setSelectedApplications(selectedApplications.filter(id => id !== app.id));
                            }
                          }}
                        />
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{app.year} {makeName} {modelName}</div>
                        <div className="text-xs text-gray-500">BaseVehicle: {app.baseVehicleId}</div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium">{partTypeName}</div>
                        <div className="text-xs text-gray-500">
                          {positionName && `Position: ${positionName}`}
                          {app.quantity && ` | Qty: ${app.quantity}`}
                          {app.mfrLabel && ` | Label: ${app.mfrLabel}`}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-1">
                          <button 
                            onClick={() => onEdit(app.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs px-2 py-1 border border-blue-300 rounded hover:bg-blue-50"
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => onRemove(app.id)}
                            className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No applications match the current filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};