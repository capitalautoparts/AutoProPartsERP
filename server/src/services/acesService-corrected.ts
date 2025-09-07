import { extractedDatabaseService } from './extractedDatabaseService.js';

export class ACESServiceCorrected {
  
  /**
   * Get years from VCdb - CORRECTED
   */
  async getYears(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_Year');
  }

  /**
   * Get makes - CORRECTED to not filter by year (BaseVehicle handles this)
   */
  async getMakes(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_Make');
  }

  /**
   * Get models - CORRECTED to not filter by year/make (BaseVehicle handles this)
   */
  async getModels(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_Model');
  }

  /**
   * Get BaseVehicles - CRITICAL for ACES validation
   */
  async getBaseVehicles(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_BaseVehicle');
  }

  /**
   * Get valid BaseVehicles by Year/Make/Model - CORRECTED
   */
  async getBaseVehiclesByYMM(yearId: number, makeId: number, modelId: number): Promise<any[]> {
    const baseVehicles = await this.getBaseVehicles();
    return baseVehicles.filter(bv => 
      bv.YearID === yearId.toString() && 
      bv.MakeID === makeId.toString() && 
      bv.ModelID === modelId.toString()
    );
  }

  /**
   * Get vehicles by BaseVehicle ID - CORRECTED
   */
  async getVehiclesByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = extractedDatabaseService.getTableData('VCdb', '20231026_Vehicle');
    return vehicles.filter(v => v.BaseVehicleID === baseVehicleId.toString());
  }

  /**
   * Get SubModels for BaseVehicle - CORRECTED with descriptive names
   */
  async getSubModelsByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const subModelIds = [...new Set(vehicles.map(v => v.SubmodelID).filter(id => id))];
    
    const subModels = extractedDatabaseService.getTableData('VCdb', '20231026_SubModel');
    return subModels.filter(sm => subModelIds.includes(sm.SubModelID))
      .map(sm => ({
        ...sm,
        displayName: sm.SubModelName || `SubModel ${sm.SubModelID}`
      }));
  }

  /**
   * Get Engine Configs for BaseVehicle - CORRECTED with descriptive names
   */
  async getEngineConfigsByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToEngine = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToEngineConfig');
    const engineLinks = vehicleToEngine.filter(ve => vehicleIds.includes(ve.VehicleID));
    const engineConfigIds = [...new Set(engineLinks.map(ec => ec.EngineConfigID))];
    
    const engineConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_EngineConfig');
    const engineBases = extractedDatabaseService.getTableData('VCdb', '20231026_EngineBase');
    const fuelTypes = extractedDatabaseService.getTableData('VCdb', '20231026_FuelType');
    
    return engineConfigs.filter(ec => engineConfigIds.includes(ec.EngineConfigID))
      .map(ec => {
        const engineBase = engineBases.find(eb => eb.EngineBaseID === ec.EngineBaseID);
        const fuelType = fuelTypes.find(ft => ft.FuelTypeID === ec.FuelTypeID);
        return {
          ...ec,
          engineBaseName: engineBase ? `${engineBase.CylinderHeadTypeID || 'V'}${engineBase.NumCylinders || '?'} ${engineBase.Liter || '?'}L` : `Engine ${ec.EngineBaseID}`,
          fuelTypeName: fuelType?.FuelTypeName || `Fuel ${ec.FuelTypeID}`,
          displayName: `${engineBase ? `${engineBase.CylinderHeadTypeID || 'V'}${engineBase.NumCylinders || '?'} ${engineBase.Liter || '?'}L` : `Engine ${ec.EngineBaseID}`} ${fuelType?.FuelTypeName || 'Unknown Fuel'}`
        };
      });
  }

  /**
   * Get Engine Bases for BaseVehicle - CORRECTED
   */
  async getEngineBasesByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const engineConfigs = await this.getEngineConfigsByBaseVehicle(baseVehicleId);
    const engineBaseIds = [...new Set(engineConfigs.map(ec => ec.EngineBaseID))];
    
    const engineBases = extractedDatabaseService.getTableData('VCdb', '20231026_EngineBase');
    return engineBases.filter(eb => engineBaseIds.includes(eb.EngineBaseID));
  }

  /**
   * Get Transmissions for BaseVehicle - CORRECTED with descriptive names
   */
  async getTransmissionsByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToTrans = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToTransmission');
    const transLinks = vehicleToTrans.filter(vt => vehicleIds.includes(vt.VehicleID));
    const transIds = [...new Set(transLinks.map(tl => tl.TransmissionID))];
    
    const transmissions = extractedDatabaseService.getTableData('VCdb', '20231026_Transmission');
    const transTypes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionType');
    
    return transmissions.filter(t => transIds.includes(t.TransmissionID))
      .map(t => {
        const transType = transTypes.find(tt => tt.TransmissionTypeID === t.TransmissionTypeID);
        return {
          ...t,
          transmissionTypeName: transType?.TransmissionTypeName || 'Unknown Type',
          displayName: `${t.NumSpeeds || '?'}-Speed ${transType?.TransmissionTypeName || 'Unknown'}`
        };
      });
  }

  /**
   * Get Brake Configs for BaseVehicle - CORRECTED with descriptive names
   */
  async getBrakeConfigsByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToBrake = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBrakeConfig');
    const brakeLinks = vehicleToBrake.filter(vb => vehicleIds.includes(vb.VehicleID));
    const brakeConfigIds = [...new Set(brakeLinks.map(bl => bl.BrakeConfigID))];
    
    const brakeConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeConfig');
    const brakeTypes = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeType');
    
    return brakeConfigs.filter(bc => brakeConfigIds.includes(bc.BrakeConfigID))
      .map(bc => {
        const frontBrakeType = brakeTypes.find(bt => bt.BrakeTypeID === bc.FrontBrakeTypeID);
        const rearBrakeType = brakeTypes.find(bt => bt.BrakeTypeID === bc.RearBrakeTypeID);
        return {
          ...bc,
          frontBrakeTypeName: frontBrakeType?.BrakeTypeName || 'Unknown',
          rearBrakeTypeName: rearBrakeType?.BrakeTypeName || 'Unknown',
          displayName: `Front: ${frontBrakeType?.BrakeTypeName || 'Unknown'} / Rear: ${rearBrakeType?.BrakeTypeName || 'Unknown'}`
        };
      });
  }

  /**
   * Get Body Configs for BaseVehicle - CORRECTED
   */
  async getBodyConfigsByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToBody = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBodyConfig');
    const bodyLinks = vehicleToBody.filter(vb => vehicleIds.includes(vb.VehicleID));
    const bodyConfigIds = [...new Set(bodyLinks.map(bl => bl.BodyConfigID))];
    
    const bodyConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BodyType');
    return bodyConfigs.filter(bc => bodyConfigIds.includes(bc.BodyTypeID));
  }

  /**
   * Get Drive Types for BaseVehicle - CORRECTED with descriptive names
   */
  async getDriveTypesByBaseVehicle(baseVehicleId: number): Promise<any[]> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToDrive = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToDriveType');
    const driveLinks = vehicleToDrive.filter(vd => vehicleIds.includes(vd.VehicleID));
    const driveTypeIds = [...new Set(driveLinks.map(dl => dl.DriveTypeID))];
    
    const driveTypes = extractedDatabaseService.getTableData('VCdb', '20231026_DriveType');
    return driveTypes.filter(dt => driveTypeIds.includes(dt.DriveTypeID))
      .map(dt => ({
        ...dt,
        displayName: dt.DriveTypeName || `Drive Type ${dt.DriveTypeID}`
      }));
  }

  /**
   * Get Equipment Models - ACES 4.2 CORRECTED
   */
  async getEquipmentModels(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_EquipmentModel');
  }

  /**
   * Get Equipment Base - ACES 4.2 CORRECTED
   */
  async getEquipmentBase(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_EquipmentBase');
  }

  /**
   * Get Vehicle Types - ACES 4.2 CORRECTED
   */
  async getVehicleTypes(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_VehicleType');
  }

  /**
   * Get Manufacturers - ACES 4.2 CORRECTED
   */
  async getManufacturers(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_Mfr');
  }

  /**
   * Validate BaseVehicle combination - CRITICAL
   */
  async validateBaseVehicleCombination(yearId: number, makeId: number, modelId: number): Promise<boolean> {
    const baseVehicles = await this.getBaseVehiclesByYMM(yearId, makeId, modelId);
    return baseVehicles.length > 0;
  }

  /**
   * Get Part Types from PCdb - CORRECTED
   */
  async getPartTypes(): Promise<any[]> {
    return extractedDatabaseService.getTableData('PCdb', 'Parts');
  }

  /**
   * Get Positions from PCdb - CORRECTED
   */
  async getPositions(): Promise<any[]> {
    return extractedDatabaseService.getTableData('PCdb', 'Positions');
  }

  /**
   * Get Qualifiers from Qdb - CORRECTED
   */
  async getQualifiers(): Promise<any[]> {
    return extractedDatabaseService.getTableData('Qdb', 'Qualifier');
  }

  /**
   * Get all Engine VINs - CORRECTED
   */
  async getEngineVINs(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_EngineVIN');
  }

  /**
   * Get all Aspirations - CORRECTED
   */
  async getAspirations(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_Aspiration');
  }

  /**
   * Get all Fuel Types - CORRECTED
   */
  async getFuelTypes(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_FuelType');
  }

  /**
   * Get all Brake Systems - CORRECTED
   */
  async getBrakeSystems(): Promise<any[]> {
    return extractedDatabaseService.getTableData('VCdb', '20231026_BrakeSystem');
  }

  /**
   * Get Vehicle Groups - ACES 4.2
   */
  async getVehicleGroups(): Promise<any[]> {
    return [
      { id: 'passenger', name: 'Passenger Car' },
      { id: 'truck', name: 'Light Truck' },
      { id: 'heavy', name: 'Heavy Duty' },
      { id: 'motorcycle', name: 'Motorcycle' },
      { id: 'equipment', name: 'Equipment' }
    ];
  }

  /**
   * Get Regions - ACES 4.2
   */
  async getRegions(): Promise<any[]> {
    return [
      { id: 'north_america', name: 'North America' },
      { id: 'europe', name: 'Europe' },
      { id: 'asia', name: 'Asia' },
      { id: 'global', name: 'Global' }
    ];
  }

  /**
   * Get Vehicle Classes - ACES 4.2
   */
  async getVehicleClasses(): Promise<any[]> {
    return [
      { id: 'compact', name: 'Compact' },
      { id: 'midsize', name: 'Mid-size' },
      { id: 'fullsize', name: 'Full-size' },
      { id: 'luxury', name: 'Luxury' },
      { id: 'sport', name: 'Sport' },
      { id: 'suv', name: 'SUV' },
      { id: 'truck', name: 'Truck' }
    ];
  }

  /**
   * Get Physical Specifications Reference Data for BaseVehicle
   */
  async getPhysicalSpecsReferenceData(baseVehicleId: number): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    // Get linking tables
    const vehicleToWheelbase = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToWheelbase');
    const vehicleToBed = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBedConfig');
    const vehicleToBodyStyle = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBodyStyleConfig');
    const vehicleToMfrBody = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToMfrBodyCode');
    
    // Get reference tables
    const wheelbases = extractedDatabaseService.getTableData('VCdb', '20231026_Wheelbase');
    const bedConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BedConfig');
    const bedTypes = extractedDatabaseService.getTableData('VCdb', '20231026_BedType');
    const bedLengths = extractedDatabaseService.getTableData('VCdb', '20231026_BedLength');
    const bodyStyleConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BodyStyleConfig');
    const bodyTypes = extractedDatabaseService.getTableData('VCdb', '20231026_BodyType');
    const bodyNumDoors = extractedDatabaseService.getTableData('VCdb', '20231026_BodyNumDoors');
    const mfrBodyCodes = extractedDatabaseService.getTableData('VCdb', '20231026_MfrBodyCode');
    
    // Filter by vehicle compatibility
    const wheelbaseLinks = vehicleToWheelbase.filter(vw => vehicleIds.includes(vw.VehicleID));
    const bedLinks = vehicleToBed.filter(vb => vehicleIds.includes(vb.VehicleID));
    const bodyStyleLinks = vehicleToBodyStyle.filter(vbs => vehicleIds.includes(vbs.VehicleID));
    const mfrBodyLinks = vehicleToMfrBody.filter(vmb => vehicleIds.includes(vmb.VehicleID));
    
    const wheelbaseIds = [...new Set(wheelbaseLinks.map(wl => wl.WheelbaseID))];
    const bedConfigIds = [...new Set(bedLinks.map(bl => bl.BedConfigID))];
    const bodyStyleConfigIds = [...new Set(bodyStyleLinks.map(bsl => bsl.BodyStyleConfigID))];
    const mfrBodyCodeIds = [...new Set(mfrBodyLinks.map(mbl => mbl.MfrBodyCodeID))];
    
    const filteredBedConfigs = bedConfigs.filter(bc => bedConfigIds.includes(bc.BedConfigID));
    const filteredBodyStyleConfigs = bodyStyleConfigs.filter(bsc => bodyStyleConfigIds.includes(bsc.BodyStyleConfigID));
    
    return {
      wheelbases: wheelbases.filter(wb => wheelbaseIds.includes(wb.WheelBaseID)),
      bedTypes: [...new Set(filteredBedConfigs.map(bc => bc.BedTypeID))]
        .map(id => bedTypes.find(bt => bt.BedTypeID === id)).filter(bt => bt),
      bedLengths: [...new Set(filteredBedConfigs.map(bc => bc.BedLengthID))]
        .map(id => bedLengths.find(bl => bl.BedLengthID === id)).filter(bl => bl),
      bodyTypes: [...new Set(filteredBodyStyleConfigs.map(bsc => bsc.BodyTypeID))]
        .map(id => bodyTypes.find(bt => bt.BodyTypeID === id)).filter(bt => bt),
      bodyNumDoors: [...new Set(filteredBodyStyleConfigs.map(bsc => bsc.BodyNumDoorsID))]
        .map(id => bodyNumDoors.find(bnd => bnd.BodyNumDoorsID === id)).filter(bnd => bnd),
      mfrBodyCodes: mfrBodyCodes.filter(mbc => mfrBodyCodeIds.includes(mbc.MfrBodyCodeID)),
      isTruck: bedLinks.length > 0
    };
  }

  /**
   * Get PCdb Reference Data for Item specifications
   */
  async getPCdbReferenceData(): Promise<any> {
    const categories = extractedDatabaseService.getTableData('PCdb', 'Categories');
    const subCategories = extractedDatabaseService.getTableData('PCdb', 'Subcategories');
    const parts = extractedDatabaseService.getTableData('PCdb', 'Parts');
    const positions = extractedDatabaseService.getTableData('PCdb', 'Positions');
    
    return {
      categories: categories,
      subCategories: subCategories,
      partTypes: parts,
      positions: positions
    };
  }

  /**
   * Validate ACES Application
   */
  async validateApplication(application: any): Promise<any> {
    const errors = [];
    const warnings = [];
    
    // BaseVehicle validation
    if (!application.baseVehicleId) {
      errors.push('BaseVehicle is required');
    }
    
    // Part information validation
    if (!application.partType) {
      errors.push('Part Type is required');
    }
    
    if (!application.quantity || application.quantity < 1) {
      errors.push('Quantity must be greater than 0');
    }
    
    // Vehicle compatibility validation
    if (application.baseVehicleId) {
      const isValid = await this.validateBaseVehicleCombination(
        parseInt(application.year),
        parseInt(application.make),
        parseInt(application.model)
      );
      
      if (!isValid) {
        errors.push('Invalid BaseVehicle combination');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      status: errors.length === 0 ? 'Valid' : 'Invalid'
    };
  }

  /**
   * Export Applications to ACES XML
   */
  async exportApplicationsToXML(applications: any[]): Promise<string> {
    const validApplications = [];
    
    for (const app of applications) {
      const validation = await this.validateApplication(app);
      if (validation.isValid) {
        validApplications.push(app);
      }
    }
    
    // Basic ACES XML structure
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<ACES version="4.2">\n';
    xml += '  <Header>\n';
    xml += '    <Company>Auto Parts ERP</Company>\n';
    xml += '    <SenderName>ACES Builder</SenderName>\n';
    xml += '    <TransferDate>' + new Date().toISOString().split('T')[0] + '</TransferDate>\n';
    xml += '  </Header>\n';
    xml += '  <App action="A">\n';
    
    validApplications.forEach((app, index) => {
      xml += '    <App id="' + (index + 1) + '" action="A">\n';
      xml += '      <BaseVehicle id="' + app.baseVehicleId + '"/>\n';
      xml += '      <PartType id="' + (app.partType || '') + '"/>\n';
      xml += '      <Position id="' + (app.position || '') + '"/>\n';
      xml += '      <Qty>' + (app.quantity || 1) + '</Qty>\n';
      if (app.mfrLabel) {
        xml += '      <MfrLabel>' + app.mfrLabel + '</MfrLabel>\n';
      }
      if (app.notes) {
        xml += '      <Note>' + app.notes + '</Note>\n';
      }
      xml += '    </App>\n';
    });
    
    xml += '  </App>\n';
    xml += '</ACES>\n';
    
    return xml;
  }

  /**
   * Get Engine Reference Data for BaseVehicle
   */
  async getEngineReferenceData(baseVehicleId: number): Promise<any> {
    const engineConfigs = await this.getEngineConfigsByBaseVehicle(baseVehicleId);
    const engineBaseIds = [...new Set(engineConfigs.map(ec => ec.EngineBaseID))];
    
    const engineBases = extractedDatabaseService.getTableData('VCdb', '20231026_EngineBase');
    const aspirations = extractedDatabaseService.getTableData('VCdb', '20231026_Aspiration');
    const cylinderHeadTypes = extractedDatabaseService.getTableData('VCdb', '20231026_CylinderHeadType');
    const valves = extractedDatabaseService.getTableData('VCdb', '20231026_Valves');
    const ignitionTypes = extractedDatabaseService.getTableData('VCdb', '20231026_IgnitionSystemType');
    const powerOutputs = extractedDatabaseService.getTableData('VCdb', '20231026_PowerOutput');
    const engineDesignations = extractedDatabaseService.getTableData('VCdb', '20231026_EngineDesignation');
    const engineVersions = extractedDatabaseService.getTableData('VCdb', '20231026_EngineVersion');
    const engineVINs = extractedDatabaseService.getTableData('VCdb', '20231026_EngineVIN');
    const manufacturers = extractedDatabaseService.getTableData('VCdb', '20231026_Mfr');
    const fuelDeliveryConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_FuelDeliveryConfig');
    const fuelDeliveryTypes = extractedDatabaseService.getTableData('VCdb', '20231026_FuelDeliveryType');
    const fuelSystemDesigns = extractedDatabaseService.getTableData('VCdb', '20231026_FuelSystemDesign');
    
    const filteredEngineBases = engineBases.filter(eb => engineBaseIds.includes(eb.EngineBaseID));
    
    return {
      liters: [...new Set(filteredEngineBases.map(eb => eb.Liter).filter(l => l))],
      ccs: [...new Set(filteredEngineBases.map(eb => eb.CC).filter(c => c))],
      cids: [...new Set(filteredEngineBases.map(eb => eb.CID).filter(c => c))],
      cylinders: [...new Set(filteredEngineBases.map(eb => eb.Cylinders).filter(c => c))],
      blockTypes: [...new Set(filteredEngineBases.map(eb => eb.BlockType).filter(bt => bt))],
      boreInches: [...new Set(filteredEngineBases.map(eb => eb.EngBoreIn).filter(b => b))],
      boreMetric: [...new Set(filteredEngineBases.map(eb => eb.EngBoreMetric).filter(b => b))],
      strokeInches: [...new Set(filteredEngineBases.map(eb => eb.EngStrokeIn).filter(s => s))],
      strokeMetric: [...new Set(filteredEngineBases.map(eb => eb.EngStrokeMetric).filter(s => s))],
      aspirations: aspirations.filter(a => engineConfigs.some(ec => ec.AspirationID === a.AspirationID)),
      cylinderHeadTypes: cylinderHeadTypes.filter(cht => engineConfigs.some(ec => ec.CylinderHeadTypeID === cht.CylinderHeadTypeID)),
      valves: valves.filter(v => engineConfigs.some(ec => ec.ValvesID === v.ValvesID)),
      ignitionTypes: ignitionTypes.filter(it => engineConfigs.some(ec => ec.IgnitionSystemTypeID === it.IgnitionSystemTypeID)),
      powerOutputs: powerOutputs.filter(po => engineConfigs.some(ec => ec.PowerOutputID === po.PowerOutputID)),
      engineDesignations: engineDesignations.filter(ed => engineConfigs.some(ec => ec.EngineDesignationID === ed.EngineDesignationID)),
      engineVersions: engineVersions.filter(ev => engineConfigs.some(ec => ec.EngineVersionID === ev.EngineVersionID)),
      engineVINs: engineVINs.filter(evin => engineConfigs.some(ec => ec.EngineVINID === evin.EngineVINID)),
      manufacturers: manufacturers.filter(m => engineConfigs.some(ec => ec.EngineMfrID === m.MfrID))
    };
  }

  /**
   * Get Transmission Reference Data for BaseVehicle
   */
  async getTransmissionReferenceData(baseVehicleId: number): Promise<any> {
    const transmissions = await this.getTransmissionsByBaseVehicle(baseVehicleId);
    const transBaseIds = [...new Set(transmissions.map(t => t.TransmissionBaseID))];
    
    const transBases = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionBase');
    const transTypes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionType');
    const transNumSpeeds = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionNumSpeeds');
    const transControlTypes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionControlType');
    const transMfrCodes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionMfrCode');
    const elecControlled = extractedDatabaseService.getTableData('VCdb', '20231026_ElecControlled');
    const manufacturers = extractedDatabaseService.getTableData('VCdb', '20231026_Mfr');
    
    const filteredTransBases = transBases.filter(tb => transBaseIds.includes(tb.TransmissionBaseID));
    
    return {
      speeds: transNumSpeeds.filter(tns => filteredTransBases.some(tb => tb.TransmissionNumSpeedsID === tns.TransmissionNumSpeedsID)),
      controlTypes: transControlTypes.filter(tct => filteredTransBases.some(tb => tb.TransmissionControlTypeID === tct.TransmissionControlTypeID)),
      types: transTypes.filter(tt => filteredTransBases.some(tb => tb.TransmissionTypeID === tt.TransmissionTypeID)),
      mfrCodes: transMfrCodes.filter(tmc => transmissions.some(t => t.TransmissionMfrCodeID === tmc.TransmissionMfrCodeID)),
      elecControlled: elecControlled.filter(ec => transmissions.some(t => t.TransmissionElecControlledID === ec.ElecControlledID)),
      manufacturers: manufacturers.filter(m => transmissions.some(t => t.TransmissionMfrID === m.MfrID))
    };
  }

  /**
   * Get specific engine specs by BaseVehicle and Liter
   */
  async getEngineSpecsByLiter(baseVehicleId: number, liter: string): Promise<any> {
    const engineConfigs = await this.getEngineConfigsByBaseVehicle(baseVehicleId);
    const engineBases = extractedDatabaseService.getTableData('VCdb', '20231026_EngineBase');
    const aspirations = extractedDatabaseService.getTableData('VCdb', '20231026_Aspiration');
    const fuelTypes = extractedDatabaseService.getTableData('VCdb', '20231026_FuelType');
    const powerOutputs = extractedDatabaseService.getTableData('VCdb', '20231026_PowerOutput');
    const manufacturers = extractedDatabaseService.getTableData('VCdb', '20231026_Mfr');
    const cylinderHeadTypes = extractedDatabaseService.getTableData('VCdb', '20231026_CylinderHeadType');
    const valves = extractedDatabaseService.getTableData('VCdb', '20231026_Valves');
    const engineVINs = extractedDatabaseService.getTableData('VCdb', '20231026_EngineVIN');
    const ignitionTypes = extractedDatabaseService.getTableData('VCdb', '20231026_IgnitionSystemType');
    
    // Find engine base with matching liter
    const matchingEngineBase = engineBases.find(eb => eb.Liter === liter);
    if (!matchingEngineBase) return null;
    
    // Find engine config that uses this engine base
    const matchingEngineConfig = engineConfigs.find(ec => ec.EngineBaseID === matchingEngineBase.EngineBaseID);
    if (!matchingEngineConfig) return null;
    
    const aspiration = aspirations.find(a => a.AspirationID === matchingEngineConfig.AspirationID);
    const fuelType = fuelTypes.find(ft => ft.FuelTypeID === matchingEngineConfig.FuelTypeID);
    const powerOutput = powerOutputs.find(po => po.PowerOutputID === matchingEngineConfig.PowerOutputID);
    const manufacturer = manufacturers.find(m => m.MfrID === matchingEngineConfig.EngineMfrID);
    const cylinderHeadType = cylinderHeadTypes.find(cht => cht.CylinderHeadTypeID === matchingEngineConfig.CylinderHeadTypeID);
    const valve = valves.find(v => v.ValvesID === matchingEngineConfig.ValvesID);
    const engineVIN = engineVINs.find(evin => evin.EngineVINID === matchingEngineConfig.EngineVINID);
    const ignitionType = ignitionTypes.find(it => it.IgnitionSystemTypeID === matchingEngineConfig.IgnitionSystemTypeID);
    
    return {
      cc: matchingEngineBase.CC,
      cid: matchingEngineBase.CID,
      cylinders: matchingEngineBase.Cylinders,
      blockType: matchingEngineBase.BlockType,
      boreInches: matchingEngineBase.EngBoreIn,
      boreMetric: matchingEngineBase.EngBoreMetric,
      strokeInches: matchingEngineBase.EngStrokeIn,
      strokeMetric: matchingEngineBase.EngStrokeMetric,
      cylinderHeadType: cylinderHeadType?.CylinderHeadTypeID,
      aspiration: aspiration?.AspirationID,
      valvesPerEngine: valve?.ValvesID,
      ignitionSystemType: ignitionType?.IgnitionSystemTypeID,
      horsePower: powerOutput?.PowerOutputID,
      kilowattPower: powerOutput?.KilowattPower,
      fuelType: fuelType?.FuelTypeID,
      engineManufacturer: manufacturer?.MfrID,
      engineVIN: engineVIN?.EngineVINID
    };
  }

  /**
   * Get specific transmission specs by BaseVehicle and Type
   */
  async getTransmissionSpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const transmissions = await this.getTransmissionsByBaseVehicle(baseVehicleId);
    const transBases = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionBase');
    const transTypes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionType');
    const transControlTypes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionControlType');
    const transNumSpeeds = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionNumSpeeds');
    const elecControlled = extractedDatabaseService.getTableData('VCdb', '20231026_ElecControlled');
    const transMfrCodes = extractedDatabaseService.getTableData('VCdb', '20231026_TransmissionMfrCode');
    const manufacturers = extractedDatabaseService.getTableData('VCdb', '20231026_Mfr');
    
    const matchingTransmission = transmissions.find(t => t.TransmissionTypeID === type);
    if (!matchingTransmission) return null;
    
    const transBase = transBases.find(tb => tb.TransmissionBaseID === matchingTransmission.TransmissionBaseID);
    const controlType = transControlTypes.find(tct => tct.TransmissionControlTypeID === transBase?.TransmissionControlTypeID);
    const numSpeeds = transNumSpeeds.find(tns => tns.TransmissionNumSpeedsID === transBase?.TransmissionNumSpeedsID);
    const elecControl = elecControlled.find(ec => ec.ElecControlledID === matchingTransmission.TransmissionElecControlledID);
    const mfrCode = transMfrCodes.find(tmc => tmc.TransmissionMfrCodeID === matchingTransmission.TransmissionMfrCodeID);
    const manufacturer = manufacturers.find(m => m.MfrID === matchingTransmission.TransmissionMfrID);
    
    return {
      speeds: numSpeeds?.TransmissionNumSpeedsID,
      control: controlType?.TransmissionControlTypeID,
      type: type,
      mfrName: manufacturer?.MfrID,
      mfrCode: mfrCode?.TransmissionMfrCodeID,
      elecControlled: elecControl?.ElecControlledID
    };
  }

  /**
   * Get specific brake specs by BaseVehicle and Type
   */
  async getBrakeSpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const brakeConfigs = await this.getBrakeConfigsByBaseVehicle(baseVehicleId);
    const brakeSystems = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeSystem');
    const brakeABS = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeABS');
    
    const matchingBrakeConfig = brakeConfigs.find(bc => bc.FrontBrakeTypeID === type || bc.RearBrakeTypeID === type);
    if (!matchingBrakeConfig) return null;
    
    const brakeSystem = brakeSystems.find(bs => bs.BrakeSystemID === matchingBrakeConfig.BrakeSystemID);
    const abs = brakeABS.find(ba => ba.BrakeABSID === matchingBrakeConfig.BrakeABSID);
    
    return {
      frontBrake: type,
      rearBrake: matchingBrakeConfig.RearBrakeTypeID,
      brakeSystem: brakeSystem?.BrakeSystemID,
      brakeABS: abs?.BrakeABSID
    };
  }

  /**
   * Get specific body specs by BaseVehicle and Type
   */
  async getBodySpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToBodyStyle = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBodyStyleConfig');
    const bodyStyleConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BodyStyleConfig');
    const bodyNumDoors = extractedDatabaseService.getTableData('VCdb', '20231026_BodyNumDoors');
    
    const bodyStyleLinks = vehicleToBodyStyle.filter(vbs => vehicleIds.includes(vbs.VehicleID));
    const bodyStyleConfigIds = [...new Set(bodyStyleLinks.map(bsl => bsl.BodyStyleConfigID))];
    const filteredBodyStyleConfigs = bodyStyleConfigs.filter(bsc => bodyStyleConfigIds.includes(bsc.BodyStyleConfigID));
    
    const matchingBodyStyleConfig = filteredBodyStyleConfigs.find(bsc => bsc.BodyTypeID === type);
    if (!matchingBodyStyleConfig) return null;
    
    const numDoors = bodyNumDoors.find(bnd => bnd.BodyNumDoorsID === matchingBodyStyleConfig.BodyNumDoorsID);
    
    return {
      bodyType: type,
      numDoors: numDoors?.BodyNumDoorsID
    };
  }

  /**
   * Get specific part specs by Category and Type
   */
  async getPartSpecsByType(category: string, partType: string): Promise<any> {
    const parts = extractedDatabaseService.getTableData('PCdb', 'Parts');
    const categories = extractedDatabaseService.getTableData('PCdb', 'Categories');
    const subCategories = extractedDatabaseService.getTableData('PCdb', 'Subcategories');
    const positions = extractedDatabaseService.getTableData('PCdb', 'Positions');
    
    const part = parts.find(p => p.PartTerminologyID === partType);
    if (!part) return null;
    
    const categoryData = categories.find(c => c.CategoryID === category);
    const subCategoryData = subCategories.find(sc => sc.SubCategoryID === part.SubCategoryID);
    
    // Auto-suggest quantity and position based on part type
    let suggestedQuantity = 1;
    let suggestedPosition = '';
    const partName = part.PartTerminologyName?.toLowerCase() || '';
    
    if (partName.includes('brake pad') || partName.includes('brake shoe')) {
      suggestedQuantity = 4;
      suggestedPosition = positions.find(p => p.Position?.toLowerCase().includes('front'))?.PositionID || '';
    } else if (partName.includes('spark plug')) {
      suggestedQuantity = 4;
    } else if (partName.includes('tire')) {
      suggestedQuantity = 4;
    } else if (partName.includes('wiper blade')) {
      suggestedQuantity = 2;
      suggestedPosition = positions.find(p => p.Position?.toLowerCase().includes('front'))?.PositionID || '';
    } else if (partName.includes('filter')) {
      suggestedQuantity = 1;
      suggestedPosition = positions.find(p => p.Position?.toLowerCase().includes('engine'))?.PositionID || '';
    }
    
    return {
      category: category,
      subCategory: part.SubCategoryID,
      partType: partType,
      position: suggestedPosition,
      quantity: suggestedQuantity,
      mfrLabel: part.PartTerminologyName
    };
  }

  /**
   * Get specific drive specs by BaseVehicle and Type
   */
  async getDriveSpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const driveTypes = extractedDatabaseService.getTableData('VCdb', '20231026_DriveType');
    const driveType = driveTypes.find(dt => dt.DriveTypeID === type);
    
    return {
      driveType: type,
      driveName: driveType?.DriveTypeName
    };
  }

  /**
   * Get specific spring specs by BaseVehicle and Type
   */
  async getSpringSpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToSpring = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToSpringTypeConfig');
    const springConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_SpringTypeConfig');
    
    const springLinks = vehicleToSpring.filter(vs => vehicleIds.includes(vs.VehicleID));
    const springConfigIds = [...new Set(springLinks.map(sl => sl.SpringTypeConfigID))];
    const filteredSpringConfigs = springConfigs.filter(sc => springConfigIds.includes(sc.SpringTypeConfigID));
    
    const matchingSpringConfig = filteredSpringConfigs.find(sc => sc.FrontSpringTypeID === type || sc.RearSpringTypeID === type);
    if (!matchingSpringConfig) return null;
    
    return {
      frontSpring: matchingSpringConfig.FrontSpringTypeID,
      rearSpring: matchingSpringConfig.RearSpringTypeID
    };
  }

  /**
   * Get specific steering specs by BaseVehicle and Type
   */
  async getSteeringSpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToSteering = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToSteeringConfig');
    const steeringConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_SteeringConfig');
    const steeringSystems = extractedDatabaseService.getTableData('VCdb', '20231026_SteeringSystem');
    
    const steeringLinks = vehicleToSteering.filter(vst => vehicleIds.includes(vst.VehicleID));
    const steeringConfigIds = [...new Set(steeringLinks.map(stl => stl.SteeringConfigID))];
    const filteredSteeringConfigs = steeringConfigs.filter(stc => steeringConfigIds.includes(stc.SteeringConfigID));
    
    const matchingSteeringConfig = filteredSteeringConfigs.find(stc => stc.SteeringTypeID === type);
    if (!matchingSteeringConfig) return null;
    
    const steeringSystem = steeringSystems.find(ss => ss.SteeringSystemID === matchingSteeringConfig.SteeringSystemID);
    
    return {
      steeringType: type,
      steeringSystem: steeringSystem?.SteeringSystemID
    };
  }

  /**
   * Get specific wheelbase specs by BaseVehicle and Wheelbase
   */
  async getWheelbaseSpecsByValue(baseVehicleId: number, wheelbaseValue: string): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToWheelbase = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToWheelbase');
    const wheelbases = extractedDatabaseService.getTableData('VCdb', '20231026_Wheelbase');
    
    const wheelbaseLinks = vehicleToWheelbase.filter(vw => vehicleIds.includes(vw.VehicleID));
    const wheelbaseIds = [...new Set(wheelbaseLinks.map(wl => wl.WheelbaseID))];
    const filteredWheelbases = wheelbases.filter(wb => wheelbaseIds.includes(wb.WheelBaseID));
    
    const matchingWheelbase = filteredWheelbases.find(wb => wb.WheelBase === wheelbaseValue || wb.WheelBaseMetric === wheelbaseValue);
    if (!matchingWheelbase) return null;
    
    return {
      wheelbaseInches: matchingWheelbase.WheelBase,
      wheelbaseMetric: matchingWheelbase.WheelBaseMetric
    };
  }

  /**
   * Get specific bed specs by BaseVehicle and Type
   */
  async getBedSpecsByType(baseVehicleId: number, type: string): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToBed = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBedConfig');
    const bedConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BedConfig');
    const bedLengths = extractedDatabaseService.getTableData('VCdb', '20231026_BedLength');
    
    const bedLinks = vehicleToBed.filter(vb => vehicleIds.includes(vb.VehicleID));
    const bedConfigIds = [...new Set(bedLinks.map(bl => bl.BedConfigID))];
    const filteredBedConfigs = bedConfigs.filter(bc => bedConfigIds.includes(bc.BedConfigID));
    
    const matchingBedConfig = filteredBedConfigs.find(bc => bc.BedTypeID === type);
    if (!matchingBedConfig) return null;
    
    const bedLength = bedLengths.find(bl => bl.BedLengthID === matchingBedConfig.BedLengthID);
    
    return {
      bedType: type,
      bedLengthInches: bedLength?.BedLength,
      bedLengthMetric: bedLength?.BedLengthMetric
    };
  }

  /**
   * Get specific manufacturer body code specs by BaseVehicle and Code
   */
  async getMfrBodySpecsByCode(baseVehicleId: number, code: string): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    const vehicleToMfrBody = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToMfrBodyCode');
    const mfrBodyCodes = extractedDatabaseService.getTableData('VCdb', '20231026_MfrBodyCode');
    
    const mfrBodyLinks = vehicleToMfrBody.filter(vmb => vehicleIds.includes(vmb.VehicleID));
    const mfrBodyCodeIds = [...new Set(mfrBodyLinks.map(mbl => mbl.MfrBodyCodeID))];
    const filteredMfrBodyCodes = mfrBodyCodes.filter(mbc => mfrBodyCodeIds.includes(mbc.MfrBodyCodeID));
    
    const matchingMfrBodyCode = filteredMfrBodyCodes.find(mbc => mbc.MfrBodyCodeID === code);
    if (!matchingMfrBodyCode) return null;
    
    return {
      mfrBodyCode: code,
      mfrBodyCodeName: matchingMfrBodyCode.MfrBodyCodeName
    };
  }

  /**
   * Get Vehicle Systems Reference Data for BaseVehicle
   */
  async getVehicleSystemsReferenceData(baseVehicleId: number): Promise<any> {
    const vehicles = await this.getVehiclesByBaseVehicle(baseVehicleId);
    const vehicleIds = vehicles.map(v => v.VehicleID);
    
    // Get all system linking tables
    const vehicleToDrive = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToDriveType');
    const vehicleToBrake = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToBrakeConfig');
    const vehicleToSpring = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToSpringTypeConfig');
    const vehicleToSteering = extractedDatabaseService.getTableData('VCdb', '20231026_VehicleToSteeringConfig');
    
    // Get reference tables
    const driveTypes = extractedDatabaseService.getTableData('VCdb', '20231026_DriveType');
    const brakeConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeConfig');
    const brakeTypes = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeType');
    const brakeSystems = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeSystem');
    const brakeABS = extractedDatabaseService.getTableData('VCdb', '20231026_BrakeABS');
    const springConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_SpringTypeConfig');
    const springTypes = extractedDatabaseService.getTableData('VCdb', '20231026_SpringType');
    const steeringConfigs = extractedDatabaseService.getTableData('VCdb', '20231026_SteeringConfig');
    const steeringTypes = extractedDatabaseService.getTableData('VCdb', '20231026_SteeringType');
    const steeringSystems = extractedDatabaseService.getTableData('VCdb', '20231026_SteeringSystem');
    
    // Filter by vehicle compatibility
    const driveLinks = vehicleToDrive.filter(vd => vehicleIds.includes(vd.VehicleID));
    const brakeLinks = vehicleToBrake.filter(vb => vehicleIds.includes(vb.VehicleID));
    const springLinks = vehicleToSpring.filter(vs => vehicleIds.includes(vs.VehicleID));
    const steeringLinks = vehicleToSteering.filter(vst => vehicleIds.includes(vst.VehicleID));
    
    const driveTypeIds = [...new Set(driveLinks.map(dl => dl.DriveTypeID))];
    const brakeConfigIds = [...new Set(brakeLinks.map(bl => bl.BrakeConfigID))];
    const springConfigIds = [...new Set(springLinks.map(sl => sl.SpringTypeConfigID))];
    const steeringConfigIds = [...new Set(steeringLinks.map(stl => stl.SteeringConfigID))];
    
    const filteredBrakeConfigs = brakeConfigs.filter(bc => brakeConfigIds.includes(bc.BrakeConfigID));
    const filteredSpringConfigs = springConfigs.filter(sc => springConfigIds.includes(sc.SpringTypeConfigID));
    const filteredSteeringConfigs = steeringConfigs.filter(stc => steeringConfigIds.includes(stc.SteeringConfigID));
    
    return {
      driveTypes: driveTypes.filter(dt => driveTypeIds.includes(dt.DriveTypeID)),
      frontBrakeTypes: [...new Set(filteredBrakeConfigs.map(bc => bc.FrontBrakeTypeID))]
        .map(id => brakeTypes.find(bt => bt.BrakeTypeID === id)).filter(bt => bt),
      rearBrakeTypes: [...new Set(filteredBrakeConfigs.map(bc => bc.RearBrakeTypeID))]
        .map(id => brakeTypes.find(bt => bt.BrakeTypeID === id)).filter(bt => bt),
      brakeSystems: [...new Set(filteredBrakeConfigs.map(bc => bc.BrakeSystemID))]
        .map(id => brakeSystems.find(bs => bs.BrakeSystemID === id)).filter(bs => bs),
      brakeABS: [...new Set(filteredBrakeConfigs.map(bc => bc.BrakeABSID))]
        .map(id => brakeABS.find(ba => ba.BrakeABSID === id)).filter(ba => ba),
      frontSpringTypes: [...new Set(filteredSpringConfigs.map(sc => sc.FrontSpringTypeID))]
        .map(id => springTypes.find(st => st.SpringTypeID === id)).filter(st => st),
      rearSpringTypes: [...new Set(filteredSpringConfigs.map(sc => sc.RearSpringTypeID))]
        .map(id => springTypes.find(st => st.SpringTypeID === id)).filter(st => st),
      steeringTypes: [...new Set(filteredSteeringConfigs.map(stc => stc.SteeringTypeID))]
        .map(id => steeringTypes.find(st => st.SteeringTypeID === id)).filter(st => st),
      steeringSystems: [...new Set(filteredSteeringConfigs.map(stc => stc.SteeringSystemID))]
        .map(id => steeringSystems.find(ss => ss.SteeringSystemID === id)).filter(ss => ss)
    };
  }
}

export const acesServiceCorrected = new ACESServiceCorrected();