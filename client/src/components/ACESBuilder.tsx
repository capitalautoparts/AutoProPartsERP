import React, { useState, useEffect } from 'react';
import { SearchableSelect } from './SearchableSelect';
import { ApplicationMappingTable } from './ApplicationMappingTable';
import { ValidationPanel } from './ValidationPanel';

interface ACESBuilderProps {
  applications?: any[];
  onUpdate?: (applications: any[]) => void;
}

type TabType = 'Vehicle' | 'Engine' | 'Transmission' | 'Drive' | 'Brake' | 'Spring' | 'Steering' | 'Wheel' | 'Bed' | 'Body' | 'MfrBody' | 'Item' | 'Qualifiers' | 'Validation';

export const ACESBuilder: React.FC<ACESBuilderProps> = ({ applications = [], onUpdate }) => {
  const [activeTab, setActiveTab] = useState<TabType>('Vehicle');
  
  const tabs: TabType[] = ['Vehicle', 'Engine', 'Transmission', 'Drive', 'Brake', 'Spring', 'Steering', 'Wheel', 'Bed', 'Body', 'MfrBody', 'Item', 'Qualifiers', 'Validation'];
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
    year: '',
    make: '',
    model: '',
    submodel: '',
    group: '',
    type: '',
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
  const [qdbRefData, setQdbRefData] = useState<any>({});
  
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

  // Smart engine relationship handler with real VCdb data
  const handleEngineSelection = async (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate from real engine data when liter is selected
    if (field === 'liter' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/engine-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const engineSpecs = await response.json();
          if (engineSpecs) {
            updates = {
              ...updates,
              cc: engineSpecs.cc || Math.round(parseFloat(value) * 1000).toString(),
              cid: engineSpecs.cid || Math.round(parseFloat(value) * 61.024).toString(),
              cylinders: engineSpecs.cylinders,
              blockType: engineSpecs.blockType,
              boreInches: engineSpecs.boreInches,
              boreMetric: engineSpecs.boreMetric,
              strokeInches: engineSpecs.strokeInches,
              strokeMetric: engineSpecs.strokeMetric,
              cylinderHeadType: engineSpecs.cylinderHeadType,
              aspiration: engineSpecs.aspiration,
              valvesPerEngine: engineSpecs.valvesPerEngine,
              ignitionSystemType: engineSpecs.ignitionSystemType,
              horsePower: engineSpecs.horsePower,
              kilowattPower: engineSpecs.kilowattPower,
              fuelType: engineSpecs.fuelType,
              engineManufacturer: engineSpecs.engineManufacturer,
              engineVIN: engineSpecs.engineVIN
            };
          }
        }
      } catch (error) {
        console.log('Using fallback engine calculations');
        // Fallback to calculations if API fails
        const literValue = parseFloat(value);
        if (literValue) {
          updates.cc = Math.round(literValue * 1000).toString();
          updates.cid = Math.round(literValue * 61.024).toString();
        }
      }
    }
    
    // Auto-populate CC when liter changes (fallback)
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

  // Smart transmission relationship handler with real VCdb data
  const handleTransmissionSelection = async (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate from actual transmission selection
    if (field === 'transmission' && value && vehicleData.baseVehicleId) {
      const selectedTransmission = components.transmissions.find(t => t.TransmissionID === value);
      if (selectedTransmission) {
        updates = {
          ...updates,
          speeds: selectedTransmission.NumSpeeds,
          control: selectedTransmission.transmissionTypeName,
          type: selectedTransmission.TransmissionTypeID,
          mfrName: selectedTransmission.TransmissionMfrID,
          elecControlled: selectedTransmission.TransmissionElecControlledID
        };
      }
    }
    
    // Auto-populate from type selection
    if (field === 'type' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/transmission-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const transSpecs = await response.json();
          if (transSpecs) {
            updates = {
              ...updates,
              speeds: transSpecs.speeds,
              control: transSpecs.control,
              mfrName: transSpecs.mfrName,
              mfrCode: transSpecs.mfrCode,
              elecControlled: transSpecs.elecControlled
            };
          }
        }
      } catch (error) {
        console.log('Using fallback transmission logic');
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

  // Smart vehicle systems relationship handler with real VCdb data
  const handleVehicleSystemSelection = async (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate from actual brake config selection
    if (field === 'brakeConfig' && value && vehicleData.baseVehicleId) {
      const selectedBrakeConfig = components.brakeConfigs.find(bc => bc.BrakeConfigID === value);
      if (selectedBrakeConfig) {
        updates = {
          ...updates,
          frontBrake: selectedBrakeConfig.FrontBrakeTypeID,
          rearBrake: selectedBrakeConfig.RearBrakeTypeID,
          brakeSystem: selectedBrakeConfig.BrakeSystemID,
          brakeABS: selectedBrakeConfig.BrakeABSID
        };
      }
    }
    
    // Auto-populate brake system from front brake selection
    if (field === 'frontBrake' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/brake-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const brakeSpecs = await response.json();
          if (brakeSpecs) {
            updates = {
              ...updates,
              rearBrake: brakeSpecs.rearBrake,
              brakeSystem: brakeSpecs.brakeSystem,
              brakeABS: brakeSpecs.brakeABS
            };
          }
        }
      } catch (error) {
        console.log('Using fallback brake logic');
      }
    }
    
    // Auto-populate spring relationships
    if (field === 'frontSpring' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/spring-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const springSpecs = await response.json();
          if (springSpecs) {
            updates = {
              ...updates,
              rearSpring: springSpecs.rearSpring
            };
          }
        }
      } catch (error) {
        console.log('Using fallback spring logic');
      }
    }
    
    // Auto-populate steering relationships from real data
    if (field === 'steeringType' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/steering-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const steeringSpecs = await response.json();
          if (steeringSpecs) {
            updates = {
              ...updates,
              steeringSystem: steeringSpecs.steeringSystem
            };
          }
        }
      } catch (error) {
        console.log('Using fallback steering logic');
      }
    }
    
    // Auto-populate drive type relationships
    if (field === 'driveType' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/drive-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const driveSpecs = await response.json();
          if (driveSpecs) {
            // Drive type is standalone, no additional fields to populate
          }
        }
      } catch (error) {
        console.log('Using fallback drive logic');
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

  // Smart physical specs relationship handler with real VCdb data
  const handlePhysicalSpecSelection = async (field: string, value: string) => {
    let updates: any = { [field]: value };
    
    // Auto-populate from actual body config selection
    if (field === 'bodyConfig' && value && vehicleData.baseVehicleId) {
      const selectedBodyConfig = components.bodyConfigs.find(bc => bc.BodyTypeID === value);
      if (selectedBodyConfig) {
        updates = {
          ...updates,
          bodyType: selectedBodyConfig.BodyTypeID,
          numDoors: selectedBodyConfig.BodyNumDoorsID
        };
      }
    }
    
    // Auto-populate body specs from body type selection
    if (field === 'bodyType' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/body-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const bodySpecs = await response.json();
          if (bodySpecs) {
            updates = {
              ...updates,
              numDoors: bodySpecs.numDoors
            };
          }
        }
      } catch (error) {
        console.log('Using fallback body logic');
      }
    }
    
    // Auto-populate wheelbase from BaseVehicle selection
    if (field === 'loadWheelbase' && vehicleData.baseVehicleId) {
      if (physicalSpecsRefData.wheelbases && physicalSpecsRefData.wheelbases.length > 0) {
        const wheelbase = physicalSpecsRefData.wheelbases[0]; // Use first available wheelbase
        updates = {
          ...updates,
          wheelbaseInches: wheelbase.WheelBase,
          wheelbaseMetric: wheelbase.WheelBaseMetric
        };
      }
    }
    
    // Auto-populate wheelbase conversions from real data
    if ((field === 'wheelbaseInches' || field === 'wheelbaseMetric') && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/wheelbase-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const wheelbaseSpecs = await response.json();
          if (wheelbaseSpecs) {
            updates = {
              ...updates,
              wheelbaseInches: wheelbaseSpecs.wheelbaseInches,
              wheelbaseMetric: wheelbaseSpecs.wheelbaseMetric
            };
          }
        }
      } catch (error) {
        console.log('Using fallback wheelbase conversion');
        if (field === 'wheelbaseInches' && value) {
          const inches = parseFloat(value);
          if (inches) updates.wheelbaseMetric = Math.round(inches * 25.4).toString();
        }
        if (field === 'wheelbaseMetric' && value) {
          const mm = parseFloat(value);
          if (mm) updates.wheelbaseInches = (mm / 25.4).toFixed(1);
        }
      }
    }
    
    // Auto-populate bed specs from BaseVehicle (truck only)
    if (field === 'loadBedSpecs' && vehicleData.baseVehicleId && physicalSpecsRefData.isTruck) {
      if (physicalSpecsRefData.bedTypes && physicalSpecsRefData.bedTypes.length > 0) {
        const bedType = physicalSpecsRefData.bedTypes[0];
        const bedLength = physicalSpecsRefData.bedLengths && physicalSpecsRefData.bedLengths[0];
        updates = {
          ...updates,
          bedType: bedType.BedTypeID,
          bedLengthInches: bedLength?.BedLength,
          bedLengthMetric: bedLength?.BedLengthMetric
        };
      }
    }
    
    // Auto-populate bed specs from bed type selection
    if (field === 'bedType' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/bed-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const bedSpecs = await response.json();
          if (bedSpecs) {
            updates = {
              ...updates,
              bedLengthInches: bedSpecs.bedLengthInches,
              bedLengthMetric: bedSpecs.bedLengthMetric
            };
          }
        }
      } catch (error) {
        console.log('Using fallback bed logic');
      }
    }
    
    // Auto-populate manufacturer body code specs
    if (field === 'mfrBodyCode' && value && vehicleData.baseVehicleId) {
      try {
        const response = await fetch(`/api/aces-corrected/mfrbody-specs/${vehicleData.baseVehicleId}/${value}`);
        if (response.ok) {
          const mfrBodySpecs = await response.json();
          if (mfrBodySpecs) {
            // Manufacturer body code is standalone, name is already in dropdown
          }
        }
      } catch (error) {
        console.log('Using fallback manufacturer body logic');
      }
    }
    
    // Fallback bed length conversions
    if (field === 'bedLengthInches' && value && !updates.bedLengthMetric) {
      const inches = parseFloat(value);
      if (inches) updates.bedLengthMetric = Math.round(inches * 25.4).toString();
    }
    
    if (field === 'bedLengthMetric' && value && !updates.bedLengthInches) {
      const mm = parseFloat(value);
      if (mm) updates.bedLengthInches = (mm / 25.4).toFixed(1);
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

  // Cascading options for Item tab (derived from server, not local inference)
  const [availableSubCategories, setAvailableSubCategories] = useState<any[]>([]);
  const [availablePositions, setAvailablePositions] = useState<any[]>([]);
  
  // Qualifier specifications
  const [qualifierSpecs, setQualifierSpecs] = useState({
    qualifiers: [] as Array<{ qualifierId: string, qualifierValue: string }>
  });

  // Get filtered options for cascading dropdowns
  const getFilteredSubCategories = () => {
    // Use server-provided mapping via CodeMaster
    if (availableSubCategories.length > 0) return availableSubCategories;
    return [];
  };
  
  const getFilteredPartTypes = () => {
    if (!pcdbRefData.partTypes) return [];
    if (!itemSpecs.subCategory) return pcdbRefData.partTypes;
    return pcdbRefData.partTypes.filter((pt: any) => pt.SubCategoryID === itemSpecs.subCategory);
  };
  
  // Smart item specs relationship handler with real PCdb data
  const handleItemSpecSelection = async (field: string, value: string) => {
    console.log('handleItemSpecSelection called:', { field, value });
    console.log('Current itemSpecs:', itemSpecs);
    console.log('pcdbRefData.partTypes:', pcdbRefData.partTypes);
    
    let updates: any = { [field]: value };
    
    // Clear dependent fields when parent changes
    if (field === 'category') {
      updates.subCategory = '';
      updates.partType = '';
      updates.position = '';
      setAvailablePositions([]);
      // Load subcategories for selected category from server
      try {
        if (value) {
          const res = await fetch(`/api/aces-corrected/pcdb/subcategories?categoryId=${encodeURIComponent(value)}`);
          const subs = res.ok ? await res.json() : [];
          setAvailableSubCategories(subs);
        } else {
          setAvailableSubCategories([]);
        }
      } catch (e) {
        setAvailableSubCategories([]);
      }
    } else if (field === 'subCategory') {
      updates.partType = '';
      updates.position = '';
      setAvailablePositions([]);
    }
    
    // Auto-populate parent fields when child is selected
    if (field === 'partType' && value && pcdbRefData.partTypes) {
      const selectedPartType = pcdbRefData.partTypes.find((pt: any) => pt.PartTerminologyID === value);
      console.log('Found selectedPartType:', selectedPartType);
      
      if (selectedPartType) {
        // Resolve using server to ensure accuracy and positions
        try {
          const res = await fetch(`/api/aces-corrected/pcdb/resolve-from-part/${encodeURIComponent(value)}`);
          if (res.ok) {
            const resolved = await res.json();
            if (resolved?.category?.CategoryID) {
              updates.category = resolved.category.CategoryID;
              // Load subcategories for that category to populate dropdown
              try {
                const subRes = await fetch(`/api/aces-corrected/pcdb/subcategories?categoryId=${encodeURIComponent(resolved.category.CategoryID)}`);
                const subs = subRes.ok ? await subRes.json() : [];
                setAvailableSubCategories(subs);
              } catch {}
            }
            if (resolved?.subCategory?.SubCategoryID) updates.subCategory = resolved.subCategory.SubCategoryID;
            // Load precise positions filtered by part/category/subcategory
            try {
              const qs = new URLSearchParams({
                partTerminologyId: value,
                ...(resolved?.category?.CategoryID ? { categoryId: resolved.category.CategoryID } : {}),
                ...(resolved?.subCategory?.SubCategoryID ? { subCategoryId: resolved.subCategory.SubCategoryID } : {})
              });
              const posRes = await fetch(`/api/aces-corrected/pcdb/positions?${qs.toString()}`);
              const pos = posRes.ok ? await posRes.json() : [];
              setAvailablePositions(pos);
              if (pos.length === 1) {
                updates.position = pos[0].PositionID;
              }
            } catch {
              if (Array.isArray(resolved?.positions)) {
                setAvailablePositions(resolved.positions);
                if (resolved.positions.length === 1) {
                  updates.position = resolved.positions[0].PositionID;
                }
              }
            }
          }
        } catch (e) {
          // Fallback to embedded relationships if resolve call fails
          if (selectedPartType.SubCategoryID) updates.subCategory = selectedPartType.SubCategoryID;
          if (selectedPartType.CategoryID) updates.category = selectedPartType.CategoryID;
          if (selectedPartType.PositionID) updates.position = selectedPartType.PositionID;
        }

        // Auto-populate mfr label
        updates.mfrLabel = selectedPartType.PartTerminologyName;
        
        // Auto-suggest quantity based on part type
        const partName = selectedPartType.PartTerminologyName?.toLowerCase() || '';
        if (partName.includes('brake pad')) {
          updates.quantity = 4;
        } else if (partName.includes('spark plug')) {
          updates.quantity = 4;
        }
      }
    }
    
    console.log('Final updates:', updates);
    setItemSpecs(prev => ({ ...prev, ...updates }));
  };
  

  
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
      fetch('/api/aces-corrected/pcdb-reference').then(r => r.json()),
      fetch('/api/aces-corrected/part-types').then(r => r.json()),
      fetch('/api/aces-corrected/positions').then(r => r.json()),
      fetch('/api/databases/qdb').then(r => r.json())
    ]).then(([years, makes, models, baseVehicles, groups, types, regions, classes, pcdb, partTypes, positions, qdb]) => {
      setAllYears(years);
      setAllMakes(makes);
      setAllModels(models);
      setAllBaseVehicles(baseVehicles.data);
      setVehicleGroups(groups);
      setVehicleTypes(types);
      setRegions(regions);
      setVehicleClasses(classes);
      setPcdbRefData({
        ...pcdb,
        partTypes,
        positions
      });
      setQdbRefData(qdb);
    }).catch(error => {
      console.error('Failed to load reference data:', error);
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
      make: vehicleData.make,
      model: vehicleData.model,
      submodel: vehicleData.submodel,
      
      // Engine specifications
      liter: engineFilters.liter,
      cc: engineFilters.cc,
      cid: engineFilters.cid,
      cylinders: engineFilters.cylinders,
      blockType: engineFilters.blockType,
      aspiration: engineFilters.aspiration,
      horsePower: engineFilters.horsePower,
      engineManufacturer: engineFilters.engineManufacturer,
      engineVIN: engineFilters.engineVIN,
      
      // Transmission specifications
      transmissionControl: transmissionFilters.control,
      transmissionSpeeds: transmissionFilters.speeds,
      transmissionType: transmissionFilters.type,
      transmissionMfr: transmissionFilters.mfrName,
      
      // Vehicle systems
      driveType: vehicleSystemsFilters.driveType,
      frontBrake: vehicleSystemsFilters.frontBrake,
      rearBrake: vehicleSystemsFilters.rearBrake,
      brakeSystem: vehicleSystemsFilters.brakeSystem,
      brakeABS: vehicleSystemsFilters.brakeABS,
      frontSpring: vehicleSystemsFilters.frontSpring,
      rearSpring: vehicleSystemsFilters.rearSpring,
      steeringType: vehicleSystemsFilters.steeringType,
      steeringSystem: vehicleSystemsFilters.steeringSystem,
      
      // Physical specifications
      wheelbaseInches: physicalSpecsFilters.wheelbaseInches,
      wheelbaseMetric: physicalSpecsFilters.wheelbaseMetric,
      bedType: physicalSpecsFilters.bedType,
      bedLengthInches: physicalSpecsFilters.bedLengthInches,
      bedLengthMetric: physicalSpecsFilters.bedLengthMetric,
      bodyType: physicalSpecsFilters.bodyType,
      numDoors: physicalSpecsFilters.numDoors,
      mfrBodyCode: physicalSpecsFilters.mfrBodyCode,
      
      // Item specifications
      category: itemSpecs.category,
      subCategory: itemSpecs.subCategory,
      partType: itemSpecs.partType,
      position: itemSpecs.position,
      quantity: itemSpecs.quantity,
      mfrLabel: itemSpecs.mfrLabel,
      notes: itemSpecs.notes,
      
      // Qualifiers
      qualifiers: qualifierSpecs.qualifiers,
      
      // Component selections
      engineConfig: selectedComponents.engineConfig,
      transmission: selectedComponents.transmission,
      brakeConfig: selectedComponents.brakeConfig,
      subModel: selectedComponents.subModel
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
    setQualifierSpecs({
      qualifiers: []
    });
  };
  
  const removeApplication = (id: string) => {
    const updatedApps = currentApplications.filter(app => app.id !== id);
    setCurrentApplications(updatedApps);
    onUpdate?.(updatedApps);
  };
  
  const editApplication = (id: string) => {
    const app = currentApplications.find(a => a.id === id);
    if (!app) return;
    
    // Populate all form fields with application data
    setVehicleData({
      group: app.group || '',
      type: app.type || '',
      make: app.make || '',
      model: app.model || '',
      year: app.year || '',
      submodel: app.submodel || '',
      region: app.region || '',
      class: app.class || '',
      baseVehicleId: app.baseVehicleId || ''
    });
    
    setEngineFilters({
      liter: app.liter || '',
      cc: app.cc || '',
      cid: app.cid || '',
      cylinders: app.cylinders || '',
      blockType: app.blockType || '',
      boreInches: app.boreInches || '',
      boreMetric: app.boreMetric || '',
      strokeInches: app.strokeInches || '',
      strokeMetric: app.strokeMetric || '',
      cylinderHeadType: app.cylinderHeadType || '',
      valvesPerEngine: app.valvesPerEngine || '',
      aspiration: app.aspiration || '',
      ignitionSystemType: app.ignitionSystemType || '',
      horsePower: app.horsePower || '',
      kilowattPower: app.kilowattPower || '',
      fuelType: app.fuelType || '',
      engineManufacturer: app.engineManufacturer || '',
      engineVIN: app.engineVIN || '',
      engineVersion: app.engineVersion || ''
    });
    
    setTransmissionFilters({
      speeds: app.transmissionSpeeds || '',
      control: app.transmissionControl || '',
      type: app.transmissionType || '',
      mfrName: app.transmissionMfr || '',
      mfrCode: app.mfrCode || '',
      elecControlled: app.elecControlled || ''
    });
    
    setVehicleSystemsFilters({
      driveType: app.driveType || '',
      frontBrake: app.frontBrake || '',
      rearBrake: app.rearBrake || '',
      brakeSystem: app.brakeSystem || '',
      brakeABS: app.brakeABS || '',
      frontSpring: app.frontSpring || '',
      rearSpring: app.rearSpring || '',
      steeringType: app.steeringType || '',
      steeringSystem: app.steeringSystem || ''
    });
    
    setPhysicalSpecsFilters({
      wheelbaseInches: app.wheelbaseInches || '',
      wheelbaseMetric: app.wheelbaseMetric || '',
      bedType: app.bedType || '',
      bedLengthInches: app.bedLengthInches || '',
      bedLengthMetric: app.bedLengthMetric || '',
      bodyType: app.bodyType || '',
      numDoors: app.numDoors || '',
      mfrBodyCode: app.mfrBodyCode || ''
    });
    
    setItemSpecs({
      category: app.category || '',
      subCategory: app.subCategory || '',
      partType: app.partType || '',
      position: app.position || '',
      quantity: app.quantity || 1,
      mfrLabel: app.mfrLabel || '',
      notes: app.notes || ''
    });
    
    setQualifierSpecs({
      qualifiers: app.qualifiers || []
    });
    
    setSelectedComponents({
      engineConfig: app.engineConfig || '',
      transmission: app.transmission || '',
      brakeConfig: app.brakeConfig || '',
      driveType: app.driveType || '',
      subModel: app.subModel || ''
    });
    
    // Remove the application being edited
    removeApplication(id);
    
    // Switch to Vehicle tab for editing
    setActiveTab('Vehicle');
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
  


  const renderTabContent = () => {
    switch (activeTab) {
      case 'Vehicle':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Year</label>
                <SearchableSelect
                  options={allYears.map(year => ({ value: year.YearID, label: year.YearID }))}
                  value={vehicleData.year}
                  onChange={(value) => setVehicleData({...vehicleData, year: value})}
                  placeholder="Select Year"
                />
                <p className="text-xs text-gray-500">{allYears.length} available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Make</label>
                <SearchableSelect
                  options={availableMakes.map(make => ({ value: make.MakeID, label: make.MakeName }))}
                  value={vehicleData.make}
                  onChange={(value) => setVehicleData({...vehicleData, make: value})}
                  placeholder="Select Make"
                  disabled={!vehicleData.year}
                />
                <p className="text-xs text-gray-500">{availableMakes.length} available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Model</label>
                <SearchableSelect
                  options={availableModels.map(model => ({ value: model.ModelID, label: model.ModelName }))}
                  value={vehicleData.model}
                  onChange={(value) => setVehicleData({...vehicleData, model: value})}
                  placeholder="Select Model"
                  disabled={!vehicleData.make}
                />
                <p className="text-xs text-gray-500">{availableModels.length} available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Submodel</label>
                <SearchableSelect
                  options={components.subModels.map(sub => ({ value: sub.SubModelID, label: sub.displayName }))}
                  value={vehicleData.submodel}
                  onChange={(value) => {
                    setVehicleData({...vehicleData, submodel: value});
                    
                    // Auto-select BaseVehicle if submodel helps narrow it down
                    if (value && availableBaseVehicles.length > 1) {
                      const matchingBV = availableBaseVehicles.find(bv => {
                        const vehicles = components.subModels.filter(sm => sm.SubModelID === value);
                        return vehicles.some(v => v.BaseVehicleID === bv.BaseVehicleID);
                      });
                      if (matchingBV) {
                        setVehicleData(prev => ({...prev, baseVehicleId: matchingBV.BaseVehicleID}));
                      }
                    }
                  }}
                  placeholder="Select Submodel"
                  disabled={!vehicleData.baseVehicleId && availableBaseVehicles.length <= 1}
                />
              </div>
            </div>

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
                    <SearchableSelect
                      options={engineRefData.liters?.map((liter: string) => ({ value: liter, label: `${liter}L` })) || []}
                      value={engineFilters.liter}
                      onChange={(value) => handleEngineSelection('liter', value)}
                      placeholder="Any Liter"
                    />
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
                      className={`w-full p-2 border rounded text-sm ${engineFilters.strokeInches && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.strokeInches && engineFilters.liter ? 'Auto-populated from VCdb EngineBase' : ''}
                    >
                      <option value="">Any Stroke (in)</option>
                      {engineRefData.strokeInches?.map((stroke: string) => (
                        <option key={stroke} value={stroke}>{stroke}"</option>
                      ))}
                    </select>
                    {engineFilters.strokeInches && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
                  </div>
                </div>
                
                {/* Advanced Engine Properties */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Cylinder Head Type</label>
                    <select 
                      value={engineFilters.cylinderHeadType}
                      onChange={(e) => handleEngineSelection('cylinderHeadType', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.cylinderHeadType && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.cylinderHeadType && engineFilters.liter ? 'Auto-populated from VCdb EngineConfig' : ''}
                    >
                      <option value="">Any Head Type</option>
                      {engineRefData.cylinderHeadTypes?.map((cht: any) => (
                        <option key={cht.CylinderHeadTypeID} value={cht.CylinderHeadTypeID}>{cht.CylinderHeadTypeName}</option>
                      ))}
                    </select>
                    {engineFilters.cylinderHeadType && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Aspiration</label>
                    <SearchableSelect
                      options={engineRefData.aspirations?.map((asp: any) => ({ value: asp.AspirationID, label: asp.AspirationName })) || []}
                      value={engineFilters.aspiration}
                      onChange={(value) => handleEngineSelection('aspiration', value)}
                      placeholder="Any Aspiration"
                      className={engineFilters.aspiration && engineFilters.liter ? 'bg-green-50' : ''}
                    />
                    {engineFilters.aspiration && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Valves Per Engine</label>
                    <select 
                      value={engineFilters.valvesPerEngine}
                      onChange={(e) => handleEngineSelection('valvesPerEngine', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.valvesPerEngine && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.valvesPerEngine && engineFilters.liter ? 'Auto-populated from VCdb EngineConfig' : ''}
                    >
                      <option value="">Any Valves</option>
                      {engineRefData.valves?.map((valve: any) => (
                        <option key={valve.ValvesID} value={valve.ValvesID}>{valve.ValvesPerEngine} Valves</option>
                      ))}
                    </select>
                    {engineFilters.valvesPerEngine && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
                  </div>
                </div>
                
                {/* Power and Fuel */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Horse Power</label>
                    <select 
                      value={engineFilters.horsePower}
                      onChange={(e) => handleEngineSelection('horsePower', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.horsePower && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.horsePower && engineFilters.liter ? 'Auto-populated from VCdb PowerOutput' : ''}
                    >
                      <option value="">Any HP</option>
                      {engineRefData.powerOutputs?.map((po: any) => (
                        <option key={po.PowerOutputID} value={po.PowerOutputID}>{po.HorsePower} HP</option>
                      ))}
                    </select>
                    {engineFilters.horsePower && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Engine Manufacturer</label>
                    <select 
                      value={engineFilters.engineManufacturer}
                      onChange={(e) => handleEngineSelection('engineManufacturer', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.engineManufacturer && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.engineManufacturer && engineFilters.liter ? 'Auto-populated from VCdb Mfr' : ''}
                    >
                      <option value="">Any Manufacturer</option>
                      {engineRefData.manufacturers?.map((mfr: any) => (
                        <option key={mfr.MfrID} value={mfr.MfrID}>{mfr.MfrName}</option>
                      ))}
                    </select>
                    {engineFilters.engineManufacturer && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Engine VIN</label>
                    <select 
                      value={engineFilters.engineVIN}
                      onChange={(e) => handleEngineSelection('engineVIN', e.target.value)}
                      className={`w-full p-2 border rounded text-sm ${engineFilters.engineVIN && engineFilters.liter ? 'bg-green-50' : ''}`}
                      title={engineFilters.engineVIN && engineFilters.liter ? 'Auto-populated from VCdb EngineVIN' : ''}
                    >
                      <option value="">Any VIN</option>
                      {engineRefData.engineVINs?.map((evin: any) => (
                        <option key={evin.EngineVINID} value={evin.EngineVINID}>{evin.EngineVINName}</option>
                      ))}
                    </select>
                    {engineFilters.engineVIN && engineFilters.liter && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
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
                {/* Transmission Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Transmission</label>
                  <select 
                    value={selectedComponents.transmission}
                    onChange={(e) => {
                      setSelectedComponents({...selectedComponents, transmission: e.target.value});
                      handleTransmissionSelection('transmission', e.target.value);
                    }}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Select Transmission</option>
                    {components.transmissions.map(trans => (
                      <option key={trans.TransmissionID} value={trans.TransmissionID}>
                        {trans.displayName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{components.transmissions.length} available</p>
                </div>
                
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
                {/* Brake Configuration Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Brake Configuration</label>
                  <select 
                    value={selectedComponents.brakeConfig}
                    onChange={(e) => {
                      setSelectedComponents({...selectedComponents, brakeConfig: e.target.value});
                      handleVehicleSystemSelection('brakeConfig', e.target.value);
                    }}
                    className="w-full p-2 border rounded text-sm"
                  >
                    <option value="">Select Brake Configuration</option>
                    {components.brakeConfigs.map(brake => (
                      <option key={brake.BrakeConfigID} value={brake.BrakeConfigID}>
                        {brake.displayName}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">{components.brakeConfigs.length} available</p>
                </div>
                
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
                {/* Auto-load Wheelbase Button */}
                <div className="mb-4">
                  <button
                    onClick={() => handlePhysicalSpecSelection('loadWheelbase', 'true')}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                    disabled={!vehicleData.baseVehicleId}
                  >
                    Load Wheelbase Data
                  </button>
                  <p className="text-xs text-gray-500 mt-1">Auto-populate wheelbase from BaseVehicle</p>
                </div>
                
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
                  {/* Auto-load Bed Specs Button */}
                  <div className="mb-4">
                    <button
                      onClick={() => handlePhysicalSpecSelection('loadBedSpecs', 'true')}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      disabled={!vehicleData.baseVehicleId}
                    >
                      Load Bed Specifications
                    </button>
                    <p className="text-xs text-gray-500 mt-1">Auto-populate bed specs from BaseVehicle</p>
                  </div>
                  
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
                <SearchableSelect
                  options={pcdbRefData.categories?.map((cat: any) => ({ 
                    value: cat.CategoryID, 
                    label: cat.CategoryName 
                  })) || []}
                  value={itemSpecs.category}
                  onChange={(value) => handleItemSpecSelection('category', value)}
                  placeholder="Select Category"
                />
                <p className="text-xs text-gray-500 mt-1">{pcdbRefData.categories?.length || 0} categories available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sub Category</label>
                <SearchableSelect
                  options={getFilteredSubCategories().map((sub: any) => ({ 
                    value: sub.SubCategoryID, 
                    label: sub.SubCategoryName 
                  }))}
                  value={itemSpecs.subCategory}
                  onChange={(value) => handleItemSpecSelection('subCategory', value)}
                  placeholder="Select Sub Category"

                />
                <p className="text-xs text-gray-500 mt-1">{getFilteredSubCategories().length} subcategories available</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Part Type</label>
                <SearchableSelect
                  options={getFilteredPartTypes().map((pt: any) => ({ 
                    value: pt.PartTerminologyID, 
                    label: pt.PartTerminologyName 
                  }))}
                  value={itemSpecs.partType}
                  onChange={(value) => {
                    console.log('Part Type onChange called with value:', value);
                    handleItemSpecSelection('partType', value);
                  }}
                  placeholder="Select Part Type"

                />
                <p className="text-xs text-gray-500 mt-1">{getFilteredPartTypes().length} part types available</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Position</label>
                <SearchableSelect
                  options={availablePositions.map((pos: any) => ({ value: pos.PositionID, label: pos.Position }))}
                  value={itemSpecs.position}
                  onChange={(value) => handleItemSpecSelection('position', value)}
                  placeholder="Select Position"
                  className={itemSpecs.position && itemSpecs.partType ? 'bg-green-50' : ''}
                />
                {itemSpecs.position && itemSpecs.partType && <p className="text-xs text-green-600 mt-1">✓ Auto-suggested</p>}
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
                  className={`w-full p-2 border rounded text-sm ${itemSpecs.mfrLabel && itemSpecs.partType ? 'bg-green-50' : ''}`}
                  title={itemSpecs.mfrLabel && itemSpecs.partType ? 'Auto-populated from part type' : ''}
                  placeholder="Manufacturer label"
                />
                {itemSpecs.mfrLabel && itemSpecs.partType && <p className="text-xs text-green-600 mt-1">✓ Auto-populated</p>}
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
      
      case 'Qualifiers':
        return (
          <div className="space-y-4">
            {vehicleData.baseVehicleId ? (
              <>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Application Qualifiers (Qdb)</h4>
                  <p className="text-xs text-blue-700">Add qualifiers to further specify application conditions and exceptions</p>
                </div>
                
                <div className="border border-gray-200 rounded p-4">
                  <h5 className="text-sm font-medium mb-3">Add Qualifier</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Qualifier Type</label>
                      <SearchableSelect
                        options={qdbRefData.tables?.find((t: any) => t.name.includes('Qualifier'))?.data?.map((q: any) => ({ 
                          value: q.QualifierID || q.id, 
                          label: q.QualifierName || q.name || q.Description 
                        })) || []}
                        value=""
                        onChange={(value) => {
                          const newQualifier = { qualifierId: value, qualifierValue: '' };
                          setQualifierSpecs(prev => ({
                            qualifiers: [...prev.qualifiers, newQualifier]
                          }));
                        }}
                        placeholder="Select Qualifier Type"
                      />
                    </div>
                    <div className="flex items-end">
                      <p className="text-xs text-gray-500">{qdbRefData.tables?.length || 0} Qdb tables loaded</p>
                    </div>
                  </div>
                </div>
                
                {qualifierSpecs.qualifiers.length > 0 && (
                  <div className="border border-gray-200 rounded p-4">
                    <h5 className="text-sm font-medium mb-3">Current Qualifiers ({qualifierSpecs.qualifiers.length})</h5>
                    <div className="space-y-3">
                      {qualifierSpecs.qualifiers.map((qualifier, index) => {
                        const qualifierType = qdbRefData.tables?.find((t: any) => t.name.includes('Qualifier'))?.data?.find((q: any) => 
                          (q.QualifierID || q.id) === qualifier.qualifierId
                        );
                        
                        return (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {qualifierType?.QualifierName || qualifierType?.name || 'Unknown Qualifier'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <input
                                type="text"
                                value={qualifier.qualifierValue}
                                onChange={(e) => {
                                  const updatedQualifiers = [...qualifierSpecs.qualifiers];
                                  updatedQualifiers[index].qualifierValue = e.target.value;
                                  setQualifierSpecs({ qualifiers: updatedQualifiers });
                                }}
                                placeholder="Qualifier value"
                                className="w-full p-2 border rounded text-sm"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const updatedQualifiers = qualifierSpecs.qualifiers.filter((_, i) => i !== index);
                                setQualifierSpecs({ qualifiers: updatedQualifiers });
                              }}
                              className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50"
                            >
                              Remove
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                <div className="text-sm text-gray-600">
                  <p>Qualifiers provide additional application specificity beyond basic vehicle fitment</p>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select a BaseVehicle in the Vehicle tab to add qualifiers.</p>
              </div>
            )}
          </div>
        );
      
      case 'Validation':
        return (
          <ValidationPanel
            applications={currentApplications}
            allMakes={allMakes}
            allModels={allModels}
            allBaseVehicles={allBaseVehicles}
            pcdbRefData={pcdbRefData}
            onEdit={editApplication}
            onRemove={removeApplication}
            onExport={exportToXML}
          />
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
        
        <ApplicationMappingTable
          applications={currentApplications}
          allMakes={allMakes}
          allModels={allModels}
          components={components}
          vehicleSystemsRefData={vehicleSystemsRefData}
          transmissionRefData={transmissionRefData}
          physicalSpecsRefData={physicalSpecsRefData}
          pcdbRefData={pcdbRefData}
          engineFilters={engineFilters}
          transmissionFilters={transmissionFilters}
          vehicleSystemsFilters={vehicleSystemsFilters}
          physicalSpecsFilters={physicalSpecsFilters}
          onEdit={editApplication}
          onRemove={removeApplication}
        />
      </div>
    </div>
  );
};
