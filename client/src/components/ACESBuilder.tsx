import React, { useState, useEffect } from 'react';

interface ACESBuilderProps {
  applications?: any[];
  onUpdate?: (applications: any[]) => void;
}

type TabType = 'Vehicle' | 'Engine' | 'Transmission' | 'Drive' | 'Brake' | 'Spring' | 'Steering' | 'Wheel' | 'Bed' | 'Body' | 'MfrBody' | 'Item' | 'Validation';

export const ACESBuilder: React.FC<ACESBuilderProps> = ({ applications = [], onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Vehicle');
  
  const tabs: TabType[] = ['Vehicle', 'Engine', 'Transmission', 'Drive', 'Brake', 'Spring', 'Steering', 'Wheel', 'Bed', 'Body', 'MfrBody', 'Item', 'Validation'];
  // Reference data
  const [allYears, setAllYears] = useState<any[]>([]);
  const [allMakes, setAllMakes] = useState<any[]>([]);
  const [allModels, setAllModels] = useState<any[]>([]);
  const [allBaseVehicles, setAllBaseVehicles] = useState<any[]>([]);
  const [vehicleGroups, setVehicleGroups] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [vehicleClasses, setVehicleClasses] = useState<any[]>([]);
  
  // Filtered data
  const [availableMakes, setAvailableMakes] = useState<any[]>([]);
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [availableBaseVehicles, setAvailableBaseVehicles] = useState<any[]>([]);
  
  // Vehicle tab selections
  const [vehicleData, setVehicleData] = useState({
    group: '',
    type: '',
    make: '',
    model: '',
    year: '',
    submodel: '',
    region: '',
    class: '',
    baseVehicleId: ''
  });
  
  // Component data
  const [components, setComponents] = useState({
    subModels: [],
    engineConfigs: [],
    transmissions: [],
    brakeConfigs: [],
    bodyConfigs: [],
    driveTypes: []
  });
  
  // Engine and Transmission reference data
  const [engineRefData, setEngineRefData] = useState<any>({});
  const [transmissionRefData, setTransmissionRefData] = useState<any>({});
  const [vehicleSystemsRefData, setVehicleSystemsRefData] = useState<any>({});
  const [physicalSpecsRefData, setPhysicalSpecsRefData] = useState<any>({});
  const [pcdbRefData, setPcdbRefData] = useState<any>({});
  
  // Engine filter selections with smart relationships
  const [engineFilters, setEngineFilters] = useState({
    liter: '',
    cc: '',
    cid: '',
    cylinders: '',
    blockType: '',
    boreInches: '',
    boreMetric: '',
    strokeInches: '',
    strokeMetric: '',
    cylinderHeadType: '',
    valvesPerEngine: '',
    aspiration: '',
    ignitionSystemType: '',
    horsePower: '',
    kilowattPower: '',
    fuelType: '',
    engineManufacturer: '',
    engineVIN: '',
    engineVersion: ''
  });

  // Smart engine relationship handler
  const handleEngineSelection = (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate related engine fields based on liter selection
    if (field === 'liter' && value) {
      const literValue = parseFloat(value);
      if (literValue) {
        updates.cc = Math.round(literValue * 1000).toString(); // Convert L to CC
        updates.cid = Math.round(literValue * 61.024).toString(); // Convert L to CID
        
        // Estimate cylinders based on displacement
        if (literValue <= 1.5) updates.cylinders = '4';
        else if (literValue <= 3.0) updates.cylinders = '4';
        else if (literValue <= 4.5) updates.cylinders = '6';
        else updates.cylinders = '8';
        
        // Estimate block type based on cylinders
        if (updates.cylinders === '4') updates.blockType = 'I';
        else if (updates.cylinders === '6') updates.blockType = 'V';
        else updates.blockType = 'V';
      }
    }
    
    // Auto-populate CC when liter changes
    if (field === 'cc' && value) {
      const ccValue = parseInt(value);
      if (ccValue) {
        updates.liter = (ccValue / 1000).toFixed(1);
        updates.cid = Math.round(ccValue * 0.061024).toString();
      }
    }
    
    setEngineFilters(prev => ({ ...prev, ...updates }));
  };
  
  // Transmission filter selections with smart relationships
  const [transmissionFilters, setTransmissionFilters] = useState({
    speeds: '',
    control: '',
    type: '',
    mfrName: '',
    mfrCode: '',
    elecControlled: ''
  });

  // Smart transmission relationship handler
  const handleTransmissionSelection = (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate related transmission fields
    if (field === 'type' && value) {
      // Auto-determine control type based on transmission type
      if (value.toLowerCase().includes('automatic') || value.toLowerCase().includes('cvt')) {
        updates.control = 'Automatic';
        updates.elecControlled = 'Yes';
      } else if (value.toLowerCase().includes('manual')) {
        updates.control = 'Manual';
        updates.elecControlled = 'No';
      }
    }
    
    // Auto-populate speeds based on type
    if (field === 'speeds' && value) {
      const speedNum = parseInt(value);
      if (speedNum >= 6) {
        updates.elecControlled = 'Yes';
      }
    }
    
    setTransmissionFilters(prev => ({ ...prev, ...updates }));
  };
  
  // Vehicle systems filter selections with smart relationships
  const [vehicleSystemsFilters, setVehicleSystemsFilters] = useState({
    driveType: '',
    frontBrake: '',
    rearBrake: '',
    brakeSystem: '',
    brakeABS: '',
    frontSpring: '',
    rearSpring: '',
    steeringType: '',
    steeringSystem: ''
  });

  // Smart vehicle systems relationship handler
  const handleVehicleSystemSelection = (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate brake system relationships
    if (field === 'frontBrake' && value) {
      if (value.toLowerCase().includes('disc')) {
        updates.brakeSystem = 'Hydraulic';
        updates.brakeABS = 'Available';
      }
    }
    
    // Auto-populate steering relationships
    if (field === 'steeringType' && value) {
      if (value.toLowerCase().includes('power')) {
        updates.steeringSystem = 'Power Assisted';
      } else {
        updates.steeringSystem = 'Manual';
      }
    }
    
    setVehicleSystemsFilters(prev => ({ ...prev, ...updates }));
  };
  
  // Physical specifications filter selections with smart relationships
  const [physicalSpecsFilters, setPhysicalSpecsFilters] = useState({
    wheelbaseInches: '',
    wheelbaseMetric: '',
    bedType: '',
    bedLengthInches: '',
    bedLengthMetric: '',
    bodyType: '',
    numDoors: '',
    mfrBodyCode: ''
  });

  // Smart physical specs relationship handler
  const handlePhysicalSpecSelection = (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-convert wheelbase measurements
    if (field === 'wheelbaseInches' && value) {
      const inches = parseFloat(value);
      if (inches) {
        updates.wheelbaseMetric = Math.round(inches * 25.4).toString();
      }
    }
    
    if (field === 'wheelbaseMetric' && value) {
      const mm = parseFloat(value);
      if (mm) {
        updates.wheelbaseInches = (mm / 25.4).toFixed(1);
      }
    }
    
    // Auto-convert bed length measurements
    if (field === 'bedLengthInches' && value) {
      const inches = parseFloat(value);
      if (inches) {
        updates.bedLengthMetric = Math.round(inches * 25.4).toString();
      }
    }
    
    if (field === 'bedLengthMetric' && value) {
      const mm = parseFloat(value);
      if (mm) {
        updates.bedLengthInches = (mm / 25.4).toFixed(1);
      }
    }
    
    // Auto-populate door count based on body type
    if (field === 'bodyType' && value) {
      const bodyTypeLower = value.toLowerCase();
      if (bodyTypeLower.includes('coupe')) updates.numDoors = '2';
      else if (bodyTypeLower.includes('sedan')) updates.numDoors = '4';
      else if (bodyTypeLower.includes('wagon')) updates.numDoors = '4';
      else if (bodyTypeLower.includes('suv')) updates.numDoors = '4';
      else if (bodyTypeLower.includes('pickup')) updates.numDoors = '2';
    }
    
    setPhysicalSpecsFilters(prev => ({ ...prev, ...updates }));
  };
  
  // Item specifications with smart relationships
  const [itemSpecs, setItemSpecs] = useState({
    category: '',
    subCategory: '',
    partType: '',
    position: '',
    quantity: 1,
    mfrLabel: '',
    notes: ''
  });

  // Smart item specs relationship handler
  const handleItemSpecSelection = (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate subcategory based on category
    if (field === 'category' && value && pcdbRefData.subCategories) {
      const relatedSubCats = pcdbRefData.subCategories.filter((sc: any) => 
        sc.CategoryID === value
      );
      if (relatedSubCats.length === 1) {
        updates.subCategory = relatedSubCats[0].SubCategoryID;
      }
    }
    
    // Auto-populate part type based on subcategory
    if (field === 'subCategory' && value && pcdbRefData.partTypes) {
      const relatedPartTypes = pcdbRefData.partTypes.filter((pt: any) => 
        pt.SubCategoryID === value
      );
      if (relatedPartTypes.length === 1) {
        updates.partType = relatedPartTypes[0].PartTerminologyID;
      }
    }
    
    // Auto-suggest quantity based on part type
    if (field === 'partType' && value) {
      const partTypeName = pcdbRefData.partTypes?.find((pt: any) => 
        pt.PartTerminologyID === value
      )?.PartTerminologyName?.toLowerCase();
      
      if (partTypeName) {
        if (partTypeName.includes('brake pad') || partTypeName.includes('brake shoe')) {
          updates.quantity = 4; // Typically 4 brake pads per axle
        } else if (partTypeName.includes('spark plug')) {
          updates.quantity = parseInt(engineFilters.cylinders) || 4;
        } else if (partTypeName.includes('tire')) {
          updates.quantity = 4;
        } else if (partTypeName.includes('wiper blade')) {
          updates.quantity = 2;
        }
      }
    }
    
    setItemSpecs(prev => ({ ...prev, ...updates }));
  };
  
  // Validation state
  const [validationFilter, setValidationFilter] = useState('All');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  
  const [selectedComponents, setSelectedComponents] = useState({
    engineConfig: '',
    transmission: '',
    brakeConfig: '',
    driveType: '',
    subModel: ''
  });
  
  const [application, setApplication] = useState({
    partNumber: '',
    partType: '',
    position: '',
    quantity: 1,
    qualifiers: [],
    notes: ''
  });
  
  const [currentApplications, setCurrentApplications] = useState(applications);

  // Load all reference data
  useEffect(() => {
    Promise.all([
      fetch('/api/aces-corrected/years').then(r => r.json()),
      fetch('/api/aces-corrected/makes').then(r => r.json()),
      fetch('/api/aces-corrected/models').then(r => r.json()),
      fetch('/api/databases/vcdb/20231026_BaseVehicle').then(r => r.json()),
      fetch('/api/aces-corrected/vehicle-groups').then(r => r.json()),
      fetch('/api/aces-corrected/vehicle-types').then(r => r.json()),
      fetch('/api/aces-corrected/regions').then(r => r.json()),
      fetch('/api/aces-corrected/vehicle-classes').then(r => r.json()),
      fetch('/api/aces-corrected/pcdb-reference').then(r => r.json())
    ]).then(([years, makes, models, baseVehicles, groups, types, regions, classes, pcdb]) => {
      setAllYears(years);
      setAllMakes(makes);
      setAllModels(models);
      setAllBaseVehicles(baseVehicles.data);
      setVehicleGroups(groups);
      setVehicleTypes(types);
      setRegions(regions);
      setVehicleClasses(classes);
      setPcdbRefData(pcdb);
    });
  }, []);

  // Filter makes when year selected
  useEffect(() => {
    if (vehicleData.year) {
      const validMakeIds = allBaseVehicles
        .filter(bv => bv.YearID === vehicleData.year)
        .map(bv => bv.MakeID);
      const uniqueMakeIds = [...new Set(validMakeIds)];
      const filteredMakes = allMakes.filter(make => uniqueMakeIds.includes(make.MakeID));
      setAvailableMakes(filteredMakes);
      setVehicleData(prev => ({ ...prev, make: '', model: '', baseVehicleId: '' }));
    } else {
      setAvailableMakes([]);
    }
  }, [vehicleData.year, allBaseVehicles, allMakes]);

  // Filter models when make selected
  useEffect(() => {
    if (vehicleData.year && vehicleData.make) {
      const validModelIds = allBaseVehicles
        .filter(bv => bv.YearID === vehicleData.year && bv.MakeID === vehicleData.make)
        .map(bv => bv.ModelID);
      const uniqueModelIds = [...new Set(validModelIds)];
      const filteredModels = allModels.filter(model => uniqueModelIds.includes(model.ModelID));
      setAvailableModels(filteredModels);
      setVehicleData(prev => ({ ...prev, model: '', baseVehicleId: '' }));
    } else {
      setAvailableModels([]);
    }
  }, [vehicleData.year, vehicleData.make, allBaseVehicles, allModels]);

  // Auto-determine BaseVehicle when Year/Make/Model selected
  useEffect(() => {
    if (vehicleData.year && vehicleData.make && vehicleData.model) {
      const matchingBaseVehicles = allBaseVehicles.filter(bv => 
        bv.YearID === vehicleData.year && 
        bv.MakeID === vehicleData.make && 
        bv.ModelID === vehicleData.model
      );
      
      if (matchingBaseVehicles.length === 1) {
        // Single match - auto-select
        setVehicleData(prev => ({ ...prev, baseVehicleId: matchingBaseVehicles[0].BaseVehicleID }));
      } else if (matchingBaseVehicles.length > 1) {
        // Multiple matches - need submodel selection
        setAvailableBaseVehicles(matchingBaseVehicles);
        setVehicleData(prev => ({ ...prev, baseVehicleId: '' }));
      } else {
        // No matches
        setAvailableBaseVehicles([]);
        setVehicleData(prev => ({ ...prev, baseVehicleId: '' }));
      }
    } else {
      setAvailableBaseVehicles([]);
      setVehicleData(prev => ({ ...prev, baseVehicleId: '' }));
    }
  }, [vehicleData.year, vehicleData.make, vehicleData.model, allBaseVehicles]);

  // Load components and auto-populate vehicle attributes when BaseVehicle selected
  useEffect(() => {
    if (vehicleData.baseVehicleId) {
      Promise.all([
        fetch(`/api/aces-corrected/submodels/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/engine-configs/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/transmissions/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/brake-configs/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/body-configs/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/drive-types/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/engine-reference/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/transmission-reference/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/vehicle-systems-reference/${vehicleData.baseVehicleId}`).then(r => r.json()),
        fetch(`/api/aces-corrected/physical-specs-reference/${vehicleData.baseVehicleId}`).then(r => r.json())
      ]).then(([subModels, engineConfigs, transmissions, brakeConfigs, bodyConfigs, driveTypes, engineRef, transRef, systemsRef, specsRef]) => {
        setComponents({
          subModels,
          engineConfigs,
          transmissions,
          brakeConfigs,
          bodyConfigs,
          driveTypes
        });
        setEngineRefData(engineRef);
        setTransmissionRefData(transRef);
        setVehicleSystemsRefData(systemsRef);
        setPhysicalSpecsRefData(specsRef);
        
        // Auto-populate vehicle attributes based on BaseVehicle
        const selectedModel = allModels.find(m => m.ModelID === vehicleData.model);
        if (selectedModel) {
          const vehicleType = vehicleTypes.find(vt => vt.VehicleTypeID === selectedModel.VehicleTypeID);
          if (vehicleType) {
            setVehicleData(prev => ({
              ...prev,
              type: vehicleType.VehicleTypeID,
              group: vehicleType.VehicleTypeName?.toLowerCase().includes('truck') ? 'truck' : 'passenger',
              region: 'north_america', // Default region
              class: vehicleType.VehicleTypeName?.toLowerCase().includes('truck') ? 'truck' : 'midsize'
            }));
          }
        }
      });
    }
  }, [vehicleData.baseVehicleId, allModels, vehicleTypes]);

  const addApplication = () => {
    if (!vehicleData.baseVehicleId) return;
    
    const yearName = allYears.find(y => y.YearID === vehicleData.year)?.YearID;
    const makeName = allMakes.find(m => m.MakeID === vehicleData.make)?.MakeName;
    const modelName = allModels.find(m => m.ModelID === vehicleData.model)?.ModelName;
    
    const newApp = {
      id: Date.now().toString(),
      baseVehicleId: vehicleData.baseVehicleId,
      year: yearName,
      make: makeName,
      model: modelName,
      engineConfig: selectedComponents.engineConfig,
      transmission: selectedComponents.transmission,
      brakeConfig: selectedComponents.brakeConfig,
      driveType: selectedComponents.driveType,
      subModel: selectedComponents.subModel,
      ...application,
      ...vehicleData,
      ...itemSpecs
    };
    
    const updatedApps = [...currentApplications, newApp];
    setCurrentApplications(updatedApps);
    onUpdate?.(updatedApps);
    
    // Reset form
    setVehicleData({
      group: '',
      type: '',
      make: '',
      model: '',
      year: '',
      submodel: '',
      region: '',
      class: '',
      baseVehicleId: ''
    });
    setSelectedComponents({
      engineConfig: '',
      transmission: '',
      brakeConfig: '',
      driveType: '',
      subModel: ''
    });
    setEngineFilters({
      liter: '',
      cc: '',
      cid: '',
      cylinders: '',
      blockType: '',
      boreInches: '',
      boreMetric: '',
      strokeInches: '',
      strokeMetric: '',
      cylinderHeadType: '',
      valvesPerEngine: '',
      aspiration: '',
      ignitionSystemType: '',
      horsePower: '',
      kilowattPower: '',
      fuelType: '',
      engineManufacturer: '',
      engineVIN: '',
      engineVersion: ''
    });
    setTransmissionFilters({
      speeds: '',
      control: '',
      type: '',
      mfrName: '',
      mfrCode: '',
      elecControlled: ''
    });
    setVehicleSystemsFilters({
      driveType: '',
      frontBrake: '',
      rearBrake: '',
      brakeSystem: '',
      brakeABS: '',
      frontSpring: '',
      rearSpring: '',
      steeringType: '',
      steeringSystem: ''
    });
    setPhysicalSpecsFilters({
      wheelbaseInches: '',
      wheelbaseMetric: '',
      bedType: '',
      bedLengthInches: '',
      bedLengthMetric: '',
      bodyType: '',
      numDoors: '',
      mfrBodyCode: ''
    });
    setItemSpecs({
      category: '',
      subCategory: '',
      partType: '',
      position: '',
      quantity: 1,
      mfrLabel: '',
      notes: ''
    });
  };
  
  const removeApplication = (id: string) => {
    const updatedApps = currentApplications.filter(app => app.id !== id);
    setCurrentApplications(updatedApps);
    onUpdate?.(updatedApps);
  };
  
  const exportToXML = async () => {
    try {
      const response = await fetch('/api/aces-corrected/export-xml', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applications: currentApplications })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'aces-applications.xml';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };
  
  const validateApplications = async () => {
    const errors = [];
    for (const app of currentApplications) {
      try {
        const response = await fetch('/api/aces-corrected/validate-application', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(app)
        });
        const validation = await response.json();
        if (!validation.isValid) {
          errors.push(`Application ${app.id}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        errors.push(`Application ${app.id}: Validation failed`);
      }
    }
    setValidationErrors(errors);
  };
  
  const filteredApplications = currentApplications.filter(app => {
    if (validationFilter === 'All') return true;
    // Add validation logic based on filter
    return true;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 'Vehicle':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Group</label>
                <select 
                  value={vehicleData.group} 
                  onChange={(e) => setVehicleData({...vehicleData, group: e.target.value})}
                  className="w-full p-2 border rounded text-sm bg-green-50"
                  title="Auto-populated based on vehicle selection"
                >
                  <option value="">Select Group</option>
                  {vehicleGroups.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                {vehicleData.group && <p className="text-xs text-green-600 mt-1">✓ Auto-selected</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  value={vehicleData.type} 
                  onChange={(e) => setVehicleData({...vehicleData, type: e.target.value})}
                  className="w-full p-2 border rounded text-sm bg-green-50"
                  title="Auto-populated based on vehicle selection"
                >
                  <option value="">Select Type</option>
                  {vehicleTypes.map(type => (
                    <option key={type.VehicleTypeID} value={type.VehicleTypeID}>{type.VehicleTypeName}</option>
                  ))}
                </select>
                {vehicleData.type && <p className="text-xs text-green-600 mt-1">✓ Auto-selected</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <select 
                  value={vehicleData.make} 
                  onChange={(e) => setVehicleData({...vehicleData, make: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                  disabled={!vehicleData.year}
                >
                  <option value="">Select Make</option>
                  {availableMakes.map(make => (
                    <option key={make.MakeID} value={make.MakeID}>{make.MakeName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">{availableMakes.length} available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <select 
                  value={vehicleData.model} 
                  onChange={(e) => setVehicleData({...vehicleData, model: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                  disabled={!vehicleData.make}
                >
                  <option value="">Select Model</option>
                  {availableModels.map(model => (
                    <option key={model.ModelID} value={model.ModelID}>{model.ModelName}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">{availableModels.length} available</p>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <select 
                  value={vehicleData.year} 
                  onChange={(e) => setVehicleData({...vehicleData, year: e.target.value})}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Select Year</option>
                  {allYears.map(year => (
                    <option key={year.YearID} value={year.YearID}>{year.YearID}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Submodel</label>
                <select 
                  value={vehicleData.submodel} 
                  onChange={(e) => {
                    const newSubmodel = e.target.value;
                    setVehicleData({...vehicleData, submodel: newSubmodel});
                    
                    // Auto-select BaseVehicle if submodel helps narrow it down
                    if (newSubmodel && availableBaseVehicles.length > 1) {
                      // Find BaseVehicle that matches this submodel
                      const matchingBV = availableBaseVehicles.find(bv => {
                        const vehicles = components.subModels.filter(sm => sm.SubModelID === newSubmodel);
                        return vehicles.some(v => v.BaseVehicleID === bv.BaseVehicleID);
                      });
                      if (matchingBV) {
                        setVehicleData(prev => ({...prev, baseVehicleId: matchingBV.BaseVehicleID}));
                      }
                    }
                  }}
                  className="w-full p-2 border rounded text-sm"
                  disabled={!vehicleData.baseVehicleId && availableBaseVehicles.length <= 1}
                >
                  <option value="">Select Submodel</option>
                  {components.subModels.map(sub => (
                    <option key={sub.SubModelID} value={sub.SubModelID}>{sub.displayName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Region</label>
                <select 
                  value={vehicleData.region} 
                  onChange={(e) => setVehicleData({...vehicleData, region: e.target.value})}
                  className="w-full p-2 border rounded text-sm bg-green-50"
                  title="Auto-populated based on vehicle selection"
                >
                  <option value="">Select Region</option>
                  {regions.map(region => (
                    <option key={region.id} value={region.id}>{region.name}</option>
                  ))}
                </select>
                {vehicleData.region && <p className="text-xs text-green-600 mt-1">✓ Auto-selected</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Class</label>
                <select 
                  value={vehicleData.class} 
                  onChange={(e) => setVehicleData({...vehicleData, class: e.target.value})}
                  className="w-full p-2 border rounded text-sm bg-green-50"
                  title="Auto-populated based on vehicle selection"
                >
                  <option value="">Select Class</option>
                  {vehicleClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                {vehicleData.class && <p className="text-xs text-green-600 mt-1">✓ Auto-selected</p>}
              </div>
            </div>
            
            {availableBaseVehicles.length > 1 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800 mb-2">Multiple vehicle configurations found. Please select submodel to specify:</p>
                <div className="grid grid-cols-2 gap-2">
                  {availableBaseVehicles.map(bv => (
                    <button
                      key={bv.BaseVehicleID}
                      onClick={() => setVehicleData({...vehicleData, baseVehicleId: bv.BaseVehicleID})}
                      className="text-left p-2 bg-white border rounded text-sm hover:bg-blue-50"
                    >
                      Configuration {bv.BaseVehicleID}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {vehicleData.baseVehicleId && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <p className="text-sm text-green-800">
                  ✓ Vehicle Configuration: {vehicleData.year} {allMakes.find(m => m.MakeID === vehicleData.make)?.MakeName} {allModels.find(m => m.ModelID === vehicleData.model)?.ModelName}
                  <span className="ml-2 text-xs">(BaseVehicle: {vehicleData.baseVehicleId})</span>
                </p>
              </div>
            )}
          </div>
        );
      
      case 'Engine':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                {/* Basic Engine Specifications */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Liter</label>
                    <select 
                      value={engineFilters.liter}
                      onChange={(e) => handleEngineSelection('liter', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Liter</option>
                      {engineRefData.liters?.map((liter: string) => (
                        <option key={liter} value={liter}>{liter}L</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">CC</label>
                    <select 
                      value={engineFilters.cc}
                      onChange={(e) => handleEngineSelection('cc', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.cc && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.cc && engineFilters.liter ? 'Auto-populated from Liter selection' : ''}
                    >
                      <option value="">Any CC</option>
                      {engineRefData.ccs?.map((cc: string) => (
                        <option key={cc} value={cc}>{cc} CC</option>
                      ))}
                    </select>
                    {engineFilters.cc && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-calculated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">CID</label>
                    <select 
                      value={engineFilters.cid}
                      onChange={(e) => handleEngineSelection('cid', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.cid && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.cid && engineFilters.liter ? 'Auto-populated from Liter selection' : ''}
                    >
                      <option value="">Any CID</option>
                      {engineRefData.cids?.map((cid: string) => (
                        <option key={cid} value={cid}>{cid} CID</option>
                      ))}
                    </select>
                    {engineFilters.cid && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-calculated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Cylinders</label>
                    <select 
                      value={engineFilters.cylinders}
                      onChange={(e) => handleEngineSelection('cylinders', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.cylinders && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.cylinders && engineFilters.liter ? 'Auto-estimated from displacement' : ''}
                    >
                      <option value="">Any Cylinders</option>
                      {engineRefData.cylinders?.map((cyl: string) => (
                        <option key={cyl} value={cyl}>{cyl} Cylinders</option>
                      ))}
                    </select>
                    {engineFilters.cylinders && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-estimated</p>}
                  </div>
                </div>
                
                {/* Engine Block and Bore/Stroke */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Block Type</label>
                    <select 
                      value={engineFilters.blockType}
                      onChange={(e) => handleEngineSelection('blockType', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.blockType && engineFilters.cylinders ? 'bg-green-50' : ''}`}
                      title={engineFilters.blockType && engineFilters.cylinders ? 'Auto-estimated from cylinder count' : ''}
                    >
                      <option value="">Any Block Type</option>
                      {engineRefData.blockTypes?.map((bt: string) => (
                        <option key={bt} value={bt}>{bt}</option>
                      ))}
                    </select>
                    {engineFilters.blockType && engineFilters.cylinders && <p className="text-xs text-green-600 mt-1">✓ Auto-estimated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bore Inches</label>
                    <select 
                      value={engineFilters.boreInches}
                      onChange={(e) => handleEngineSelection('boreInches', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Bore (in)</option>
                      {engineRefData.boreInches?.map((bore: string) => (
                        <option key={bore} value={bore}>{bore}"</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Bore Metric</label>
                    <select 
                      value={engineFilters.boreMetric}
                      onChange={(e) => handleEngineSelection('boreMetric', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Bore (mm)</option>
                      {engineRefData.boreMetric?.map((bore: string) => (
                        <option key={bore} value={bore}>{bore}mm</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Stroke Inches</label>
                    <select 
                      value={engineFilters.strokeInches}
                      onChange={(e) => handleEngineSelection('strokeInches', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Stroke (in)</option>
                      {engineRefData.strokeInches?.map((stroke: string) => (
                        <option key={stroke} value={stroke}>{stroke}"</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Advanced Engine Properties */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cylinder Head Type</label>
                    <select 
                      value={engineFilters.cylinderHeadType}
                      onChange={(e) => handleEngineSelection('cylinderHeadType', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Head Type</option>
                      {engineRefData.cylinderHeadTypes?.map((cht: any) => (
                        <option key={cht.CylinderHeadTypeID} value={cht.CylinderHeadTypeID}>{cht.CylinderHeadTypeName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Aspiration</label>
                    <select 
                      value={engineFilters.aspiration}
                      onChange={(e) => handleEngineSelection('aspiration', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Aspiration</option>
                      {engineRefData.aspirations?.map((asp: any) => (
                        <option key={asp.AspirationID} value={asp.AspirationID}>{asp.AspirationName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Valves Per Engine</label>
                    <select 
                      value={engineFilters.valvesPerEngine}
                      onChange={(e) => handleEngineSelection('valvesPerEngine', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Valves</option>
                      {engineRefData.valves?.map((valve: any) => (
                        <option key={valve.ValvesID} value={valve.ValvesID}>{valve.ValvesPerEngine} Valves</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Power and Fuel */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Horse Power</label>
                    <select 
                      value={engineFilters.horsePower}
                      onChange={(e) => handleEngineSelection('horsePower', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any HP</option>
                      {engineRefData.powerOutputs?.map((po: any) => (
                        <option key={po.PowerOutputID} value={po.PowerOutputID}>{po.HorsePower} HP</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Engine Manufacturer</label>
                    <select 
                      value={engineFilters.engineManufacturer}
                      onChange={(e) => handleEngineSelection('engineManufacturer', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Manufacturer</option>
                      {engineRefData.manufacturers?.map((mfr: any) => (
                        <option key={mfr.MfrID} value={mfr.MfrID}>{mfr.MfrName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Engine VIN</label>
                    <select 
                      value={engineFilters.engineVIN}
                      onChange={(e) => handleEngineSelection('engineVIN', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any VIN</option>
                      {engineRefData.engineVINs?.map((evin: any) => (
                        <option key={evin.EngineVINID} value={evin.EngineVINID}>{evin.EngineVINName}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Showing {components.engineConfigs.length} engine configurations for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view engine options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Transmission':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                {/* Primary Transmission Fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Speeds</label>
                    <select 
                      value={transmissionFilters.speeds}
                      onChange={(e) => handleTransmissionSelection('speeds', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Speeds</option>
                      {transmissionRefData.speeds?.map((speed: any) => (
                        <option key={speed.TransmissionNumSpeedsID} value={speed.TransmissionNumSpeedsID}>
                          {speed.TransmissionNumSpeeds}-Speed
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Control</label>
                    <select 
                      value={transmissionFilters.control}
                      onChange={(e) => handleTransmissionSelection('control', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${transmissionFilters.control && transmissionFilters.type ? 'bg-green-50' : ''}`}
                      title={transmissionFilters.control && transmissionFilters.type ? 'Auto-populated from Type selection' : ''}
                    >
                      <option value="">Any Control</option>
                      {transmissionRefData.controlTypes?.map((control: any) => (
                        <option key={control.TransmissionControlTypeID} value={control.TransmissionControlTypeID}>
                          {control.TransmissionControlTypeName}
                        </option>
                      ))}
                    </select>
                    {transmissionFilters.control && transmissionFilters.type && <p className="text-xs text-green-600 mt-1">✓ Auto-determined</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Type</label>
                    <select 
                      value={transmissionFilters.type}
                      onChange={(e) => handleTransmissionSelection('type', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Type</option>
                      {transmissionRefData.types?.map((type: any) => (
                        <option key={type.TransmissionTypeID} value={type.TransmissionTypeID}>
                          {type.TransmissionTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                {/* Manufacturer Information */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mfr Name</label>
                    <select 
                      value={transmissionFilters.mfrName}
                      onChange={(e) => handleTransmissionSelection('mfrName', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Manufacturer</option>
                      {transmissionRefData.manufacturers?.map((mfr: any) => (
                        <option key={mfr.MfrID} value={mfr.MfrID}>{mfr.MfrName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Mfr Code</label>
                    <select 
                      value={transmissionFilters.mfrCode}
                      onChange={(e) => handleTransmissionSelection('mfrCode', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Mfr Code</option>
                      {transmissionRefData.mfrCodes?.map((code: any) => (
                        <option key={code.TransmissionMfrCodeID} value={code.TransmissionMfrCodeID}>
                          {code.TransmissionMfrCode}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Elec Controlled</label>
                    <select 
                      value={transmissionFilters.elecControlled}
                      onChange={(e) => handleTransmissionSelection('elecControlled', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${transmissionFilters.elecControlled && (transmissionFilters.type || transmissionFilters.speeds) ? 'bg-green-50' : ''}`}
                      title={transmissionFilters.elecControlled && (transmissionFilters.type || transmissionFilters.speeds) ? 'Auto-determined from Type/Speeds' : ''}
                    >
                      <option value="">Any</option>
                      {transmissionRefData.elecControlled?.map((ec: any) => (
                        <option key={ec.ElecControlledID} value={ec.ElecControlledID}>
                          {ec.ElecControlled}
                        </option>
                      ))}
                    </select>
                    {transmissionFilters.elecControlled && (transmissionFilters.type || transmissionFilters.speeds) && <p className="text-xs text-green-600 mt-1">✓ Auto-determined</p>}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Showing {components.transmissions.length} transmission configurations for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view transmission options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Brake':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Front Brake</label>
                    <select 
                      value={vehicleSystemsFilters.frontBrake}
                      onChange={(e) => handleVehicleSystemSelection('frontBrake', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Front Brake</option>
                      {vehicleSystemsRefData.frontBrakeTypes?.map((brake: any) => (
                        <option key={brake.BrakeTypeID} value={brake.BrakeTypeID}>
                          {brake.BrakeTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Rear Brake</label>
                    <select 
                      value={vehicleSystemsFilters.rearBrake}
                      onChange={(e) => handleVehicleSystemSelection('rearBrake', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Rear Brake</option>
                      {vehicleSystemsRefData.rearBrakeTypes?.map((brake: any) => (
                        <option key={brake.BrakeTypeID} value={brake.BrakeTypeID}>
                          {brake.BrakeTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Brake System</label>
                    <select 
                      value={vehicleSystemsFilters.brakeSystem}
                      onChange={(e) => handleVehicleSystemSelection('brakeSystem', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${vehicleSystemsFilters.brakeSystem && vehicleSystemsFilters.frontBrake ? 'bg-green-50' : ''}`}
                      title={vehicleSystemsFilters.brakeSystem && vehicleSystemsFilters.frontBrake ? 'Auto-determined from brake type' : ''}
                    >
                      <option value="">Any Brake System</option>
                      {vehicleSystemsRefData.brakeSystems?.map((system: any) => (
                        <option key={system.BrakeSystemID} value={system.BrakeSystemID}>
                          {system.BrakeSystemName}
                        </option>
                      ))}
                    </select>
                    {vehicleSystemsFilters.brakeSystem && vehicleSystemsFilters.frontBrake && <p className="text-xs text-green-600 mt-1">✓ Auto-determined</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Brake ABS</label>
                    <select 
                      value={vehicleSystemsFilters.brakeABS}
                      onChange={(e) => handleVehicleSystemSelection('brakeABS', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${vehicleSystemsFilters.brakeABS && vehicleSystemsFilters.frontBrake ? 'bg-green-50' : ''}`}
                      title={vehicleSystemsFilters.brakeABS && vehicleSystemsFilters.frontBrake ? 'Auto-determined from brake type' : ''}
                    >
                      <option value="">Any ABS</option>
                      {vehicleSystemsRefData.brakeABS?.map((abs: any) => (
                        <option key={abs.BrakeABSID} value={abs.BrakeABSID}>
                          {abs.BrakeABSName}
                        </option>
                      ))}
                    </select>
                    {vehicleSystemsFilters.brakeABS && vehicleSystemsFilters.frontBrake && <p className="text-xs text-green-600 mt-1">✓ Auto-determined</p>}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Showing {components.brakeConfigs.length} brake configurations for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view brake options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Drive':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <div>
                <label className="block text-sm font-medium mb-1">Drive Type</label>
                <select 
                  value={vehicleSystemsFilters.driveType}
                  onChange={(e) => handleVehicleSystemSelection('driveType', e.target.value)}
                  className="w-full p-2 border rounded text-sm max-w-md"
                >
                  <option value="">Any Drive Type</option>
                  {vehicleSystemsRefData.driveTypes?.map((drive: any) => (
                    <option key={drive.DriveTypeID} value={drive.DriveTypeID}>
                      {drive.DriveTypeName}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">{vehicleSystemsRefData.driveTypes?.length || 0} drive types available</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view drive type options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Spring':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Front Spring</label>
                    <select 
                      value={vehicleSystemsFilters.frontSpring}
                      onChange={(e) => handleVehicleSystemSelection('frontSpring', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Front Spring</option>
                      {vehicleSystemsRefData.frontSpringTypes?.map((spring: any) => (
                        <option key={spring.SpringTypeID} value={spring.SpringTypeID}>
                          {spring.SpringTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Rear Spring</label>
                    <select 
                      value={vehicleSystemsFilters.rearSpring}
                      onChange={(e) => handleVehicleSystemSelection('rearSpring', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Rear Spring</option>
                      {vehicleSystemsRefData.rearSpringTypes?.map((spring: any) => (
                        <option key={spring.SpringTypeID} value={spring.SpringTypeID}>
                          {spring.SpringTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Spring suspension options for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view spring options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Steering':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Steering Type</label>
                    <select 
                      value={vehicleSystemsFilters.steeringType}
                      onChange={(e) => handleVehicleSystemSelection('steeringType', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Steering Type</option>
                      {vehicleSystemsRefData.steeringTypes?.map((type: any) => (
                        <option key={type.SteeringTypeID} value={type.SteeringTypeID}>
                          {type.SteeringTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Steering System</label>
                    <select 
                      value={vehicleSystemsFilters.steeringSystem}
                      onChange={(e) => handleVehicleSystemSelection('steeringSystem', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${vehicleSystemsFilters.steeringSystem && vehicleSystemsFilters.steeringType ? 'bg-green-50' : ''}`}
                      title={vehicleSystemsFilters.steeringSystem && vehicleSystemsFilters.steeringType ? 'Auto-determined from steering type' : ''}
                    >
                      <option value="">Any Steering System</option>
                      {vehicleSystemsRefData.steeringSystems?.map((system: any) => (
                        <option key={system.SteeringSystemID} value={system.SteeringSystemID}>
                          {system.SteeringSystemName}
                        </option>
                      ))}
                    </select>
                    {vehicleSystemsFilters.steeringSystem && vehicleSystemsFilters.steeringType && <p className="text-xs text-green-600 mt-1">✓ Auto-determined</p>}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Steering system options for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view steering options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Wheel':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Inches</label>
                    <select 
                      value={physicalSpecsFilters.wheelbaseInches}
                      onChange={(e) => handlePhysicalSpecSelection('wheelbaseInches', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Wheelbase (in)</option>
                      {physicalSpecsRefData.wheelbases?.map((wb: any) => (
                        <option key={wb.WheelBaseID} value={wb.WheelBaseID}>
                          {wb.WheelBase}" wheelbase
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Base Metric</label>
                    <select 
                      value={physicalSpecsFilters.wheelbaseMetric}
                      onChange={(e) => handlePhysicalSpecSelection('wheelbaseMetric', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${physicalSpecsFilters.wheelbaseMetric && physicalSpecsFilters.wheelbaseInches ? 'bg-green-50' : ''}`}
                      title={physicalSpecsFilters.wheelbaseMetric && physicalSpecsFilters.wheelbaseInches ? 'Auto-converted from inches' : ''}
                    >
                      <option value="">Any Wheelbase (mm)</option>
                      {physicalSpecsRefData.wheelbases?.map((wb: any) => (
                        <option key={wb.WheelBaseID} value={wb.WheelBaseID}>
                          {wb.WheelBaseMetric}mm wheelbase
                        </option>
                      ))}
                    </select>
                    {physicalSpecsFilters.wheelbaseMetric && physicalSpecsFilters.wheelbaseInches && <p className="text-xs text-green-600 mt-1">✓ Auto-converted</p>}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Wheelbase specifications for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view wheelbase options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Bed':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              physicalSpecsRefData.isTruck ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Bed Type</label>
                      <select 
                        value={physicalSpecsFilters.bedType}
                        onChange={(e) => handlePhysicalSpecSelection('bedType', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Any Bed Type</option>
                        {physicalSpecsRefData.bedTypes?.map((bt: any) => (
                          <option key={bt.BedTypeID} value={bt.BedTypeID}>
                            {bt.BedTypeName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Length Inches</label>
                      <select 
                        value={physicalSpecsFilters.bedLengthInches}
                        onChange={(e) => handlePhysicalSpecSelection('bedLengthInches', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="">Any Length (in)</option>
                        {physicalSpecsRefData.bedLengths?.map((bl: any) => (
                          <option key={bl.BedLengthID} value={bl.BedLengthID}>
                            {bl.BedLength}" bed
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Length Metric</label>
                    <select 
                      value={physicalSpecsFilters.bedLengthMetric}
                      onChange={(e) => handlePhysicalSpecSelection('bedLengthMetric', e.target.value)}
                      className={`w-full p-2 border rounded text-sm max-w-md ${physicalSpecsFilters.bedLengthMetric && physicalSpecsFilters.bedLengthInches ? 'bg-green-50' : ''}`}
                      title={physicalSpecsFilters.bedLengthMetric && physicalSpecsFilters.bedLengthInches ? 'Auto-converted from inches' : ''}
                    >
                      <option value="">Any Length (mm)</option>
                      {physicalSpecsRefData.bedLengths?.map((bl: any) => (
                        <option key={bl.BedLengthID} value={bl.BedLengthID}>
                          {bl.BedLengthMetric}mm bed
                        </option>
                      ))}
                    </select>
                    {physicalSpecsFilters.bedLengthMetric && physicalSpecsFilters.bedLengthInches && <p className="text-xs text-green-600 mt-1">✓ Auto-converted</p>}
                  </div>
                  
                  <div className="text-sm text-gray-600 mt-4">
                    <p>Truck bed specifications for selected BaseVehicle</p>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>Bed specifications are only available for truck/pickup vehicles.</p>
                  <p className="text-sm mt-2">This vehicle type does not have bed configurations.</p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view bed options.</p>
              </div>
            )}
          </div>
        );
      
      case 'Body':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Body Type</label>
                    <select 
                      value={physicalSpecsFilters.bodyType}
                      onChange={(e) => handlePhysicalSpecSelection('bodyType', e.target.value)}
                      className="w-full p-2 border rounded text-sm"
                    >
                      <option value="">Any Body Type</option>
                      {physicalSpecsRefData.bodyTypes?.map((bt: any) => (
                        <option key={bt.BodyTypeID} value={bt.BodyTypeID}>
                          {bt.BodyTypeName}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Num Doors</label>
                    <select 
                      value={physicalSpecsFilters.numDoors}
                      onChange={(e) => handlePhysicalSpecSelection('numDoors', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${physicalSpecsFilters.numDoors && physicalSpecsFilters.bodyType ? 'bg-green-50' : ''}`}
                      title={physicalSpecsFilters.numDoors && physicalSpecsFilters.bodyType ? 'Auto-estimated from body type' : ''}
                    >
                      <option value="">Any Doors</option>
                      {physicalSpecsRefData.bodyNumDoors?.map((bnd: any) => (
                        <option key={bnd.BodyNumDoorsID} value={bnd.BodyNumDoorsID}>
                          {bnd.BodyNumDoors} doors
                        </option>
                      ))}
                    </select>
                    {physicalSpecsFilters.numDoors && physicalSpecsFilters.bodyType && <p className="text-xs text-green-600 mt-1">✓ Auto-estimated</p>}
                  </div>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Body style specifications for selected BaseVehicle</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view body options.</p>
              </div>
            )}
          </div>
        );
      
      case 'MfrBody':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Body Code</label>
                  <select 
                    value={physicalSpecsFilters.mfrBodyCode}
                    onChange={(e) => handlePhysicalSpecSelection('mfrBodyCode', e.target.value)}
                    className="w-full p-2 border rounded text-sm max-w-md"
                  >
                    <option value="">Any Manufacturer Body Code</option>
                    {physicalSpecsRefData.mfrBodyCodes?.map((mbc: any) => (
                      <option key={mbc.MfrBodyCodeID} value={mbc.MfrBodyCodeID}>
                        {mbc.MfrBodyCodeName}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="text-sm text-gray-600 mt-4">
                  <p>Manufacturer-specific body codes for selected BaseVehicle</p>
                  <p className="text-xs text-gray-500 mt-1">{physicalSpecsRefData.mfrBodyCodes?.length || 0} manufacturer body codes available</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to view manufacturer body codes.</p>
              </div>
            )}
          </div>
        );
      
      case 'Item':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={itemSpecs.category}
                  onChange={(e) => handleItemSpecSelection('category', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Select Category</option>
                  {pcdbRefData.categories?.map((cat: any) => (
                    <option key={cat.CategoryID} value={cat.CategoryID}>{cat.CategoryName}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sub Category</label>
                <select 
                  value={itemSpecs.subCategory}
                  onChange={(e) => handleItemSpecSelection('subCategory', e.target.value)}
                  className={`w-full p-2 border rounded text-sm ${itemSpecs.subCategory && itemSpecs.category ? 'bg-green-50' : ''}`}
                  title={itemSpecs.subCategory && itemSpecs.category ? 'Auto-populated from Category selection' : ''}
                >
                  <option value="">Select Sub Category</option>
                  {pcdbRefData.subCategories?.map((subCat: any) => (
                    <option key={subCat.SubCategoryID} value={subCat.SubCategoryID}>{subCat.SubCategoryName}</option>
                  ))}
                </select>
                {itemSpecs.subCategory && itemSpecs.category && <p className="text-xs text-green-600 mt-1">✓ Auto-selected</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Part Type</label>
                <select 
                  value={itemSpecs.partType}
                  onChange={(e) => handleItemSpecSelection('partType', e.target.value)}
                  className={`w-full p-2 border rounded text-sm ${itemSpecs.partType && itemSpecs.subCategory ? 'bg-green-50' : ''}`}
                  title={itemSpecs.partType && itemSpecs.subCategory ? 'Auto-populated from Sub Category selection' : ''}
                >
                  <option value="">Select Part Type</option>
                  {pcdbRefData.partTypes?.map((pt: any) => (
                    <option key={pt.PartTerminologyID} value={pt.PartTerminologyID}>{pt.PartTerminologyName}</option>
                  ))}
                </select>
                {itemSpecs.partType && itemSpecs.subCategory && <p className="text-xs text-green-600 mt-1">✓ Auto-selected</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <select 
                  value={itemSpecs.position}
                  onChange={(e) => handleItemSpecSelection('position', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                >
                  <option value="">Select Position</option>
                  {pcdbRefData.positions?.map((pos: any) => (
                    <option key={pos.PositionID} value={pos.PositionID}>{pos.Position}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Qty</label>
                <input 
                  type="number"
                  value={itemSpecs.quantity}
                  onChange={(e) => handleItemSpecSelection('quantity', e.target.value)}
                  className={`w-full p-2 border rounded text-sm ${itemSpecs.quantity > 1 && itemSpecs.partType ? 'bg-green-50' : ''}`}
                  title={itemSpecs.quantity > 1 && itemSpecs.partType ? 'Auto-suggested based on part type' : ''}
                  min="1"
                />
                {itemSpecs.quantity > 1 && itemSpecs.partType && <p className="text-xs text-green-600 mt-1">✓ Auto-suggested</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mfr Label</label>
                <input 
                  type="text"
                  value={itemSpecs.mfrLabel}
                  onChange={(e) => handleItemSpecSelection('mfrLabel', e.target.value)}
                  className="w-full p-2 border rounded text-sm"
                  placeholder="Manufacturer label"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea 
                value={itemSpecs.notes}
                onChange={(e) => handleItemSpecSelection('notes', e.target.value)}
                className="w-full p-2 border rounded text-sm"
                rows={3}
                placeholder="Additional application notes"
              />
            </div>
            
            <div className="text-sm text-gray-600">
              <p>Part and application specifications from PCdb</p>
            </div>
          </div>
        );
      
      case 'Validation':
        return (
          <div className="space-y-6">
            {/* Mapping Validation Section */}
            <div className="border rounded-lg p-4">
              <h4 className="text-md font-medium mb-3">Mapping Validation</h4>
              
              {/* Filter Controls */}
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
              
              {/* Action Buttons */}
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={exportToXML}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Export
                </button>
                <button 
                  onClick={() => selectedApplications.forEach(removeApplication)}
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
              
              {/* Mapping Errors */}
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
            
            {/* Enhanced Application Mapping Table */}
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
                      {filteredApplications.map((app: any) => (
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
                            <div className="font-medium">{app.year} {app.make} {app.model}</div>
                            <div className="text-xs text-gray-500">BaseVehicle: {app.baseVehicleId}</div>
                          </td>
                          <td className="p-2">
                            <div className="font-medium">{app.partType || 'No Part Type'}</div>
                            <div className="text-xs text-gray-500">
                              {app.position && `Position: ${app.position}`}
                              {app.quantity && ` | Qty: ${app.quantity}`}
                              {app.mfrLabel && ` | Label: ${app.mfrLabel}`}
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <button className="text-blue-600 hover:text-blue-800 text-xs">Edit</button>
                              <button 
                                onClick={() => removeApplication(app.id)}
                                className="text-red-600 hover:text-red-800 text-xs"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
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
      
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Coming Soon</p>
            <p className="text-sm mt-2">{activeTab} tab functionality will be implemented next.</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Application Mapping Table */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium">Application Mapping ({currentApplications.length})</h4>
          <button 
            onClick={addApplication}
            disabled={!vehicleData.baseVehicleId}
            className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
          >
            Add Application
          </button>
        </div>
        
        {currentApplications.length > 0 ? (
          <div className="space-y-2">
            {currentApplications.map((app: any) => (
              <div key={app.id} className="bg-gray-50 p-3 rounded border flex justify-between items-center">
                <div className="text-sm">
                  <span className="font-medium">{app.year} {app.make} {app.model}</span>
                  {app.group && <span className="ml-2 text-gray-600">Group: {app.group}</span>}
                  {app.region && <span className="ml-2 text-gray-600">Region: {app.region}</span>}
                </div>
                <button 
                  onClick={() => removeApplication(app.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>No applications added yet. Configure vehicle details above and click "Add Application".</p>
          </div>
        )}
      </div>
    </div>
  );
};