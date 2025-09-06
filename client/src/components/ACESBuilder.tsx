import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2, Save, Car, Settings, Wrench, Truck, Zap, Gauge } from 'lucide-react';
import { ACESApplication } from '../types';
import { vcdbApi } from '../services/vcdbApi';

interface ACESBuilderProps {
  applications: ACESApplication[];
  onUpdate: (applications: ACESApplication[]) => void;
}

export const ACESBuilder: React.FC<ACESBuilderProps> = ({ applications, onUpdate }) => {
  const [selectedApp, setSelectedApp] = useState<ACESApplication | null>(null);
  const [activeTab, setActiveTab] = useState('vehicle');
  const [formData, setFormData] = useState<Partial<ACESApplication>>({});

  const tabs = [
    { id: 'vehicle', name: 'Vehicle', icon: Car },
    { id: 'engine', name: 'Engine', icon: Settings },
    { id: 'transmission', name: 'Transmission', icon: Wrench },
    { id: 'body', name: 'Body', icon: Truck },
    { id: 'fuel', name: 'Fuel', icon: Zap },
    { id: 'brakes', name: 'Brakes', icon: Gauge },
    { id: 'application', name: 'Application', icon: Settings }
  ];

  const addApplication = () => {
    try {
      const newApp: ACESApplication = {
        id: Date.now().toString(),
        productId: '',
        quantity: 1,
        partTypeId: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const updated = [...applications, newApp];
      onUpdate(updated);
      setSelectedApp(newApp);
      setFormData({});
    } catch (error) {
      console.error('Error adding application:', error);
    }
  };

  const deleteApplication = () => {
    if (!selectedApp) return;
    const updated = applications.filter(app => app.id !== selectedApp.id);
    onUpdate(updated);
    setSelectedApp(updated[0] || null);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (selectedApp) {
      const updatedApp = { ...selectedApp, [field]: value };
      const updatedApps = applications.map(app => app.id === selectedApp.id ? updatedApp : app);
      onUpdate(updatedApps);
      setSelectedApp(updatedApp);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Panel - Application Form */}
      <div className="border rounded-lg bg-white">
        {selectedApp ? (
          <>
            {/* Tabs */}
            <div className="border-b bg-white">
              <nav className="flex">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === 'vehicle' && (
                <div>
                  <VehicleTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
              {activeTab === 'engine' && (
                <div>
                  <EngineTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
              {activeTab === 'transmission' && (
                <div>
                  <TransmissionTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
              {activeTab === 'body' && (
                <div>
                  <BodyTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
              {activeTab === 'fuel' && (
                <div>
                  <FuelTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
              {activeTab === 'brakes' && (
                <div>
                  <BrakesTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
              {activeTab === 'application' && (
                <div>
                  <ApplicationTab application={selectedApp} formData={formData} updateFormData={updateFormData} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            Select an application to edit
          </div>
        )}
      </div>

      {/* Bottom Panel - Applications List */}
      <div className="border rounded-lg bg-gray-50">
        <div className="p-3 border-b bg-white">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Applications ({applications.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={addApplication}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </button>
              <button
                onClick={deleteApplication}
                disabled={!selectedApp}
                className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </button>
              <button className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                <Save className="w-4 h-4 mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 max-h-48 overflow-y-auto">
          {applications.map((app, index) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className={`p-3 border rounded cursor-pointer hover:bg-gray-100 ${
                selectedApp?.id === app.id ? 'bg-blue-50 border-blue-200' : 'bg-white'
              }`}
            >
              <div className="font-medium text-sm">
                App {index + 1}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {app.year && app.make && app.model 
                  ? `${app.year} ${app.make} ${app.model}`
                  : app.baseVehicleId 
                    ? `BaseVehicle: ${app.baseVehicleId}`
                    : 'New Application'
                }
              </div>
            </div>
          ))}
          {applications.length === 0 && (
            <div className="col-span-full p-4 text-center text-gray-500 text-sm">
              No applications. Click Add to create one.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface TabProps {
  application: ACESApplication;
  formData: Partial<ACESApplication>;
  updateFormData: (field: string, value: any) => void;
}

const VehicleTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const selectedYear = formData.year || application.year;
  const selectedMakeId = formData.makeId || application.makeId;
  const selectedModelId = formData.modelId || application.modelId;
  
  const { data: years = [] } = useQuery({ 
    queryKey: ['vcdb-years', selectedMakeId, selectedModelId], 
    queryFn: () => vcdbApi.getYears(selectedMakeId, selectedModelId)
  });
  
  const { data: makes = [] } = useQuery({ 
    queryKey: ['vcdb-makes', selectedYear, selectedModelId], 
    queryFn: () => vcdbApi.getMakes(selectedYear, selectedModelId),
    onError: (error) => console.error('Makes query error:', error)
  });
  
  const { data: models = [] } = useQuery({ 
    queryKey: ['vcdb-models', selectedYear, selectedMakeId], 
    queryFn: () => vcdbApi.getModels(selectedYear, selectedMakeId)
  });
  
  const { data: baseVehicles = [] } = useQuery({ 
    queryKey: ['vcdb-basevehicles', selectedYear, selectedMakeId, selectedModelId], 
    queryFn: () => vcdbApi.getBaseVehicles(selectedYear, selectedMakeId, selectedModelId),
    enabled: !!selectedYear && !!selectedMakeId && !!selectedModelId
  });
  
  const baseVehicleId = baseVehicles.length > 0 ? baseVehicles[0].id : null;
  
  // Auto-update BaseVehicle ID when Year/Make/Model combination resolves
  React.useEffect(() => {
    if (baseVehicleId && baseVehicleId !== (formData.baseVehicleId || application.baseVehicleId)) {
      updateFormData('baseVehicleId', baseVehicleId);
    }
  }, [baseVehicleId]);
  const { data: subModels = [] } = useQuery({ 
    queryKey: ['vcdb-submodels', baseVehicleId], 
    queryFn: () => vcdbApi.getSubModels(baseVehicleId),
    enabled: !!baseVehicleId
  });
  const { data: vehicleTypes = [] } = useQuery({ queryKey: ['vcdb-vehicletypes'], queryFn: vcdbApi.getVehicleTypes });
  const { data: manufacturers = [] } = useQuery({ queryKey: ['vcdb-manufacturers'], queryFn: vcdbApi.getManufacturers });
  const { data: equipmentModels = [] } = useQuery({ queryKey: ['vcdb-equipmentmodels'], queryFn: vcdbApi.getEquipmentModels });

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h4 className="font-medium mb-2">Vehicle Identification Pattern</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">BaseVehicle ID</label>
            <input 
              type="text" 
              className="w-full border rounded px-3 py-2 bg-gray-100" 
              value={baseVehicles.length > 0 ? baseVehicles[0].id : 'Select Year/Make/Model'}
              readOnly
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <select 
              className="w-full border rounded px-3 py-2" 
              value={selectedYear || ''}
              onChange={(e) => {
                const newYear = parseInt(e.target.value) || null;
                updateFormData('year', newYear);
                // Only clear BaseVehicle, let other fields stay if they're still valid
                updateFormData('baseVehicleId', null);
              }}
            >
              <option value="">Select Year...</option>
              {years.map(year => (
                <option key={year.id} value={year.id}>{year.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Make</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={selectedMakeId || ''}
            onChange={(e) => {
              updateFormData('makeId', parseInt(e.target.value) || null);
              updateFormData('baseVehicleId', null);
            }}

          >
            <option value="">Select Make...</option>
            {makes.map(make => (
              <option key={make.id} value={make.id}>{make.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Model</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.modelId || application.modelId || ''}
            onChange={(e) => {
              updateFormData('modelId', parseInt(e.target.value) || null);
              updateFormData('baseVehicleId', null);
            }}
          >
            <option value="">Select Model...</option>
            {models.map(model => (
              <option key={model.id} value={model.id}>{model.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Sub Model</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            disabled={!baseVehicleId}
            value={formData.subModelId || application.subModelId || ''}
            onChange={(e) => updateFormData('subModelId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Sub Model...</option>
            {subModels.map(subModel => (
              <option key={subModel.id} value={subModel.id}>{subModel.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Equipment Applications (ACES 4.2)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Manufacturer</label>
            <select 
              className="w-full border rounded px-3 py-2" 
              value={formData.manufacturerId || application.manufacturerId || ''}
              onChange={(e) => updateFormData('manufacturerId', parseInt(e.target.value) || null)}
            >
              <option value="">Select Manufacturer...</option>
              {manufacturers.slice(0, 50).map(mfr => (
                <option key={mfr.id} value={mfr.id}>{mfr.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Equipment Model</label>
            <select 
              className="w-full border rounded px-3 py-2" 
              value={formData.equipmentModelId || application.equipmentModelId || ''}
              onChange={(e) => updateFormData('equipmentModelId', parseInt(e.target.value) || null)}
            >
              <option value="">Select Equipment...</option>
              {equipmentModels.slice(0, 50).map(eq => (
                <option key={eq.id} value={eq.id}>{eq.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Type</label>
            <select 
              className="w-full border rounded px-3 py-2" 
              value={formData.vehicleTypeId || application.vehicleTypeId || ''}
              onChange={(e) => updateFormData('vehicleTypeId', parseInt(e.target.value) || null)}
            >
              <option value="">Select Type...</option>
              {vehicleTypes.slice(0, 50).map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Production Years</label>
            <div className="flex gap-2">
              <input 
                type="number" 
                placeholder="Start" 
                className="w-1/2 border rounded px-3 py-2" 
                value={formData.productionStart || application.productionStart || ''}
                onChange={(e) => updateFormData('productionStart', parseInt(e.target.value) || null)}
              />
              <input 
                type="number" 
                placeholder="End" 
                className="w-1/2 border rounded px-3 py-2" 
                value={formData.productionEnd || application.productionEnd || ''}
                onChange={(e) => updateFormData('productionEnd', parseInt(e.target.value) || null)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const EngineTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const baseVehicleId = formData.baseVehicleId || application.baseVehicleId;
  const { data: engineBases = [] } = useQuery({ 
    queryKey: ['vcdb-enginebases', baseVehicleId], 
    queryFn: () => vcdbApi.getEngineBases(baseVehicleId),
    enabled: !!baseVehicleId
  });
  const { data: engineBlocks = [] } = useQuery({ queryKey: ['vcdb-engineblocks'], queryFn: vcdbApi.getEngineBlocks });
  const { data: engineVINs = [] } = useQuery({ queryKey: ['vcdb-enginevins'], queryFn: vcdbApi.getEngineVINs });
  const { data: aspirations = [] } = useQuery({ queryKey: ['vcdb-aspirations'], queryFn: vcdbApi.getAspirations });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Engine Base</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.engineBaseId || application.engineBaseId || ''}
            onChange={(e) => updateFormData('engineBaseId', parseInt(e.target.value) || null)}
            disabled={!baseVehicleId}
          >
            <option value="">{baseVehicleId ? 'Select Engine Base...' : 'Select BaseVehicle first'}</option>
            {engineBases.map(engine => (
              <option key={engine.id} value={engine.id}>{engine.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engine Block</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.engineBlockId || application.engineBlockId || ''}
            onChange={(e) => updateFormData('engineBlockId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Engine Block...</option>
            {engineBlocks.map(block => (
              <option key={block.id} value={block.id}>{block.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Engine VIN</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.engineVINId || application.engineVINId || ''}
            onChange={(e) => updateFormData('engineVINId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Engine VIN...</option>
            {engineVINs.map(vin => (
              <option key={vin.id} value={vin.id}>{vin.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Aspiration</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.aspirationId || application.aspirationId || ''}
            onChange={(e) => updateFormData('aspirationId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Aspiration...</option>
            {aspirations.map(asp => (
              <option key={asp.id} value={asp.id}>{asp.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const TransmissionTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const baseVehicleId = formData.baseVehicleId || application.baseVehicleId;
  const { data: transmissionTypes = [] } = useQuery({ 
    queryKey: ['vcdb-transmissiontypes', baseVehicleId], 
    queryFn: () => vcdbApi.getTransmissionTypes(baseVehicleId),
    enabled: !!baseVehicleId
  });
  const { data: driveTypes = [] } = useQuery({ queryKey: ['vcdb-drivetypes'], queryFn: vcdbApi.getDriveTypes });

  const numSpeedsOptions = [
    { id: 1, name: '1-Speed' }, { id: 2, name: '2-Speed' }, { id: 3, name: '3-Speed' },
    { id: 4, name: '4-Speed' }, { id: 5, name: '5-Speed' }, { id: 6, name: '6-Speed' },
    { id: 7, name: '7-Speed' }, { id: 8, name: '8-Speed' }, { id: 9, name: '9-Speed' },
    { id: 10, name: '10-Speed' }, { id: 11, name: '11-Speed' }, { id: 12, name: '12-Speed' },
    { id: 13, name: 'CVT' }
  ];

  const controlTypeOptions = [
    { id: 'Electronic', name: 'Electronic' },
    { id: 'Hydraulic', name: 'Hydraulic' },
    { id: 'Manual', name: 'Manual' },
    { id: 'Mechanical', name: 'Mechanical' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Transmission Type</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.transmissionTypeId || application.transmissionTypeId || ''}
            onChange={(e) => updateFormData('transmissionTypeId', parseInt(e.target.value) || null)}
            disabled={!baseVehicleId}
          >
            <option value="">{baseVehicleId ? 'Select Transmission...' : 'Select BaseVehicle first'}</option>
            {transmissionTypes.map(trans => (
              <option key={trans.id} value={trans.id}>{trans.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Drive Type</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.driveTypeId || application.driveTypeId || ''}
            onChange={(e) => updateFormData('driveTypeId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Drive Type...</option>
            {driveTypes.map(drive => (
              <option key={drive.id} value={drive.id}>{drive.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Speeds</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.numSpeeds || application.numSpeeds || ''}
            onChange={(e) => updateFormData('numSpeeds', parseInt(e.target.value) || null)}
          >
            <option value="">Select Speeds...</option>
            {numSpeedsOptions.map(speed => (
              <option key={speed.id} value={speed.id}>{speed.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Control Type</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.controlType || application.controlType || ''}
            onChange={(e) => updateFormData('controlType', e.target.value)}
          >
            <option value="">Select Control Type...</option>
            {controlTypeOptions.map(control => (
              <option key={control.id} value={control.id}>{control.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const BodyTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const baseVehicleId = formData.baseVehicleId || application.baseVehicleId;
  const { data: bodyTypes = [] } = useQuery({ 
    queryKey: ['vcdb-bodytypes', baseVehicleId], 
    queryFn: () => vcdbApi.getBodyTypes(baseVehicleId),
    enabled: !!baseVehicleId
  });

  const doorOptions = [
    { id: 2, name: '2 Door' }, { id: 3, name: '3 Door' }, 
    { id: 4, name: '4 Door' }, { id: 5, name: '5 Door' }
  ];

  const bedLengthOptions = [
    { id: 'Short', name: 'Short Bed' },
    { id: 'Standard', name: 'Standard Bed' },
    { id: 'Long', name: 'Long Bed' },
    { id: 'Extra Long', name: 'Extra Long Bed' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Body Type</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.bodyTypeId || application.bodyTypeId || ''}
            onChange={(e) => updateFormData('bodyTypeId', parseInt(e.target.value) || null)}
            disabled={!baseVehicleId}
          >
            <option value="">{baseVehicleId ? 'Select Body Type...' : 'Select BaseVehicle first'}</option>
            {bodyTypes.map(body => (
              <option key={body.id} value={body.id}>{body.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Doors</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.numDoors || application.numDoors || ''}
            onChange={(e) => updateFormData('numDoors', parseInt(e.target.value) || null)}
          >
            <option value="">Select Doors...</option>
            {doorOptions.map(door => (
              <option key={door.id} value={door.id}>{door.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bed Length</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.bedLength || application.bedLength || ''}
            onChange={(e) => updateFormData('bedLength', e.target.value)}
          >
            <option value="">Select Bed Length...</option>
            {bedLengthOptions.map(bed => (
              <option key={bed.id} value={bed.id}>{bed.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Wheelbase (inches)</label>
          <input 
            type="number" 
            className="w-full border rounded px-3 py-2" 
            placeholder="e.g., 119.0"
            step="0.1"
            value={formData.wheelbase || application.wheelbase || ''}
            onChange={(e) => updateFormData('wheelbase', parseFloat(e.target.value) || null)}
          />
        </div>
      </div>
    </div>
  );
};

const BrakesTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const brakeSystemOptions = [
    { id: 'Hydraulic', name: 'Hydraulic' },
    { id: 'Air', name: 'Air' },
    { id: 'Electric', name: 'Electric' },
    { id: 'Mechanical', name: 'Mechanical' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Brake System</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.brakeSystem || application.brakeSystem || ''}
            onChange={(e) => updateFormData('brakeSystem', e.target.value)}
          >
            <option value="">Select Brake System...</option>
            {brakeSystemOptions.map(system => (
              <option key={system.id} value={system.id}>{system.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ABS</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.abs || application.abs || ''}
            onChange={(e) => updateFormData('abs', e.target.value)}
          >
            <option value="">Select ABS...</option>
            <option value="Yes">Yes</option>
            <option value="No">No</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Front Brake Type</label>
          <input 
            type="text" 
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Disc, Drum"
            value={formData.frontBrakeType || application.frontBrakeType || ''}
            onChange={(e) => updateFormData('frontBrakeType', e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Rear Brake Type</label>
          <input 
            type="text" 
            className="w-full border rounded px-3 py-2"
            placeholder="e.g., Disc, Drum"
            value={formData.rearBrakeType || application.rearBrakeType || ''}
            onChange={(e) => updateFormData('rearBrakeType', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

const FuelTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const baseVehicleId = formData.baseVehicleId || application.baseVehicleId;
  const { data: fuelTypes = [] } = useQuery({ 
    queryKey: ['vcdb-fueltypes', baseVehicleId], 
    queryFn: () => vcdbApi.getFuelTypes(baseVehicleId),
    enabled: !!baseVehicleId
  });

  const fuelDeliveryOptions = [
    { id: 'Fuel Injection', name: 'Fuel Injection' },
    { id: 'Carburetor', name: 'Carburetor' },
    { id: 'Direct Injection', name: 'Direct Injection' },
    { id: 'Port Injection', name: 'Port Injection' }
  ];

  const fuelSystemOptions = [
    { id: 'Single Point', name: 'Single Point' },
    { id: 'Multi Point', name: 'Multi Point' },
    { id: 'Sequential', name: 'Sequential' },
    { id: 'Batch Fire', name: 'Batch Fire' }
  ];

  const ignitionOptions = [
    { id: 'Electronic', name: 'Electronic' },
    { id: 'Distributorless', name: 'Distributorless' },
    { id: 'Coil on Plug', name: 'Coil on Plug' },
    { id: 'Distributor', name: 'Distributor' }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Fuel Type</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.fuelTypeId || application.fuelTypeId || ''}
            onChange={(e) => updateFormData('fuelTypeId', parseInt(e.target.value) || null)}
            disabled={!baseVehicleId}
          >
            <option value="">{baseVehicleId ? 'Select Fuel Type...' : 'Select BaseVehicle first'}</option>
            {fuelTypes.map(fuel => (
              <option key={fuel.id} value={fuel.id}>{fuel.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fuel Delivery Type</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.fuelDeliveryType || application.fuelDeliveryType || ''}
            onChange={(e) => updateFormData('fuelDeliveryType', e.target.value)}
          >
            <option value="">Select Delivery Type...</option>
            {fuelDeliveryOptions.map(delivery => (
              <option key={delivery.id} value={delivery.id}>{delivery.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Fuel System Design</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.fuelSystemDesign || application.fuelSystemDesign || ''}
            onChange={(e) => updateFormData('fuelSystemDesign', e.target.value)}
          >
            <option value="">Select System Design...</option>
            {fuelSystemOptions.map(system => (
              <option key={system.id} value={system.id}>{system.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ignition System</label>
          <select 
            className="w-full border rounded px-3 py-2"
            value={formData.ignitionSystem || application.ignitionSystem || ''}
            onChange={(e) => updateFormData('ignitionSystem', e.target.value)}
          >
            <option value="">Select Ignition System...</option>
            {ignitionOptions.map(ignition => (
              <option key={ignition.id} value={ignition.id}>{ignition.name}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

const ApplicationTab: React.FC<TabProps> = ({ application, formData, updateFormData }) => {
  const { data: partTypes = [] } = useQuery({ queryKey: ['vcdb-parttypes'], queryFn: vcdbApi.getPartTypes });
  const { data: positions = [] } = useQuery({ queryKey: ['vcdb-positions'], queryFn: vcdbApi.getPositions });
  const { data: qualifiers = [] } = useQuery({ queryKey: ['vcdb-qualifiers'], queryFn: vcdbApi.getQualifiers });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Quantity</label>
          <input 
            type="number" 
            className="w-full border rounded px-3 py-2" 
            value={formData.quantity || application.quantity || 1} 
            min="1"
            onChange={(e) => updateFormData('quantity', parseInt(e.target.value) || 1)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Part Type</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.partTypeId || application.partTypeId || ''}
            onChange={(e) => updateFormData('partTypeId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Part Type...</option>
            {partTypes.slice(0, 100).map(part => (
              <option key={part.id} value={part.id}>{part.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
          <select 
            className="w-full border rounded px-3 py-2" 
            value={formData.positionId || application.positionId || ''}
            onChange={(e) => updateFormData('positionId', parseInt(e.target.value) || null)}
          >
            <option value="">Select Position...</option>
            {positions.map(pos => (
              <option key={pos.id} value={pos.id}>{pos.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Manufacturer Label</label>
          <input 
            type="text" 
            className="w-full border rounded px-3 py-2" 
            placeholder="OEM part label"
            value={formData.mfrLabel || application.mfrLabel || ''}
            onChange={(e) => updateFormData('mfrLabel', e.target.value)}
          />
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Qualifiers</h4>
        <div className="grid grid-cols-1 gap-2">
          <select className="w-full border rounded px-3 py-2">
            <option value="">Add Qualifier...</option>
            {qualifiers.slice(0, 50).map(qual => (
              <option key={qual.id} value={qual.id}>{qual.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Asset References (ACES 4.2)</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Asset Name</label>
            <input 
              type="text" 
              className="w-full border rounded px-3 py-2" 
              value={formData.assetName || application.assetName || ''}
              onChange={(e) => updateFormData('assetName', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Asset Item Order</label>
            <input 
              type="number" 
              className="w-full border rounded px-3 py-2" 
              value={formData.assetItemOrder || application.assetItemOrder || ''}
              onChange={(e) => updateFormData('assetItemOrder', parseInt(e.target.value) || null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};