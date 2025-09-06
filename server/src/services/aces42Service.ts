import { parseStringPromise, Builder } from 'xml2js';
import { 
  ACES42Document, 
  ACES42Application, 
  ACES42ApplicationInternal,
  ACES42ExportOptions,
  ACES42ImportResult 
} from '../types/aces42';
import { Product } from '../types';

export class ACES42Service {
  
  /**
   * Parse ACES 4.2 XML file
   */
  async parseACES42XML(xmlContent: string): Promise<ACES42ImportResult> {
    try {
      const result = await parseStringPromise(xmlContent);
      const aces = result.ACES;
      
      if (aces.$.version !== '4.2') {
        throw new Error(`Unsupported ACES version: ${aces.$.version}`);
      }

      const applications: ACES42Application[] = [];
      let applicationsProcessed = 0;
      let assetsProcessed = 0;
      let digitalAssetsProcessed = 0;
      const errors: string[] = [];
      const warnings: string[] = [];

      // Parse applications
      if (aces.App) {
        for (const app of aces.App) {
          try {
            const application = this.parseApplication(app);
            applications.push(application);
            applicationsProcessed++;
          } catch (error) {
            errors.push(`Application ${app.$.id}: ${error.message}`);
          }
        }
      }

      // Parse assets (NEW in ACES 4.2)
      if (aces.Asset) {
        assetsProcessed = aces.Asset.length;
      }

      // Parse digital assets
      if (aces.DigitalAsset?.[0]?.DigitalFileInformation) {
        digitalAssetsProcessed = aces.DigitalAsset[0].DigitalFileInformation.length;
      }

      return {
        success: errors.length === 0,
        applicationsProcessed,
        assetsProcessed,
        digitalAssetsProcessed,
        errors,
        warnings
      };

    } catch (error) {
      return {
        success: false,
        applicationsProcessed: 0,
        assetsProcessed: 0,
        digitalAssetsProcessed: 0,
        errors: [`XML parsing failed: ${error.message}`],
        warnings: []
      };
    }
  }

  /**
   * Parse individual application from XML
   */
  private parseApplication(app: any): ACES42Application {
    const application: ACES42Application = {
      id: app.$.id,
      action: app.$.action || 'A',
      quantity: parseInt(app.Qty?.[0] || '1'),
      partType: { id: parseInt(app.PartType?.[0]?.$.id) },
      part: {
        partNumber: app.Part?.[0]?._ || app.Part?.[0] || '',
        brandAAIAID: app.Part?.[0]?.$.BrandAAIAID,
        subBrandAAIAID: app.Part?.[0]?.$.SubBrandAAIAID
      }
    };

    // Validation flag
    if (app.$.validate === 'no') {
      application.validate = 'no';
    }

    // BaseVehicle pattern
    if (app.BaseVehicle) {
      application.baseVehicle = { id: parseInt(app.BaseVehicle[0].$.id) };
      
      // Sub-components
      if (app.SubModel) {
        application.baseVehicle.subModel = { id: parseInt(app.SubModel[0].$.id) };
      }
      if (app.EngineBase) {
        application.baseVehicle.engineBase = { id: parseInt(app.EngineBase[0].$.id) };
      }
      if (app.EngineVIN) {
        application.baseVehicle.engineVIN = { id: parseInt(app.EngineVIN[0].$.id) };
      }
      if (app.EngineBlock) {
        application.baseVehicle.engineBlock = { id: parseInt(app.EngineBlock[0].$.id) };
      }
      if (app.Aspiration) {
        application.baseVehicle.aspiration = { id: parseInt(app.Aspiration[0].$.id) };
      }
    }

    // Year/Make/Model pattern
    if (app.Years) {
      application.years = {
        from: parseInt(app.Years[0].$.from),
        to: parseInt(app.Years[0].$.to)
      };
    }
    if (app.Make) {
      application.make = { id: parseInt(app.Make[0].$.id) };
    }
    if (app.Model) {
      application.model = { id: parseInt(app.Model[0].$.id) };
    }
    if (app.SubModel && !application.baseVehicle) {
      application.subModel = { id: parseInt(app.SubModel[0].$.id) };
    }

    // Equipment applications (NEW in ACES 4.2)
    if (app.Mfr) {
      application.manufacturer = { id: parseInt(app.Mfr[0].$.id) };
    }
    if (app.EquipmentModel) {
      application.equipmentModel = { id: parseInt(app.EquipmentModel[0].$.id) };
    }
    if (app.EquipmentBase) {
      application.equipmentBase = { id: parseInt(app.EquipmentBase[0].$.id) };
    }
    if (app.VehicleType) {
      application.vehicleType = { id: parseInt(app.VehicleType[0].$.id) };
    }
    if (app.ProductionYears) {
      application.productionYears = {
        productionStart: parseInt(app.ProductionYears[0].$.ProductionStart),
        productionEnd: parseInt(app.ProductionYears[0].$.ProductionEnd)
      };
    }

    // Engine specifications (standalone)
    if (app.EngineBase && !application.baseVehicle) {
      application.engineBase = { id: parseInt(app.EngineBase[0].$.id) };
    }
    if (app.EngineVIN && !application.baseVehicle) {
      application.engineVIN = { id: parseInt(app.EngineVIN[0].$.id) };
    }
    if (app.EngineBlock && !application.baseVehicle) {
      application.engineBlock = { id: parseInt(app.EngineBlock[0].$.id) };
    }

    // Position
    if (app.Position) {
      application.position = { id: parseInt(app.Position[0].$.id) };
    }

    // Qualifiers
    if (app.Qual) {
      application.qualifiers = app.Qual.map((qual: any) => ({
        id: parseInt(qual.$.id),
        text: qual.text?.[0],
        parameters: qual.param?.map((p: any) => ({ value: p.$.value }))
      }));
    }

    // Notes
    if (app.Note) {
      application.notes = Array.isArray(app.Note) ? app.Note : [app.Note];
    }

    // Asset references (NEW in ACES 4.2)
    if (app.AssetName) {
      application.assetName = app.AssetName[0];
    }
    if (app.AssetItemOrder) {
      application.assetItemOrder = parseInt(app.AssetItemOrder[0]);
    }

    return application;
  }

  /**
   * Generate ACES 4.2 XML from products
   */
  async generateACES42XML(
    products: Product[], 
    options: ACES42ExportOptions
  ): Promise<string> {
    const applications: any[] = [];
    let appId = 1;

    for (const product of products) {
      if (product.aces42Applications) {
        for (const app of product.aces42Applications) {
          const xmlApp: any = {
            $: { 
              action: 'A', 
              id: appId.toString() 
            },
            Qty: [app.quantity.toString()],
            PartType: [{ $: { id: app.partType.id.toString() } }],
            Part: [app.part.partNumber]
          };

          // Add brand info if available
          if (app.part.brandAAIAID) {
            xmlApp.Part[0] = {
              _: app.part.partNumber,
              $: { BrandAAIAID: app.part.brandAAIAID }
            };
          }

          // BaseVehicle pattern
          if (app.baseVehicle) {
            xmlApp.BaseVehicle = [{ $: { id: app.baseVehicle.id.toString() } }];
            
            if (app.baseVehicle.subModel) {
              xmlApp.SubModel = [{ $: { id: app.baseVehicle.subModel.id.toString() } }];
            }
            if (app.baseVehicle.engineBase) {
              xmlApp.EngineBase = [{ $: { id: app.baseVehicle.engineBase.id.toString() } }];
            }
            if (app.baseVehicle.engineVIN) {
              xmlApp.EngineVIN = [{ $: { id: app.baseVehicle.engineVIN.id.toString() } }];
            }
            if (app.baseVehicle.engineBlock) {
              xmlApp.EngineBlock = [{ $: { id: app.baseVehicle.engineBlock.id.toString() } }];
            }
          }

          // Year/Make/Model pattern
          if (app.years) {
            xmlApp.Years = [{
              $: {
                from: app.years.from.toString(),
                to: app.years.to.toString()
              }
            }];
          }
          if (app.make) {
            xmlApp.Make = [{ $: { id: app.make.id.toString() } }];
          }
          if (app.model) {
            xmlApp.Model = [{ $: { id: app.model.id.toString() } }];
          }

          // Equipment applications
          if (app.manufacturer) {
            xmlApp.Mfr = [{ $: { id: app.manufacturer.id.toString() } }];
          }
          if (app.equipmentModel) {
            xmlApp.EquipmentModel = [{ $: { id: app.equipmentModel.id.toString() } }];
          }
          if (app.vehicleType) {
            xmlApp.VehicleType = [{ $: { id: app.vehicleType.id.toString() } }];
          }

          // Position
          if (app.position) {
            xmlApp.Position = [{ $: { id: app.position.id.toString() } }];
          }

          // Qualifiers
          if (app.qualifiers?.length) {
            xmlApp.Qual = app.qualifiers.map(qual => ({
              $: { id: qual.id.toString() },
              text: qual.text ? [qual.text] : undefined,
              param: qual.parameters?.map(p => ({ $: { value: p.value } }))
            }));
          }

          // Notes
          if (app.notes?.length) {
            xmlApp.Note = app.notes;
          }

          // Asset references
          if (app.assetName) {
            xmlApp.AssetName = [app.assetName];
          }
          if (app.assetItemOrder) {
            xmlApp.AssetItemOrder = [app.assetItemOrder.toString()];
          }

          applications.push(xmlApp);
          appId++;
        }
      }
    }

    const acesDoc = {
      ACES: {
        $: { 
          version: '4.2',
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        },
        Header: [{
          Company: ['Auto Parts ERP'],
          SenderName: ['System Export'],
          SenderPhone: ['000-000-0000'],
          TransferDate: [new Date().toISOString().split('T')[0]],
          BrandAAIAID: [options.brandAAIAID],
          SubBrandAAIAID: options.subBrandAAIAID ? [options.subBrandAAIAID] : undefined,
          DocumentTitle: ['Product Applications Export'],
          EffectiveDate: [options.effectiveDate || new Date().toISOString().split('T')[0]],
          PartsApprovedFor: [{
            Country: ['US', 'CA']
          }],
          SubmissionType: [options.submissionType],
          VcdbVersionDate: ['2024-01-01'],
          QdbVersionDate: ['2024-01-01'],
          PcdbVersionDate: ['2024-01-01']
        }],
        App: applications,
        Footer: [{
          RecordCount: [applications.length.toString()]
        }]
      }
    };

    const builder = new Builder({
      xmldec: { version: '1.0', encoding: 'UTF-8' },
      renderOpts: { pretty: true, indent: '\t' }
    });

    return builder.buildObject(acesDoc);
  }
}

export const aces42Service = new ACES42Service();