import React, { useEffect, useMemo, useState } from 'react';
import { SearchableSelect } from './SearchableSelect';

// Segment models aligned to server PIES types
export interface ItemSegment {
  partNo: string; // B01
  baseItemNo?: string; // B02
  vmrsCode?: string; // B03
  gtin?: string; // B04
  brandId: string; // B05
  subBrandId?: string; // B06
  partType?: string; // B07 - PCdb PartTerminologyID
  categoryId?: string; // B08 - auto from part type
  unspsc?: string; // B09
  // Additional PIES item fields we already supported
  mfgCode?: string;
  groupCode?: string;
  subGroupCode?: string;
  itemQtySize?: string;
  itemQtyUom?: string;
}

export interface DescriptionSegment {
  descriptionCode: string; // DES, LAB, MKT, FAB
  description: string;
  languageCode?: string;
}

export interface PriceSegment {
  priceType: string; // LIST, MSRP, COST, etc.
  price: number;
  currency: string;
  priceUom?: string;
}

export interface EXPISegment {
  expiCode: string;
  expiValue: string;
  languageCode?: string;
  uom?: string;
}

export interface AttributeSegment {
  paid: string; // PAdb Part Attribute ID
  value: string;
  uom?: string; // must validate via MetaUOMCodes
}

export interface PackageSegment {
  packageUom: string;
  packageQuantity: number;
  packageLength?: number;
  packageWidth?: number;
  packageHeight?: number;
  packageWeight?: number;
  dimensionUom?: string; // MetaUOMCodes
  weightUom?: string; // MetaUOMCodes
}

export interface KitSegment {
  kitMasterPartNo: string;
  kitComponentPartNo: string;
  kitComponentQuantity: number;
  kitComponentUom?: string; // MetaUOMCodes
  brand?: string;
  partType?: string;
  soldSep?: string;
  description?: string;
}

export interface InterchangeSegment {
  interchangeType: string;
  brandAaiaId?: string;
  brandLabel?: string;
  partNo: string;
}

export interface DigitalAssetSegment {
  fileName?: string;
  fileType?: string;
  assetType: string; // P04, P01 etc
  uri: string;
  representation?: string;
  assetDescription?: string;
}

export interface PIESData {
  item: ItemSegment;
  descriptions: DescriptionSegment[];
  prices: PriceSegment[];
  expi: EXPISegment[];
  attributes: AttributeSegment[];
  packages: PackageSegment[];
  kits: KitSegment[];
  interchange: InterchangeSegment[];
  digitalAssets: DigitalAssetSegment[];
}

interface PIESBuilderProps {
  value?: PIESData;
  onChange?: (data: PIESData) => void;
  partTerminologyId?: string; // PCdb PartTerminologyID to filter PAIDs
  // Optional: render a specific segment controlled by parent tabs
  activeTab?: 'Item' | 'Descriptions' | 'Prices' | 'EXPI' | 'Attributes' | 'Packages' | 'Kits' | 'Interchange' | 'Assets';
}

export const PIESBuilder: React.FC<PIESBuilderProps> = ({ value, onChange, partTerminologyId, activeTab }) => {
  // When no activeTab is provided, default to 'Item'.
  const currentTab: 'Item' | 'Descriptions' | 'Prices' | 'EXPI' | 'Attributes' | 'Packages' | 'Kits' | 'Interchange' | 'Assets' = activeTab || 'Item';

  // Base data
  const [data, setData] = useState<PIESData>(
    value || {
      item: { brandId: '', partNo: '' },
      descriptions: [],
      prices: [],
      expi: [],
      attributes: [],
      packages: [],
      kits: [],
      interchange: [],
      digitalAssets: []
    }
  );

  // PAdb tables for validation
  const [padb, setPadb] = useState<{ [key: string]: any[] }>({});
  const [pcdb, setPcdb] = useState<{ partTypes: any[]; categories: any[] }>({ partTypes: [], categories: [] });
  const [brands, setBrands] = useState<any[]>([]);

  useEffect(() => {
    // Load PAdb, PCdb, Brands
    Promise.all([
      fetch('/api/databases/padb/PartAttributes').then(r => r.json()),
      fetch('/api/databases/padb/PartAttributeAssignment').then(r => r.json()),
      fetch('/api/databases/padb/MetaUOMCodes').then(r => r.json()),
      fetch('/api/databases/padb/MetaUOMCodeAssignment').then(r => r.json()),
      fetch('/api/databases/padb/ValidValues').then(r => r.json()),
      fetch('/api/databases/padb/ValidValueAssignment').then(r => r.json()),
      fetch('/api/databases/padb/MeasurementGroup').then(r => r.json()),
      fetch('/api/aces-corrected/part-types').then(r => r.json()),
      fetch('/api/aces-corrected/pcdb/categories').then(r => r.json()),
      fetch('/api/reference/brands').then(r => r.json())
    ]).then(([partAttributes, paa, uoms, uomAssign, validValues, validValueAssign, mGroups, partTypes, categories, brandRows]) => {
      setPadb({
        PartAttributes: partAttributes.data || [],
        PartAttributeAssignment: paa.data || [],
        MetaUOMCodes: uoms.data || [],
        MetaUOMCodeAssignment: uomAssign.data || [],
        ValidValues: validValues.data || [],
        ValidValueAssignment: validValueAssign.data || [],
        MeasurementGroup: mGroups.data || []
      });
      setPcdb({ partTypes, categories });
      setBrands(brandRows || []);
    }).catch(() => {
      setPadb({});
      setPcdb({ partTypes: [], categories: [] });
      setBrands([]);
    });
  }, []);

  // Build quick lookups
  const paidMap = useMemo(() => {
    const map = new Map<string, any>();
    (padb.PartAttributes || []).forEach((row: any) => map.set(row.PAID, row));
    return map;
  }, [padb.PartAttributes]);

  const uomCodeMap = useMemo(() => {
    const map = new Map<string, any>();
    (padb.MetaUOMCodes || []).forEach((r: any) => map.set(r.UOMCode, r));
    return map;
  }, [padb.MetaUOMCodes]);

  const allowedPAIDsForPart = useMemo(() => {
    const currentPartType = data.item.partType || partTerminologyId;
    if (!currentPartType) return [] as string[];
    return (padb.PartAttributeAssignment || [])
      .filter((row: any) => String(row.PartTerminologyID) === String(currentPartType))
      .map((row: any) => String(row.PAID));
  }, [padb.PartAttributeAssignment, partTerminologyId, data.item.partType]);

  // Validation helpers
  const isValidPAID = (paid: string) => paidMap.has(paid);
  const isPAIDAllowedForPart = (paid: string) => !partTerminologyId || allowedPAIDsForPart.includes(paid);
  const isValidUOM = (uom?: string) => !uom || uomCodeMap.has(uom);

  const update = (partial: Partial<PIESData>) => {
    const next = { ...data, ...partial } as PIESData;
    setData(next);
    onChange?.(next);
  };

  const addAttribute = () => update({ attributes: [...data.attributes, { paid: '', value: '' }] });
  const addDescription = () => update({ descriptions: [...data.descriptions, { descriptionCode: 'DES', description: '' }] });
  const addPrice = () => update({ prices: [...data.prices, { priceType: 'LIST', price: 0, currency: 'USD' }] });
  const addEXPI = () => update({ expi: [...data.expi, { expiCode: '', expiValue: '' }] });
  const addPackage = () => update({ packages: [...data.packages, { packageUom: 'EA', packageQuantity: 1 }] });
  const addKit = () => update({ kits: [...data.kits, { kitMasterPartNo: '', kitComponentPartNo: '', kitComponentQuantity: 1 }] });
  const addInterchange = () => update({ interchange: [...data.interchange, { interchangeType: 'UP', partNo: '' }] });
  const addAsset = () => update({ digitalAssets: [...data.digitalAssets, { assetType: 'P04', uri: '' }] });

  // UI helpers
  const attributeOptions = useMemo(() => {
    const all = (padb.PartAttributes || []).map((r: any) => ({ value: r.PAID, label: `${r.PAID} - ${r.PAName || ''}` }));
    if (!partTerminologyId) return all;
    const allowed = new Set(allowedPAIDsForPart);
    return all.filter(opt => allowed.has(opt.value));
  }, [padb.PartAttributes, allowedPAIDsForPart, partTerminologyId]);

  const uomOptions = useMemo(() => (padb.MetaUOMCodes || []).map((r: any) => ({ value: r.UOMCode, label: `${r.UOMCode} - ${r.UOMLabel || r.UOMDescription || ''}` })), [padb.MetaUOMCodes]);

  // Quick-add form state for non-Item segments
  const [newDescription, setNewDescription] = useState<{ code: string; lang: string; desc: string }>({ code: 'DES', lang: 'EN', desc: '' });
  const [editDescIndex, setEditDescIndex] = useState<number | null>(null);
  const [editDescDraft, setEditDescDraft] = useState<{ code: string; lang: string; desc: string }>({ code: 'DES', lang: 'EN', desc: '' });
  const [newPrice, setNewPrice] = useState<{ type: string; price: string; currency: string; uom: string }>({ type: 'LST', price: '0.00', currency: 'USD', uom: '' });
  const [newEXPI, setNewEXPI] = useState<{ code: string; language: string; data: string }>({ code: '', language: 'EN', data: '' });
  const [newInterchange, setNewInterchange] = useState<{ type: string; aaia: string; label: string; part: string }>({ type: 'UP', aaia: '', label: '', part: '' });
  const [newAttribute, setNewAttribute] = useState<{ paid: string; paName: string; uom: string; style: string; language: string; data: string; filterMode: 'filter' | 'all' | 'custom' }>({ paid: '', paName: '', uom: '', style: '', language: 'EN', data: '', filterMode: 'filter' });
  const [editAttrIndex, setEditAttrIndex] = useState<number | null>(null);
  const [editAttrDraft, setEditAttrDraft] = useState<{ paid: string; paName: string; uom: string; style: string; language: string; data: string; filterMode: 'filter' | 'all' | 'custom' }>({ paid: '', paName: '', uom: '', style: '', language: 'EN', data: '', filterMode: 'filter' });
  const [newPackage, setNewPackage] = useState({ packQty: '1', uom: '', height: '', width: '', length: '', dimUom: '', weight: '', weightUom: '' });

  // Validation helpers for Item Segment
  const isValidPartNumber = (s: string) => typeof s === 'string' && s.trim().length > 0 && s.trim().length <= 50;
  const isValidGTIN = (s?: string) => {
    if (!s) return true; // optional
    const digits = s.replace(/\D/g, '');
    if (![8,12,13,14].includes(digits.length)) return false;
    // GS1 mod10 (weights 3/1 alternating from right, excluding check digit)
    const checkDigit = parseInt(digits[digits.length - 1]);
    let sum = 0;
    const len = digits.length;
    for (let i = 0; i < len - 1; i++) {
      const n = parseInt(digits[i]);
      // If position from right excluding check is odd -> weight 3
      const posFromRight = (len - 1) - i;
      const weight = (posFromRight % 2 === 1) ? 3 : 1;
      sum += n * weight;
    }
    const calc = (10 - (sum % 10)) % 10;
    return calc === checkDigit;
  };
  const isValidUNSPSC = (s?: string) => !s || /^[0-9]{8}$/.test(s);
  const isValidVMRSFormat = (s?: string) => !s || /^[0-9]{4,6}$/.test(s);
  const brandExists = (id: string) => brands.some((b: any) => b.brandId === id);
  const partTypeRow = (id?: string) => pcdb.partTypes.find((p: any) => p.PartTerminologyID === id);
  const categoryNameById = (id?: string) => pcdb.categories.find((c: any) => c.CategoryID === id)?.CategoryName || '';

  const renderItemTab = () => (
    <div className="space-y-4 max-w-5xl">
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Part Number (B01)</label>
          <input className={`w-full p-2 border rounded text-sm ${!isValidPartNumber(data.item.partNo) ? 'border-red-400' : ''}`} value={data.item.partNo} onChange={e => update({ item: { ...data.item, partNo: e.target.value.toUpperCase() } })} placeholder="Max 50 chars" style={{textTransform: 'uppercase'}} />
          {!isValidPartNumber(data.item.partNo) && <p className="text-xs text-red-600 mt-1">Required, max 50 characters</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Base Number (B02)</label>
          <input className="w-full p-2 border rounded text-sm" value={data.item.baseItemNo || ''} onChange={e => update({ item: { ...data.item, baseItemNo: e.target.value } })} />
        </div>
        <div>
          <label className="block text-sm mb-1">VMRS Code (B03)</label>
          <input className={`w-full p-2 border rounded text-sm ${!isValidVMRSFormat(data.item.vmrsCode) ? 'border-yellow-400' : ''}`} value={data.item.vmrsCode || ''} onChange={e => update({ item: { ...data.item, vmrsCode: e.target.value } })} placeholder="Digits" />
          {data.item.vmrsCode && !isValidVMRSFormat(data.item.vmrsCode) && <p className="text-xs text-yellow-700 mt-1">Format invalid; VMRS DB validation not available</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">GTIN (B04)</label>
          <input className={`w-full p-2 border rounded text-sm ${!isValidGTIN(data.item.gtin) ? 'border-red-400' : ''}`} value={data.item.gtin || ''} onChange={e => update({ item: { ...data.item, gtin: e.target.value } })} placeholder="GTIN-8/12/13/14" />
          {data.item.gtin && !isValidGTIN(data.item.gtin) && <p className="text-xs text-red-600 mt-1">Invalid GTIN</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Brand (B05)</label>
          <SearchableSelect options={brands.map((b: any) => ({ value: b.brandId, label: ((b.brandId || "") + " - " + (b.brandName || "")) }))} value={data.item.brandId} onChange={(val)=> update({ item: { ...data.item, brandId: val } })} placeholder="Select Brand" />
          {data.item.brandId && !brandExists(data.item.brandId) && <p className="text-xs text-red-600 mt-1">Brand not found in BrandTable</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Sub Brand (B06)</label>
          <input className="w-full p-2 border rounded text-sm" value={data.item.subBrandId || ''} onChange={e => update({ item: { ...data.item, subBrandId: e.target.value } })} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Part Type (B07)</label>
          <SearchableSelect options={pcdb.partTypes.map((p: any) => ({ value: p.PartTerminologyID, label: `${p.PartTerminologyID} - ${p.PartTerminologyName || ''}` }))} value={data.item.partType || ''} onChange={(val)=> {
            const row = partTypeRow(val);
            update({ item: { ...data.item, partType: val, categoryId: row?.CategoryID } });
          }} placeholder="Select Part Type" />
          {data.item.partType && !partTypeRow(data.item.partType) && <p className="text-xs text-red-600 mt-1">Invalid Part Type</p>}
        </div>
        <div>
          <label className="block text-sm mb-1">Category (B08)</label>
          <input className="w-full p-2 border rounded text-sm bg-gray-50" value={categoryNameById(data.item.categoryId)} readOnly placeholder="Auto-populated" />
        </div>
        <div>
          <label className="block text-sm mb-1">UNSPSC (B09)</label>
          <input className={`w-full p-2 border rounded text-sm ${!isValidUNSPSC(data.item.unspsc) ? 'border-red-400' : ''}`} value={data.item.unspsc || ''} onChange={e => update({ item: { ...data.item, unspsc: e.target.value } })} placeholder="8 digits" />
          {data.item.unspsc && !isValidUNSPSC(data.item.unspsc) && <p className="text-xs text-red-600 mt-1">UNSPSC must be 8 digits</p>}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm mb-1">Item Qty Size</label>
          <input className="w-full p-2 border rounded text-sm" value={data.item.itemQtySize || ''} onChange={e => update({ item: { ...data.item, itemQtySize: e.target.value } })} />
        </div>
        <div>
          <label className="block text-sm mb-1">Item Qty UOM</label>
          <SearchableSelect options={uomOptions} value={data.item.itemQtyUom || ''} onChange={(val) => update({ item: { ...data.item, itemQtyUom: val } })} placeholder="Select UOM" />
          {!isValidUOM(data.item.itemQtyUom) && <p className="text-xs text-red-600 mt-1">Invalid UOM</p>}
        </div>
      </div>
    </div>
  );

  const renderDescriptionsTab = () => {
    const codeMeta: Array<[string, number, string]> = [
      ['ABR',12,'Product Description - Abbreviated'],
      ['APS',240,'Application Summary'],
      ['ASC',2000,'Associated Comments'],
      ['ASM',2000,'Application Summary (Long)'],
      ['CAP',240,'Caption'],
      ['DEF',80,'AAIA Part Type Description'],
      ['DES',80,'Product Description - Long'],
      ['EXT',240,'Product Description - Extended'],
      ['FAB',240,'Features and Benefits'],
      ['INV',40,'Product Description - Invoice'],
      ['KEY',2000,'Key Search Words'],
      ['KSW',80,'Key Search Word'],
      ['LAB',80,'Label Description'],
      ['MKT',2000,'Marketing Description'],
      ['SHO',20,'Product Description - Short'],
      ['SHP',2000,'Shipping Restrictions'],
      ['SLA',2000,'Slang Description'],
      ['SLD',80,'Slang Description'],
      ['TLE',80,'Title'],
      ['TRA',2000,'Transcription'],
      ['TTD',2000,'Technical Tips - Marketing Description'],
      ['TTP',240,'Technical Tips'],
      ['UNS',80,'UN/SPSC Description'],
      ['VMR',80,'VMRS Description']
    ];
    const maxLen = (() => {
      const map: Record<string, number> = {
        ABR: 12, APS: 240, ASC: 2000, ASM: 2000, CAP: 240, DEF: 80, DES: 80, EXT: 240,
        FAB: 240, INV: 40, KEY: 2000, KSW: 80, LAB: 80, MKT: 2000, SHO: 20, SHP: 2000,
        SLA: 2000, SLD: 80, TLE: 80, TRA: 2000, TTD: 2000, TTP: 240, UNS: 80, VMR: 80
      };
      return map[newDescription.code] ?? 80;
    })();
    const CodeOptions = codeMeta.map(([c]) => ({ value: c, label: c }));
    const LanguageOptions = [
      { value: 'EN', label: 'EN' },
      { value: 'FR', label: 'FR' },
      { value: 'ES', label: 'ES' }
    ];
    return (
      <div className="space-y-4 max-w-5xl">
        <h4 className="text-base font-medium text-gray-900">Add Description</h4>
        <div className="grid grid-cols-12 gap-3 items-start">
          <div className="col-span-3">
            <label className="block text-xs mb-1">Code</label>
            <SearchableSelect options={CodeOptions} value={newDescription.code} onChange={(val)=>setNewDescription({ ...newDescription, code: val })} placeholder="Select Code" />
            <div className="text-xs text-gray-500 mt-1">
              {(() => {
                const meta = codeMeta.find(x => x[0] === newDescription.code);
                return meta ? `Max ${meta[1]} â€” ${meta[2]}` : '';
              })()}
            </div>
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1">Language</label>
            <SearchableSelect options={LanguageOptions} value={newDescription.lang || 'EN'} onChange={(val)=>setNewDescription({ ...newDescription, lang: val })} placeholder="EN" />
          </div>
          <div className="col-span-6">
            <label className="block text-xs mb-1">Description</label>
            <textarea rows={3} maxLength={maxLen} className="p-2 border rounded text-sm w-full" value={newDescription.desc}
              onChange={e=>setNewDescription({ ...newDescription, desc: e.target.value })} />
            <div className="text-xs text-gray-500 mt-1">{newDescription.desc.length}/{maxLen}</div>
          </div>
          <button className="col-span-1 self-start mt-6 px-4 py-2 border rounded text-sm whitespace-nowrap" onClick={()=>{
            if(!newDescription.desc.trim()) return; 
            update({ descriptions:[...data.descriptions,{ descriptionCode:newDescription.code, description:newDescription.desc, languageCode: (newDescription.lang || 'EN') }]}); 
            setNewDescription({ code: 'DES', desc: '', lang: 'EN' } as any);
          }}>Add</button>
        </div>
        <h4 className="text-base font-medium text-gray-900 mt-6">Current Descriptions</h4>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Code</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Language</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Description</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.descriptions.map((d, idx) => {
                const isEditing = editDescIndex === idx;
                const rowMax = (() => {
                  const found = codeMeta.find(x => x[0] === (isEditing ? editDescDraft.code : d.descriptionCode));
                  return found ? found[1] : 80;
                })();
                const codeOptions = codeMeta.map(([c]) => ({ value: c, label: c }));
                return (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-sm align-top">
                      {isEditing ? (
                        <SearchableSelect options={codeOptions} value={editDescDraft.code} onChange={(val)=>setEditDescDraft({ ...editDescDraft, code: val })} placeholder="Code" />
                      ) : d.descriptionCode}
                    </td>
                    <td className="px-3 py-2 text-sm align-top">
                      {isEditing ? (
                        <SearchableSelect options={[{value:'EN',label:'EN'},{value:'FR',label:'FR'},{value:'ES',label:'ES'}]} value={editDescDraft.lang || 'EN'} onChange={(val)=>setEditDescDraft({ ...editDescDraft, lang: val })} placeholder="Lang" />
                      ) : (d.languageCode || 'EN')}
                    </td>
                    <td className="px-3 py-2 text-sm">
                      {isEditing ? (
                        rowMax > 120 ? (
                          <textarea rows={3} maxLength={rowMax} className="w-full p-2 border rounded text-sm" value={editDescDraft.desc} onChange={(e)=>setEditDescDraft({ ...editDescDraft, desc: e.target.value })} />
                        ) : (
                          <input maxLength={rowMax} className="w-full p-2 border rounded text-sm" value={editDescDraft.desc} onChange={(e)=>setEditDescDraft({ ...editDescDraft, desc: e.target.value })} />
                        )
                      ) : d.description}
                      {isEditing && (
                        <div className="text-xs text-gray-500 mt-1">{editDescDraft.desc.length}/{rowMax}</div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                      {isEditing ? (
                        <>
                          <button className="px-2 py-1 mr-2 border rounded text-xs" onClick={()=>{
                            const next = [...data.descriptions];
                            next[idx] = { descriptionCode: editDescDraft.code, languageCode: editDescDraft.lang || 'EN', description: editDescDraft.desc } as any;
                            update({ descriptions: next });
                            setEditDescIndex(null);
                          }}>Save</button>
                          <button className="px-2 py-1 border rounded text-xs" onClick={()=>setEditDescIndex(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="px-2 py-1 mr-2 border rounded text-xs" onClick={()=>{
                            setEditDescIndex(idx);
                            setEditDescDraft({ code: d.descriptionCode, lang: d.languageCode || 'EN', desc: d.description });
                          }}>Edit</button>
                          <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={()=>{
                            const next = data.descriptions.filter((_, i) => i !== idx);
                            update({ descriptions: next });
                            if (editDescIndex === idx) setEditDescIndex(null);
                          }}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPricesTab = () => {
    return (
      <div className="space-y-4 max-w-5xl">
        <h4 className="text-base font-medium text-gray-900">Add Price</h4>
        <div className="grid grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs mb-1">Price</label>
            <input className="w-full p-2 border rounded text-sm" type="number" step="0.01" value={newPrice.price} onChange={e=>setNewPrice({ ...newPrice, price: parseFloat(e.target.value||'0').toFixed(2) })} placeholder="0.00" />
          </div>
          <div>
            <label className="block text-xs mb-1">UOM</label>
            <select className="w-full p-2 border rounded text-sm" value={newPrice.uom} onChange={e=>setNewPrice({ ...newPrice, uom: e.target.value })}>
              <option value="">Select Price UOM</option>
              <option value="EA">Each</option>
              <option value="HU">Hundred</option>
              <option value="TH">Thousand</option>
              <option value="PR">Pair</option>
              <option value="ST">Set</option>
              <option value="KT">Kit</option>
              <option value="PK">Pack</option>
              <option value="CS">Case</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Type</label>
            <select className="w-full p-2 border rounded text-sm" value={newPrice.type} onChange={e=>setNewPrice({ ...newPrice, type: e.target.value })}>
              <option value="AC1">AC1 - Special Additional Cost 1</option>
              <option value="AC2">AC2 - Special Additional Cost 2</option>
              <option value="CR1">CR1 - Core 1</option>
              <option value="CR2">CR2 - Core 2</option>
              <option value="DLR">DLR - Dealer</option>
              <option value="JBR">JBR - Jobber</option>
              <option value="LST">LST - List</option>
              <option value="RET">RET - Retail</option>
              <option value="USD">USD - US Dollar</option>
              <option value="WLS">WLS - Wholesaler</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Currency</label>
            <select className="w-full p-2 border rounded text-sm" value={newPrice.currency} onChange={e=>setNewPrice({ ...newPrice, currency: e.target.value })}>
              <option value="USD">USD - US Dollar</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - Pound Sterling</option>
              <option value="JPY">JPY - Yen</option>
              <option value="CNY">CNY - Yuan Renminbi</option>
              <option value="MXN">MXN - Mexican Peso</option>
            </select>
          </div>
          <button className="px-4 py-2 border rounded text-sm" onClick={()=>{
            update({ prices:[...data.prices,{ priceType: newPrice.type, price: parseFloat(newPrice.price||'0'), currency: newPrice.currency, priceUom: newPrice.uom||undefined }]});
            setNewPrice({ type: 'LST', price: '0.00', currency: 'USD', uom: '' });
          }}>Add</button>
        </div>
        <h4 className="text-base font-medium text-gray-900 mt-6">Current Prices</h4>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Type</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Price</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Currency</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">UOM</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.prices.map((p, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{p.priceType}</td>
                  <td className="px-3 py-2 text-sm">{p.price}</td>
                  <td className="px-3 py-2 text-sm">{p.currency}</td>
                  <td className="px-3 py-2 text-sm">{p.priceUom || '-'}</td>
                  <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                    <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                      const next = data.prices.filter((_, i) => i !== idx);
                      update({ prices: next });
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderEXPI = () => {
    return (
      <div className="space-y-4 max-w-5xl">
        <h4 className="text-base font-medium text-gray-900">Add EXPI</h4>
        <div className="grid grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs mb-1">Code</label>
            <input className="w-full p-2 border rounded text-sm" value={newEXPI.code} onChange={e=>setNewEXPI({ ...newEXPI, code: e.target.value })} placeholder="EXPI Code" />
          </div>
          <div>
            <label className="block text-xs mb-1">Language</label>
            <select className="w-full p-2 border rounded text-sm" value={newEXPI.language} onChange={e=>setNewEXPI({ ...newEXPI, language: e.target.value })}>
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Data</label>
            <input className="w-full p-2 border rounded text-sm" value={newEXPI.data} onChange={e=>setNewEXPI({ ...newEXPI, data: e.target.value })} placeholder="EXPI Data" />
          </div>
          <button className="px-4 py-2 border rounded text-sm" onClick={()=>{
            if(!newEXPI.code.trim()) return; 
            update({ expi:[...data.expi, { expiCode: newEXPI.code.trim(), expiValue: newEXPI.data, languageCode: newEXPI.language }]});
            setNewEXPI({ code: '', language: 'EN', data: '' });
          }}>Add</button>
        </div>
        <h4 className="text-base font-medium text-gray-900 mt-6">Current EXPI</h4>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Code</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Language</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Data</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.expi.map((e, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{e.expiCode}</td>
                  <td className="px-3 py-2 text-sm">{e.languageCode || 'EN'}</td>
                  <td className="px-3 py-2 text-sm">{e.expiValue}</td>
                  <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                    <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                      const next = data.expi.filter((_, i) => i !== idx);
                      update({ expi: next });
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAttributes = () => {
    // Debug: log the current part type and available assignments
    console.log('Current partTerminologyId:', partTerminologyId);
    console.log('PartAttributeAssignment data:', padb.PartAttributeAssignment);
    console.log('Allowed PAIDs for part:', allowedPAIDsForPart);
    
    const filteredAttributeOptions = newAttribute.filterMode === 'filter' ? attributeOptions : 
                                   newAttribute.filterMode === 'all' ? (padb.PartAttributes || []).map((r: any) => ({ value: r.PAID, label: `${r.PAID} - ${r.PAName || ''}` })) : [];
    
    console.log('Filtered options:', filteredAttributeOptions);
    const selectedPAName = newAttribute.paid ? paidMap.get(newAttribute.paid)?.PAName || '' : '';
    const displayPAName = newAttribute.filterMode === 'filter' ? selectedPAName : newAttribute.paName;

    return (
      <div className="space-y-4 max-w-5xl">
        <h4 className="text-base font-medium text-gray-900">Add Attribute</h4>
        
        <div className="flex gap-4">
          <label className="flex items-center">
            <input type="radio" name="attrMode" checked={newAttribute.filterMode === 'filter'} onChange={() => setNewAttribute({ ...newAttribute, filterMode: 'filter', paid: '', paName: '' })} className="mr-2" />
            <span className="text-sm">Filter PAID {(data.item.partType || partTerminologyId) && `(Part Type: ${data.item.partType || partTerminologyId}) - ${allowedPAIDsForPart.length} available`}</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="attrMode" checked={newAttribute.filterMode === 'all'} onChange={() => setNewAttribute({ ...newAttribute, filterMode: 'all', paid: '', paName: '' })} className="mr-2" />
            <span className="text-sm">Filter PAID (All - Not Filtered By Part Type) - {(padb.PartAttributes || []).length} total</span>
          </label>
          <label className="flex items-center">
            <input type="radio" name="attrMode" checked={newAttribute.filterMode === 'custom'} onChange={() => setNewAttribute({ ...newAttribute, filterMode: 'custom', paid: '', paName: '' })} className="mr-2" />
            <span className="text-sm">Custom (No PAID)</span>
          </label>
        </div>

        <div className="grid grid-cols-5 gap-3">
          <div>
            <label className="block text-xs mb-1">PAID</label>
            {newAttribute.filterMode !== 'custom' ? (
              <SearchableSelect options={filteredAttributeOptions} value={newAttribute.paid} onChange={(val) => {
                // Find PAPTID for this PAID and PartTerminologyID combination
                const currentPartType = data.item.partType || partTerminologyId;
                const paptidRow = (padb.PartAttributeAssignment || []).find((row: any) => 
                  String(row.PAID) === String(val) && 
                  (!currentPartType || String(row.PartTerminologyID) === String(currentPartType))
                );
                
                // Find UOM assignments for this PAPTID
                const uomAssignments = (padb.MetaUOMCodeAssignment || []).filter((u: any) => 
                  String(u.PAPTID) === String(paptidRow?.PAPTID)
                );
                
                // Get the first UOM code if available
                let suggestedUom = '';
                if (uomAssignments.length > 0) {
                  const metaUomId = uomAssignments[0].MetaUomID;
                  const uomCode = (padb.MetaUOMCodes || []).find((u: any) => String(u.MetaUOMID) === String(metaUomId));
                  suggestedUom = uomCode?.UOMCode || '';
                }
                
                setNewAttribute({ ...newAttribute, paid: val, uom: suggestedUom });
              }} placeholder="Select PAID" />
            ) : (
              <input className="w-full p-2 border rounded text-sm bg-gray-100" value="" readOnly placeholder="Custom mode" />
            )}
          </div>
          <div>
            <label className="block text-xs mb-1">PA Name</label>
            {newAttribute.filterMode !== 'custom' ? (
              <input className="w-full p-2 border rounded text-sm bg-gray-50" value={displayPAName} readOnly placeholder="Auto from PAID" />
            ) : (
              <input className="w-full p-2 border rounded text-sm" value={newAttribute.paName} onChange={(e) => setNewAttribute({ ...newAttribute, paName: e.target.value })} placeholder="Custom name" />
            )}
          </div>
          <div>
            <label className="block text-xs mb-1">UOM</label>
            <SearchableSelect options={uomOptions} value={newAttribute.uom} onChange={(val) => setNewAttribute({ ...newAttribute, uom: val })} placeholder="Select UOM" />
          </div>
          <div>
            <label className="block text-xs mb-1">Style</label>
            <input className="w-full p-2 border rounded text-sm" value={newAttribute.style} onChange={(e) => setNewAttribute({ ...newAttribute, style: e.target.value })} placeholder="Style" />
          </div>
          <div>
            <label className="block text-xs mb-1">Language</label>
            <select className="w-full p-2 border rounded text-sm" value={newAttribute.language} onChange={(e) => setNewAttribute({ ...newAttribute, language: e.target.value })}>
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-6 gap-3 items-end">
          <div className="col-span-5">
            <label className="block text-xs mb-1">Data</label>
            <textarea rows={2} className="w-full p-2 border rounded text-sm" value={newAttribute.data} onChange={(e) => setNewAttribute({ ...newAttribute, data: e.target.value })} placeholder="Attribute data/value" />
          </div>
          <button className="px-4 py-2 border rounded text-sm" onClick={() => {
            if (!newAttribute.data.trim()) return;
            const newAttr = {
              paid: newAttribute.filterMode !== 'custom' ? newAttribute.paid : '',
              value: newAttribute.data,
              uom: newAttribute.uom || undefined
            };
            update({ attributes: [...data.attributes, newAttr] });
            setNewAttribute({ paid: '', paName: '', uom: '', style: '', language: 'EN', data: '', filterMode: 'filter' });
          }}>Add</button>
        </div>

        <h4 className="text-base font-medium text-gray-900 mt-6">Current Attributes</h4>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">PAID</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">PA Name</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">UOM</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Data</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.attributes.map((a, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{a.paid || '-'}</td>
                  <td className="px-3 py-2 text-sm">{a.paid ? paidMap.get(a.paid)?.PAName || '' : '-'}</td>
                  <td className="px-3 py-2 text-sm">{a.uom || '-'}</td>
                  <td className="px-3 py-2 text-sm">{a.value}</td>
                  <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                    {editAttrIndex === idx ? (
                      <>
                        <button className="px-2 py-1 mr-2 border rounded text-xs" onClick={() => {
                          const next = [...data.attributes];
                          next[idx] = { paid: editAttrDraft.paid, value: editAttrDraft.data, uom: editAttrDraft.uom };
                          update({ attributes: next });
                          setEditAttrIndex(null);
                        }}>Save</button>
                        <button className="px-2 py-1 border rounded text-xs" onClick={() => setEditAttrIndex(null)}>Cancel</button>
                      </>
                    ) : (
                      <>
                        <button className="px-2 py-1 mr-2 border rounded text-xs" onClick={() => {
                          setEditAttrIndex(idx);
                          setEditAttrDraft({ paid: a.paid, paName: a.paid ? paidMap.get(a.paid)?.PAName || '' : '', uom: a.uom || '', style: '', language: 'EN', data: a.value, filterMode: 'filter' });
                        }}>Edit</button>
                        <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                          const next = data.attributes.filter((_, i) => i !== idx);
                          update({ attributes: next });
                          if (editAttrIndex === idx) setEditAttrIndex(null);
                        }}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderPackages = () => (
    <div className="space-y-4 max-w-5xl">
      <h4 className="text-base font-medium text-gray-900">Add Package</h4>
      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-xs mb-1">Pack Qty</label>
          <input className="w-full p-2 border rounded text-sm" type="number" value={newPackage.packQty} onChange={e=>setNewPackage({...newPackage, packQty: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs mb-1">UOM</label>
          <SearchableSelect options={uomOptions} value={newPackage.uom} onChange={(val)=>setNewPackage({...newPackage, uom: val})} placeholder="Select UOM" />
        </div>
        <div>
          <label className="block text-xs mb-1">Weight</label>
          <input className="w-full p-2 border rounded text-sm" type="number" step="0.01" value={newPackage.weight} onChange={e=>setNewPackage({...newPackage, weight: e.target.value})} />
        </div>
        <div>
          <label className="block text-xs mb-1">Weight UOM</label>
          <SearchableSelect options={uomOptions} value={newPackage.weightUom} onChange={(val)=>setNewPackage({...newPackage, weightUom: val})} placeholder="Weight UOM" />
        </div>
        <div className="col-span-4">
          <button className="px-4 py-2 border rounded text-sm" onClick={()=>{
            update({ packages:[...data.packages, { packageQuantity: parseInt(newPackage.packQty||'1'), packageUom: newPackage.uom, packageWeight: parseFloat(newPackage.weight||'0'), weightUom: newPackage.weightUom }]});
            setNewPackage({ packQty: '1', uom: '', height: '', width: '', length: '', dimUom: '', weight: '', weightUom: '' });
          }}>Add Package</button>
        </div>
      </div>
      <h4 className="text-base font-medium text-gray-900 mt-6">Current Packages</h4>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs text-gray-500">Pack Qty</th>
              <th className="px-3 py-2 text-left text-xs text-gray-500">UOM</th>
              <th className="px-3 py-2 text-left text-xs text-gray-500">Weight</th>
              <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.packages.map((p, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 text-sm">{p.packageQuantity}</td>
                <td className="px-3 py-2 text-sm">{p.packageUom}</td>
                <td className="px-3 py-2 text-sm">{p.packageWeight} {p.weightUom}</td>
                <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                  <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                    const next = data.packages.filter((_, i) => i !== idx);
                    update({ packages: next });
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Move newKit state to top level
  const [newKit, setNewKit] = useState({ partNumber: '', brand: '', subBrand: '', cmptId: '', language: 'EN', descCode: '', partType: '', soldSep: 'Yes', description: '' });

  const renderKits = () => {
    
    return (
      <div className="space-y-4 max-w-5xl">
        <h4 className="text-base font-medium text-gray-900">Add Kit Component</h4>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-xs mb-1">Part Number</label>
            <input className="w-full p-2 border rounded text-sm" value={newKit.partNumber} onChange={e=>setNewKit({...newKit, partNumber: e.target.value.toUpperCase()})} style={{textTransform: 'uppercase'}} />
          </div>
          <div>
            <label className="block text-xs mb-1">Brand</label>
            <SearchableSelect options={brands.map((b: any) => ({ value: b.brandId, label: `${b.brandId} - ${b.brandName || ''}` }))} value={newKit.brand} onChange={(val)=>setNewKit({...newKit, brand: val})} placeholder="Select Brand" />
          </div>
          <div>
            <label className="block text-xs mb-1">Sub Brand</label>
            <input className="w-full p-2 border rounded text-sm" value={newKit.subBrand} onChange={e=>setNewKit({...newKit, subBrand: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs mb-1">CMPT ID</label>
            <input className="w-full p-2 border rounded text-sm" value={newKit.cmptId} onChange={e=>setNewKit({...newKit, cmptId: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs mb-1">Language</label>
            <select className="w-full p-2 border rounded text-sm" value={newKit.language} onChange={e=>setNewKit({...newKit, language: e.target.value})}>
              <option value="EN">EN</option>
              <option value="FR">FR</option>
              <option value="ES">ES</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Desc Code</label>
            <input className="w-full p-2 border rounded text-sm" value={newKit.descCode} onChange={e=>setNewKit({...newKit, descCode: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs mb-1">Part Type</label>
            <SearchableSelect options={pcdb.partTypes.map((p: any) => ({ value: p.PartTerminologyID, label: `${p.PartTerminologyID} - ${p.PartTerminologyName || ''}` }))} value={newKit.partType} onChange={(val)=>setNewKit({...newKit, partType: val})} placeholder="Select Part Type" />
          </div>
          <div>
            <label className="block text-xs mb-1">Sold Sep</label>
            <div className="flex gap-2 mt-2">
              <label className="flex items-center"><input type="radio" name="soldSep" checked={newKit.soldSep === 'Yes'} onChange={()=>setNewKit({...newKit, soldSep: 'Yes'})} className="mr-1" />Yes</label>
              <label className="flex items-center"><input type="radio" name="soldSep" checked={newKit.soldSep === 'No'} onChange={()=>setNewKit({...newKit, soldSep: 'No'})} className="mr-1" />No</label>
            </div>
          </div>
          <div className="col-span-4">
            <label className="block text-xs mb-1">Description</label>
            <textarea className="w-full p-2 border rounded text-sm" rows={2} value={newKit.description} onChange={e=>setNewKit({...newKit, description: e.target.value})} />
          </div>
          <div className="col-span-4 flex gap-2">
            <button className="px-4 py-2 border rounded text-sm" onClick={()=>{
              if(!newKit.partNumber.trim()) return;
              update({ kits:[...data.kits, { 
                kitMasterPartNo: data.item.partNo || newKit.partNumber, 
                kitComponentPartNo: newKit.partNumber, 
                kitComponentQuantity: 1,
                brand: newKit.brand,
                partType: newKit.partType,
                soldSep: newKit.soldSep,
                description: newKit.description
              }]});
              setNewKit({ partNumber: '', brand: '', subBrand: '', cmptId: '', language: 'EN', descCode: '', partType: '', soldSep: 'Yes', description: '' });
            }}>Add Kit Component</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">ACES</button>
          </div>
        </div>
        <h4 className="text-base font-medium text-gray-900 mt-6">Current Kit Components</h4>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Part Number</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Brand</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Part Type</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Sold Sep</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Description</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.kits.map((k, idx) => {
                const brandName = k.brand ? brands.find(b => b.brandId === k.brand)?.brandName || k.brand : '-';
                const partTypeName = k.partType ? pcdb.partTypes.find(p => p.PartTerminologyID === k.partType)?.PartTerminologyName || k.partType : '-';
                return (
                  <tr key={idx}>
                    <td className="px-3 py-2 text-sm">{k.kitComponentPartNo}</td>
                    <td className="px-3 py-2 text-sm">{brandName}</td>
                    <td className="px-3 py-2 text-sm">{partTypeName}</td>
                    <td className="px-3 py-2 text-sm">{k.soldSep || '-'}</td>
                    <td className="px-3 py-2 text-sm">{k.description || '-'}</td>
                    <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                      <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                        const next = data.kits.filter((_, i) => i !== idx);
                        update({ kits: next });
                      }}>Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderInterchange = () => {
    return (
      <div className="space-y-4 max-w-5xl">
        <h4 className="text-base font-medium text-gray-900">Add Interchange</h4>
        <div className="grid grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs mb-1">Type</label>
            <select className="w-full p-2 border rounded text-sm" value={newInterchange.type} onChange={e=>setNewInterchange({ ...newInterchange, type: e.target.value })}>
              {['OE','OES','UP','IP'].map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Brand AAIA</label>
            <SearchableSelect options={brands.map((b: any) => ({ value: b.brandId, label: `${b.brandId} - ${b.brandName || ''}` }))} value={newInterchange.aaia} onChange={(val)=>{
              const selectedBrand = brands.find((b: any) => b.brandId === val);
              setNewInterchange({ ...newInterchange, aaia: val, label: selectedBrand?.brandName || '' });
            }} placeholder="Select Brand" />
          </div>
          <div>
            <label className="block text-xs mb-1">Brand Label</label>
            <input className="w-full p-2 border rounded text-sm" value={newInterchange.label} onChange={e=>setNewInterchange({ ...newInterchange, label: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs mb-1">Part No</label>
            <input className="w-full p-2 border rounded text-sm" value={newInterchange.part} onChange={e=>setNewInterchange({ ...newInterchange, part: e.target.value.toUpperCase() })} style={{textTransform: 'uppercase'}} />
          </div>
          <button className="px-4 py-2 border rounded text-sm" onClick={()=>{
            if(!newInterchange.part.trim()) return; 
            update({ interchange:[...data.interchange,{ interchangeType:newInterchange.type, brandAaiaId:newInterchange.aaia||undefined, brandLabel:newInterchange.label||undefined, partNo:newInterchange.part }]});
            setNewInterchange({ type: 'UP', aaia: '', label: '', part: '' });
          }}>Add</button>
        </div>
        <h4 className="text-base font-medium text-gray-900 mt-6">Current Interchange</h4>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Type</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Brand AAIA</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Brand Label</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Part No</th>
                <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.interchange.map((i, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{i.interchangeType}</td>
                  <td className="px-3 py-2 text-sm">{i.brandAaiaId || '-'}</td>
                  <td className="px-3 py-2 text-sm">{i.brandLabel || '-'}</td>
                  <td className="px-3 py-2 text-sm">{i.partNo}</td>
                  <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                    <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                      const next = data.interchange.filter((_, i) => i !== idx);
                      update({ interchange: next });
                    }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Asset form state
  const [newAsset, setNewAsset] = useState({ fileName: '', fileType: '', uri: '', assetType: '' });
  const [assetTypes, setAssetTypes] = useState<any[]>([]);
  const [fileTypes, setFileTypes] = useState<any[]>([]);

  // Load asset and file types from ACES CodedValues
  useEffect(() => {
    fetch('/api/databases/aces/CodedValues').then(r => r.json())
      .then(codedValuesData => {
        console.log('CodedValues response:', codedValuesData);
        const codedValues = codedValuesData.data || codedValuesData || [];
        const assetTypes = codedValues.filter((cv: any) => cv.CodeType === 'AssetDetailType');
        const fileTypes = codedValues.filter((cv: any) => cv.CodeType === 'FileType');
        console.log('Asset types:', assetTypes);
        console.log('File types:', fileTypes);
        setAssetTypes(assetTypes);
        setFileTypes(fileTypes);
      }).catch(err => {
        console.error('Failed to load coded values:', err);
        setAssetTypes([]);
        setFileTypes([]);
      });
  }, []);

  const renderAssets = () => (
    <div className="space-y-4 max-w-5xl">
      <h4 className="text-base font-medium text-gray-900">Add Digital Asset</h4>
      <div className="grid grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs mb-1">File Name</label>
          <input className="w-full p-2 border rounded text-sm" value={newAsset.fileName} onChange={e=>setNewAsset({...newAsset, fileName: e.target.value})} placeholder="Perfect-Fitment.png" />
        </div>
        <div>
          <label className="block text-xs mb-1">File Type</label>
          <select className="w-full p-2 border rounded text-sm" value={newAsset.fileType} onChange={e=>setNewAsset({...newAsset, fileType: e.target.value})}>
            <option value="">Select File Type</option>
            {fileTypes.map(ft => (
              <option key={ft.CodeValue} value={ft.CodeValue}>{ft.CodeValue} - {ft.CodeDescription}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">Asset Type</label>
          <select className="w-full p-2 border rounded text-sm" value={newAsset.assetType} onChange={e=>setNewAsset({...newAsset, assetType: e.target.value})}>
            <option value="">Select Asset Type</option>
            {assetTypes.map(at => (
              <option key={at.CodeValue} value={at.CodeValue}>{at.CodeValue} - {at.CodeDescription}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">URI</label>
          <input className="w-full p-2 border rounded text-sm" value={newAsset.uri} onChange={e=>setNewAsset({...newAsset, uri: e.target.value})} placeholder="https://..." />
        </div>
        <div className="col-span-4">
          <button className="px-4 py-2 border rounded text-sm" onClick={()=>{
            if(!newAsset.fileName.trim() || !newAsset.uri.trim()) return;
            update({ digitalAssets:[...data.digitalAssets, { 
              fileName: newAsset.fileName,
              fileType: newAsset.fileType,
              assetType: newAsset.assetType, 
              uri: newAsset.uri 
            }]});
            setNewAsset({ fileName: '', fileType: '', uri: '', assetType: '' });
          }}>Add Asset</button>
        </div>
      </div>
      <h4 className="text-base font-medium text-gray-900 mt-6">Current Digital Assets</h4>
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs text-gray-500">File Name</th>
              <th className="px-3 py-2 text-left text-xs text-gray-500">File Type</th>
              <th className="px-3 py-2 text-left text-xs text-gray-500">Asset Type</th>
              <th className="px-3 py-2 text-left text-xs text-gray-500">URI</th>
              <th className="px-3 py-2 text-right text-xs text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.digitalAssets.map((a, idx) => {
              const fileTypeName = a.fileType ? fileTypes.find(ft => ft.CodeValue === a.fileType)?.CodeDescription || a.fileType : '-';
              const assetTypeName = a.assetType ? assetTypes.find(at => at.CodeValue === a.assetType)?.CodeDescription || a.assetType : '-';
              return (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{a.fileName || '-'}</td>
                  <td className="px-3 py-2 text-sm">{fileTypeName}</td>
                  <td className="px-3 py-2 text-sm">{a.assetType}</td>
                  <td className="px-3 py-2 text-sm truncate max-w-xs">{a.uri}</td>
                  <td className="px-3 py-2 text-sm text-right whitespace-nowrap">
                    <button className="px-2 py-1 border rounded text-xs text-red-700" onClick={() => {
                      const next = data.digitalAssets.filter((_, i) => i !== idx);
                      update({ digitalAssets: next });
                    }}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      {currentTab === 'Item' && renderItemTab()}
      {currentTab === 'Descriptions' && renderDescriptionsTab()}
      {currentTab === 'Prices' && renderPricesTab()}
      {currentTab === 'EXPI' && renderEXPI()}
      {currentTab === 'Attributes' && renderAttributes()}
      {currentTab === 'Packages' && renderPackages()}
      {currentTab === 'Kits' && renderKits()}
      {currentTab === 'Interchange' && renderInterchange()}
      {currentTab === 'Assets' && renderAssets()}
    </div>
  );
};

