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
}

export interface InterchangeSegment {
  interchangeType: string;
  brandAaiaId?: string;
  brandLabel?: string;
  partNo: string;
}

export interface DigitalAssetSegment {
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
    if (!partTerminologyId) return [] as string[];
    return (padb.PartAttributeAssignment || [])
      .filter((row: any) => row.PartTerminologyID === partTerminologyId)
      .map((row: any) => row.PAID);
  }, [padb.PartAttributeAssignment, partTerminologyId]);

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
    const all = (padb.PartAttributes || []).map((r: any) => ({ value: r.PAID, label: `' + (r.PAID) + ' - ' + (r.PAName || '') + '` }));
    if (!partTerminologyId) return all;
    const allowed = new Set(allowedPAIDsForPart);
    return all.filter(opt => allowed.has(opt.value));
  }, [padb.PartAttributes, allowedPAIDsForPart, partTerminologyId]);

  const uomOptions = useMemo(() => (padb.MetaUOMCodes || []).map((r: any) => ({ value: r.UOMCode, label: `' + (r.UOMCode) + ' - ' + (r.UOMLabel || r.UOMDescription || '') + '` })), [padb.MetaUOMCodes]);

  // Quick-add form state for non-Item segments
  const [newDescription, setNewDescription] = useState<{ code: string; lang: string; desc: string }>({ code: 'DES', lang: 'EN', desc: '' });
  const [editDescIndex, setEditDescIndex] = useState<number | null>(null);
  const [editDescDraft, setEditDescDraft] = useState<{ code: string; lang: string; desc: string }>({ code: 'DES', lang: 'EN', desc: '' });
  const [newPrice, setNewPrice] = useState<{ type: string; price: string; currency: string; uom: string }>({ type: 'LIST', price: '0', currency: 'USD', uom: '' });
  const [newEXPI, setNewEXPI] = useState<{ code: string; value: string; uom: string }>({ code: '', value: '', uom: '' });
  const [newInterchange, setNewInterchange] = useState<{ type: string; aaia: string; label: string; part: string }>({ type: 'UP', aaia: '', label: '', part: '' });

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
          <input className={`w-full p-2 border rounded text-sm ${!isValidPartNumber(data.item.partNo) ? 'border-red-400' : ''}`} value={data.item.partNo} onChange={e => update({ item: { ...data.item, partNo: e.target.value } })} placeholder="Max 50 chars" />
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
      <div className="space-y-4 max-w-4xl">
        <div className="grid grid-cols-5 gap-2 items-end">
          <div>
            <label className="block text-xs mb-1">Type</label>
            <select className="p-2 border rounded text-sm w-full" value={newPrice.type} onChange={e=>setNewPrice({ ...newPrice, type: e.target.value })}>
              {['LIST','MSRP','COST','JOBBER'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Price</label>
            <input className="p-2 border rounded text-sm w-full" type="number" value={newPrice.price} onChange={e=>setNewPrice({ ...newPrice, price: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs mb-1">Currency</label>
            <select className="p-2 border rounded text-sm w-full" value={newPrice.currency} onChange={e=>setNewPrice({ ...newPrice, currency: e.target.value })}>
              {['USD','CAD','EUR'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">UOM</label>
            <input className="p-2 border rounded text-sm w-full" value={newPrice.uom} onChange={e=>setNewPrice({ ...newPrice, uom: e.target.value })} />
          </div>
          <button className="px-3 py-2 border rounded text-sm" onClick={()=>{
            update({ prices:[...data.prices,{ priceType: newPrice.type, price: parseFloat(newPrice.price||'0'), currency: newPrice.currency, priceUom: newPrice.uom||undefined }]});
            setNewPrice({ type: 'LIST', price: '0', currency: 'USD', uom: '' });
          }}>Add</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Type</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Price</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Currency</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">UOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.prices.map((p, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{p.priceType}</td>
                  <td className="px-3 py-2 text-sm">{p.price}</td>
                  <td className="px-3 py-2 text-sm">{p.currency}</td>
                  <td className="px-3 py-2 text-sm">{p.priceUom || ''}</td>
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
      <div className="space-y-4 max-w-4xl">
        <div className="grid grid-cols-5 gap-2 items-end">
          <div>
            <label className="block text-xs mb-1">EXPI Code</label>
            <input className="p-2 border rounded text-sm w-full" value={newEXPI.code} onChange={e=>setNewEXPI({ ...newEXPI, code: e.target.value })} placeholder="e.g. COI" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs mb-1">Value</label>
            <input className="p-2 border rounded text-sm w-full" value={newEXPI.value} onChange={e=>setNewEXPI({ ...newEXPI, value: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs mb-1">UOM</label>
            <SearchableSelect options={uomOptions} value={newEXPI.uom} onChange={(v)=>setNewEXPI({ ...newEXPI, uom: v })} placeholder="UOM" />
          </div>
          <button className="px-3 py-2 border rounded text-sm" onClick={()=>{
            if(!newEXPI.code.trim()) return; 
            update({ expi:[...data.expi, { expiCode: newEXPI.code.trim(), expiValue: newEXPI.value, uom: newEXPI.uom||undefined }]});
            setNewEXPI({ code: '', value: '', uom: '' });
          }}>Add</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Code</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Value</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">UOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.expi.map((e, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{e.expiCode}</td>
                  <td className="px-3 py-2 text-sm">{e.expiValue}</td>
                  <td className="px-3 py-2 text-sm">{e.uom || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAttributes = () => (
    <div className="space-y-3 max-w-5xl">
      <div className="flex items-center gap-2">
        <button className="px-3 py-1 border rounded text-sm" onClick={addAttribute}>Add Attribute</button>
        {partTerminologyId && <span className="text-xs text-gray-600">Filtered by PartType {partTerminologyId}</span>}
      </div>
      {data.attributes.map((a, idx) => {
        const paidValid = isValidPAID(a.paid);
        const paidAllowed = isPAIDAllowedForPart(a.paid);
        return (
          <div key={idx} className="grid grid-cols-6 gap-2 items-center">
            <SearchableSelect options={attributeOptions} value={a.paid} onChange={(val)=>{ const next=[...data.attributes]; next[idx]={...a, paid:val}; update({attributes:next}); }} placeholder="PAID" />
            {!paidValid && a.paid && <span className="text-xs text-red-600">Unknown PAID</span>}
            {paidValid && !paidAllowed && <span className="text-xs text-yellow-700">Not assigned to this PartType</span>}
            <input className="p-2 border rounded text-sm col-span-2" placeholder="Value" value={a.value} onChange={e=>{ const next=[...data.attributes]; next[idx]={...a, value:e.target.value}; update({attributes:next}); }} />
            <SearchableSelect options={uomOptions} value={a.uom || ''} onChange={(val)=>{ const next=[...data.attributes]; next[idx]={...a, uom:val}; update({attributes:next}); }} placeholder="UOM" />
            {a.uom && !isValidUOM(a.uom) && <span className="text-xs text-red-600">Invalid UOM</span>}
          </div>
        );
      })}
    </div>
  );

  const renderPackages = () => (
    <div className="space-y-3 max-w-5xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addPackage}>Add Package</button>
      {data.packages.map((p, idx) => (
        <div key={idx} className="grid grid-cols-8 gap-2 items-center">
          <input className="p-2 border rounded text-sm" placeholder="Qty" type="number" value={p.packageQuantity} onChange={e=>{ const next=[...data.packages]; next[idx]={...p, packageQuantity: parseInt(e.target.value||'0')}; update({packages:next}); }} />
          <SearchableSelect options={uomOptions} value={p.packageUom} onChange={(val)=>{ const next=[...data.packages]; next[idx]={...p, packageUom: val}; update({packages:next}); }} placeholder="Pkg UOM" />
          <input className="p-2 border rounded text-sm" placeholder="Len" type="number" value={p.packageLength || ''} onChange={e=>{ const next=[...data.packages]; next[idx]={...p, packageLength: parseFloat(e.target.value||'')}; update({packages:next}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Wid" type="number" value={p.packageWidth || ''} onChange={e=>{ const next=[...data.packages]; next[idx]={...p, packageWidth: parseFloat(e.target.value||'')}; update({packages:next}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Hgt" type="number" value={p.packageHeight || ''} onChange={e=>{ const next=[...data.packages]; next[idx]={...p, packageHeight: parseFloat(e.target.value||'')}; update({packages:next}); }} />
          <SearchableSelect options={uomOptions} value={p.dimensionUom || ''} onChange={(val)=>{ const next=[...data.packages]; next[idx]={...p, dimensionUom: val}; update({packages:next}); }} placeholder="Dim UOM" />
          <input className="p-2 border rounded text-sm" placeholder="Wgt" type="number" value={p.packageWeight || ''} onChange={e=>{ const next=[...data.packages]; next[idx]={...p, packageWeight: parseFloat(e.target.value||'')}; update({packages:next}); }} />
          <SearchableSelect options={uomOptions} value={p.weightUom || ''} onChange={(val)=>{ const next=[...data.packages]; next[idx]={...p, weightUom: val}; update({packages:next}); }} placeholder="Wgt UOM" />
        </div>
      ))}
    </div>
  );

  const renderKits = () => (
    <div className="space-y-3 max-w-4xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addKit}>Add Kit Component</button>
      {data.kits.map((k, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2 items-center">
          <input className="p-2 border rounded text-sm" placeholder="Master PartNo" value={k.kitMasterPartNo} onChange={e=>{ const n=[...data.kits]; n[idx]={...k, kitMasterPartNo:e.target.value}; update({kits:n}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Component PartNo" value={k.kitComponentPartNo} onChange={e=>{ const n=[...data.kits]; n[idx]={...k, kitComponentPartNo:e.target.value}; update({kits:n}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Qty" type="number" value={k.kitComponentQuantity} onChange={e=>{ const n=[...data.kits]; n[idx]={...k, kitComponentQuantity: parseInt(e.target.value||'0')}; update({kits:n}); }} />
          <SearchableSelect options={uomOptions} value={k.kitComponentUom || ''} onChange={(val)=>{ const n=[...data.kits]; n[idx]={...k, kitComponentUom: val}; update({kits:n}); }} placeholder="UOM" />
        </div>
      ))}
    </div>
  );

  const renderInterchange = () => {
    return (
      <div className="space-y-4 max-w-4xl">
        <div className="grid grid-cols-5 gap-2 items-end">
          <div>
            <label className="block text-xs mb-1">Type</label>
            <select className="p-2 border rounded text-sm w-full" value={newInterchange.type} onChange={e=>setNewInterchange({ ...newInterchange, type: e.target.value })}>
              {['OE','OES','UP','IP'].map(x => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1">Brand AAIA</label>
            <input className="p-2 border rounded text-sm w-full" value={newInterchange.aaia} onChange={e=>setNewInterchange({ ...newInterchange, aaia: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs mb-1">Brand Label</label>
            <input className="p-2 border rounded text-sm w-full" value={newInterchange.label} onChange={e=>setNewInterchange({ ...newInterchange, label: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs mb-1">Part No</label>
            <input className="p-2 border rounded text-sm w-full" value={newInterchange.part} onChange={e=>setNewInterchange({ ...newInterchange, part: e.target.value })} />
          </div>
          <button className="px-3 py-2 border rounded text-sm" onClick={()=>{
            if(!newInterchange.part.trim()) return; 
            update({ interchange:[...data.interchange,{ interchangeType:newInterchange.type, brandAaiaId:newInterchange.aaia||undefined, brandLabel:newInterchange.label||undefined, partNo:newInterchange.part }]});
            setNewInterchange({ type: 'UP', aaia: '', label: '', part: '' });
          }}>Add</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Type</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Brand AAIA</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Brand Label</th>
                <th className="px-3 py-2 text-left text-xs text-gray-500">Part No</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.interchange.map((i, idx) => (
                <tr key={idx}>
                  <td className="px-3 py-2 text-sm">{i.interchangeType}</td>
                  <td className="px-3 py-2 text-sm">{i.brandAaiaId || ''}</td>
                  <td className="px-3 py-2 text-sm">{i.brandLabel || ''}</td>
                  <td className="px-3 py-2 text-sm">{i.partNo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAssets = () => (
    <div className="space-y-3 max-w-4xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addAsset}>Add Asset</button>
      {data.digitalAssets.map((a, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-center">
          <input className="p-2 border rounded text-sm" placeholder="Type (P04, P01)" value={a.assetType} onChange={e=>{ const n=[...data.digitalAssets]; n[idx]={...a, assetType:e.target.value}; update({digitalAssets:n}); }} />
          <input className="p-2 border rounded text-sm col-span-2" placeholder="URI" value={a.uri} onChange={e=>{ const n=[...data.digitalAssets]; n[idx]={...a, uri:e.target.value}; update({digitalAssets:n}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Description" value={a.assetDescription || ''} onChange={e=>{ const n=[...data.digitalAssets]; n[idx]={...a, assetDescription:e.target.value}; update({digitalAssets:n}); }} />
        </div>
      ))}
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

