import { parseStringPromise, Builder } from 'xml2js';
import { ACESApplication, ImportResult } from '../types';
import { vcdbService } from './vcdbService';

export class ACESService {
  
  /**
   * Parse ACES XML (supports 4.1 and 4.2)
   */
  async parseACESXML(xmlContent: string): Promise<ImportResult> {
    try {
      const result = await parseStringPromise(xmlContent);
      const aces = result.ACES;
      const version = aces.$.version;
      
      const applications: ACESApplication[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      if (aces.App) {
        for (const app of aces.App) {
          try {
            const application = this.parseApplication(app, version);
            applications.push(application);
          } catch (error) {
            errors.push(`Application ${app.$.id}: ${error.message}`);
          }
        }
      }

      return {
        success: errors.length === 0,
        recordsProcessed: applications.length,
        errors,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        recordsProcessed: 0,
        errors: [`XML parsing failed: ${error.message}`],
        warnings: []
      };
    }
  }

  private parseApplication(app: any, version: string): ACESApplication {
    const application: ACESApplication = {
      id: app.$.id,
      productId: '', // Will be set when linking to product
      quantity: parseInt(app.Qty?.[0] || '1'),
      partTypeId: parseInt(app.PartType?.[0]?.$.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // BaseVehicle pattern
    if (app.BaseVehicle) {
      application.baseVehicleId = parseInt(app.BaseVehicle[0].$.id);
      
      // Resolve vehicle info from VCdb
      const vehicleInfo = vcdbService.resolveVehicleInfo(application.baseVehicleId);
      if (vehicleInfo) {
        application.year = vehicleInfo.year;
        application.make = vehicleInfo.make;
        application.model = vehicleInfo.model;
      }
    }

    // Year/Make/Model pattern
    if (app.Years) {
      const years = app.Years[0].$;
      application.yearId = parseInt(years.from);
      if (years.from !== years.to) {
        application.notes = [`Year range: ${years.from}-${years.to}`];
      }
    }
    if (app.Make) {
      application.makeId = parseInt(app.Make[0].$.id);
      application.make = vcdbService.getMakeName(application.makeId);
    }
    if (app.Model) {
      application.modelId = parseInt(app.Model[0].$.id);
      application.model = vcdbService.getModelName(application.modelId);
    }

    // Equipment pattern (ACES 4.2+)
    if (app.Mfr) {
      application.manufacturerId = parseInt(app.Mfr[0].$.id);
    }
    if (app.EquipmentModel) {
      application.equipmentModelId = parseInt(app.EquipmentModel[0].$.id);
    }
    if (app.VehicleType) {
      application.vehicleTypeId = parseInt(app.VehicleType[0].$.id);
    }
    if (app.ProductionYears) {
      const prod = app.ProductionYears[0].$;
      application.productionStart = parseInt(prod.ProductionStart);
      application.productionEnd = parseInt(prod.ProductionEnd);
    }

    // Engine specifications
    if (app.EngineBase) {
      application.engineBaseId = parseInt(app.EngineBase[0].$.id);
    }
    if (app.EngineVIN) {
      application.engineVINId = parseInt(app.EngineVIN[0].$.id);
    }
    if (app.EngineBlock) {
      application.engineBlockId = parseInt(app.EngineBlock[0].$.id);
    }

    // Position
    if (app.Position) {
      application.positionId = parseInt(app.Position[0].$.id);
    }

    // Qualifiers
    if (app.Qual) {
      application.qualifiers = app.Qual.map((qual: any) => ({
        id: `${application.id}_${qual.$.id}`,
        applicationId: application.id,
        qualifierId: parseInt(qual.$.id),
        qualifierText: qual.text?.[0],
        parameters: qual.param?.map((p: any) => p.$.value) || []
      }));
    }

    // Notes
    if (app.Note) {
      application.notes = Array.isArray(app.Note) ? app.Note : [app.Note];
    }

    // ACES 4.2+ features
    if (version === '4.2') {
      if (app.AssetName) {
        application.assetName = app.AssetName[0];
      }
      if (app.AssetItemOrder) {
        application.assetItemOrder = parseInt(app.AssetItemOrder[0]);
      }
      if (app.$.validate === 'no') {
        application.validateApplication = false;
      }
    }

    return application;
  }

  /**
   * Generate ACES XML (auto-detects version based on data)
   */
  async generateACESXML(applications: ACESApplication[], brandAAIAID: string): Promise<string> {
    const hasEquipment = applications.some(app => app.equipmentModelId || app.manufacturerId);
    const hasAssets = applications.some(app => app.assetName);
    const version = (hasEquipment || hasAssets) ? '4.2' : '4.1';

    const xmlApps = applications.map((app, index) => {
      const xmlApp: any = {
        $: { action: 'A', id: (index + 1).toString() },
        Qty: [app.quantity.toString()],
        PartType: [{ $: { id: app.partTypeId.toString() } }],
        Part: [app.productId] // Use product part number
      };

      // BaseVehicle pattern
      if (app.baseVehicleId) {
        xmlApp.BaseVehicle = [{ $: { id: app.baseVehicleId.toString() } }];
      }

      // Year/Make/Model pattern
      if (app.yearId && app.makeId && app.modelId) {
        if (app.notes?.some(note => note.includes('Year range'))) {
          const range = app.notes.find(note => note.includes('Year range'))?.split(': ')[1];
          if (range) {
            const [from, to] = range.split('-');
            xmlApp.Years = [{ $: { from, to } }];
          }
        }
        xmlApp.Make = [{ $: { id: app.makeId.toString() } }];
        xmlApp.Model = [{ $: { id: app.modelId.toString() } }];
      }

      // Equipment pattern (4.2 only)
      if (version === '4.2') {
        if (app.manufacturerId) {
          xmlApp.Mfr = [{ $: { id: app.manufacturerId.toString() } }];
        }
        if (app.equipmentModelId) {
          xmlApp.EquipmentModel = [{ $: { id: app.equipmentModelId.toString() } }];
        }
        if (app.vehicleTypeId) {
          xmlApp.VehicleType = [{ $: { id: app.vehicleTypeId.toString() } }];
        }
      }

      // Position
      if (app.positionId) {
        xmlApp.Position = [{ $: { id: app.positionId.toString() } }];
      }

      // Qualifiers
      if (app.qualifiers?.length) {
        xmlApp.Qual = app.qualifiers.map(qual => ({
          $: { id: qual.qualifierId.toString() },
          text: qual.qualifierText ? [qual.qualifierText] : undefined
        }));
      }

      // Notes
      if (app.notes?.length) {
        xmlApp.Note = app.notes.filter(note => !note.includes('Year range'));
      }

      // Assets (4.2 only)
      if (version === '4.2' && app.assetName) {
        xmlApp.AssetName = [app.assetName];
        if (app.assetItemOrder) {
          xmlApp.AssetItemOrder = [app.assetItemOrder.toString()];
        }
      }

      return xmlApp;
    });

    const acesDoc = {
      ACES: {
        $: { version },
        Header: [{
          Company: ['Auto Parts ERP'],
          BrandAAIAID: [brandAAIAID],
          DocumentTitle: ['Product Applications'],
          SubmissionType: ['FULL'],
          VcdbVersionDate: ['2023-10-26']
        }],
        App: xmlApps,
        Footer: [{ RecordCount: [applications.length.toString()] }]
      }
    };

    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '\t' }
    });

    return builder.buildObject(acesDoc);
  }
}

export const acesService = new ACESService();