import React, { useState } from 'react';
import { Plus, Trash2, Save, Car, Settings, Wrench } from 'lucide-react';
import { ACESApplication } from '../types';

interface ACESBuilderProps {
  applications: ACESApplication[];
  onUpdate: (applications: ACESApplication[]) => void;
}

export const ACESBuilder: React.FC<ACESBuilderProps> = ({ applications, onUpdate }) => {
  const [selectedApp, setSelectedApp] = useState<ACESApplication | null>(null);
  const [activeTab, setActiveTab] = useState('vehicle');

  const tabs = [
    { id: 'vehicle', name: 'Vehicle', icon: Car },
    { id: 'engine', name: 'Engine', icon: Settings },
    { id: 'transmission', name: 'Transmission', icon: Wrench },
    { id: 'body', name: 'Body', icon: Car },
    { id: 'brakes', name: 'Brakes', icon: Settings },
    { id: 'application', name: 'Application', icon: Wrench }
  ];

  const addApplication = () => {
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
  };

  const deleteApplication = () => {
    if (!selectedApp) return;
    const updated = applications.filter(app => app.id !== selectedApp.id);
    onUpdate(updated);
    setSelectedApp(updated[0] || null);
  };

  return (
    <div className="flex h-96 border rounded-lg">
      {/* Left Panel - Applications List */}
      <div className="w-1/3 border-r bg-gray-50">
        <div className="p-3 border-b bg-white">
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
        
        <div className="overflow-y-auto h-80">
          {applications.map((app, index) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className={`p-3 border-b cursor-pointer hover:bg-gray-100 ${
                selectedApp?.id === app.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <div className="font-medium text-sm">
                Application {index + 1}
              </div>
              <div className="text-xs text-gray-600">
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
            <div className="p-4 text-center text-gray-500 text-sm">
              No applications. Click Add to create one.
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Application Form */}
      <div className="flex-1">
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
            <div className="p-4 overflow-y-auto h-72">
              {activeTab === 'vehicle' && <VehicleTab application={selectedApp} />}
              {activeTab === 'engine' && <EngineTab application={selectedApp} />}
              {activeTab === 'transmission' && <TransmissionTab application={selectedApp} />}
              {activeTab === 'body' && <BodyTab application={selectedApp} />}
              {activeTab === 'brakes' && <BrakesTab application={selectedApp} />}
              {activeTab === 'application' && <ApplicationTab application={selectedApp} />}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select an application to edit
          </div>
        )}
      </div>
    </div>
  );
};

const VehicleTab: React.FC<{ application: ACESApplication }> = ({ application }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Year</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.year} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Make</label>
        <input type="text" className="w-full border rounded px-3 py-2" defaultValue={application.make} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Model</label>
        <input type="text" className="w-full border rounded px-3 py-2" defaultValue={application.model} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Sub Model</label>
        <input type="text" className="w-full border rounded px-3 py-2" defaultValue={application.subModel} />
      </div>
    </div>
  </div>
);

const EngineTab: React.FC<{ application: ACESApplication }> = ({ application }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Engine Base ID</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.engineBaseId} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Engine VIN ID</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.engineVINId} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Engine Block ID</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.engineBlockId} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Aspiration ID</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.aspirationId} />
      </div>
    </div>
  </div>
);

const TransmissionTab: React.FC<{ application: ACESApplication }> = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Transmission Type</label>
        <select className="w-full border rounded px-3 py-2">
          <option value="">Select...</option>
          <option value="automatic">Automatic</option>
          <option value="manual">Manual</option>
          <option value="cvt">CVT</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Number of Speeds</label>
        <input type="number" className="w-full border rounded px-3 py-2" />
      </div>
    </div>
  </div>
);

const BodyTab: React.FC<{ application: ACESApplication }> = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Body Type</label>
        <select className="w-full border rounded px-3 py-2">
          <option value="">Select...</option>
          <option value="sedan">Sedan</option>
          <option value="suv">SUV</option>
          <option value="truck">Truck</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Number of Doors</label>
        <select className="w-full border rounded px-3 py-2">
          <option value="">Select...</option>
          <option value="2">2</option>
          <option value="4">4</option>
        </select>
      </div>
    </div>
  </div>
);

const BrakesTab: React.FC<{ application: ACESApplication }> = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Brake System</label>
        <select className="w-full border rounded px-3 py-2">
          <option value="">Select...</option>
          <option value="hydraulic">Hydraulic</option>
          <option value="air">Air</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">ABS</label>
        <select className="w-full border rounded px-3 py-2">
          <option value="">Select...</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
    </div>
  </div>
);

const ApplicationTab: React.FC<{ application: ACESApplication }> = ({ application }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Quantity</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.quantity} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Part Type ID</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.partTypeId} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Position ID</label>
        <input type="number" className="w-full border rounded px-3 py-2" defaultValue={application.positionId} />
      </div>
    </div>
  </div>
);