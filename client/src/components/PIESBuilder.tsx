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
}

export const PIESBuilder: React.FC<PIESBuilderProps> = ({ value, onChange, partTerminologyId }) => {
  const [activeTab, setActiveTab] = useState<'Item' | 'Descriptions' | 'Prices' | 'EXPI' | 'Attributes' | 'Packages' | 'Kits' | 'Interchange' | 'Assets'>('Item');

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
    const all = (padb.PartAttributes || []).map((r: any) => ({ value: r.PAID, label: `${r.PAID} — ${r.PAName}` }));
    if (!partTerminologyId) return all;
    const allowed = new Set(allowedPAIDsForPart);
    return all.filter(opt => allowed.has(opt.value));
  }, [padb.PartAttributes, allowedPAIDsForPart, partTerminologyId]);

  const uomOptions = useMemo(() => (padb.MetaUOMCodes || []).map((r: any) => ({ value: r.UOMCode, label: `${r.UOMCode} — ${r.UOMLabel || r.UOMDescription}` })), [padb.MetaUOMCodes]);

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
          <SearchableSelect options={brands.map((b: any) => ({ value: b.brandId, label: `${b.brandId} — ${b.brandName}` }))} value={data.item.brandId} onChange={(val)=> update({ item: { ...data.item, brandId: val } })} placeholder="Select Brand" />
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
          <SearchableSelect options={pcdb.partTypes.map((p: any) => ({ value: p.PartTerminologyID, label: `${p.PartTerminologyID} — ${p.PartTerminologyName}` }))} value={data.item.partType || ''} onChange={(val)=> {
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

  const renderDescriptionsTab = () => (
    <div className="space-y-3 max-w-4xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addDescription}>Add Description</button>
      {data.descriptions.map((d, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-center">
          <select className="p-2 border rounded text-sm" value={d.descriptionCode} onChange={e => {
            const next = [...data.descriptions];
            next[idx] = { ...d, descriptionCode: e.target.value };
            update({ descriptions: next });
          }}>
            {['DES','LAB','MKT','FAB'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="p-2 border rounded text-sm col-span-3" value={d.description} onChange={e => {
            const next = [...data.descriptions];
            next[idx] = { ...d, description: e.target.value };
            update({ descriptions: next });
          }} />
        </div>
      ))}
    </div>
  );

  const renderPricesTab = () => (
    <div className="space-y-3 max-w-4xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addPrice}>Add Price</button>
      {data.prices.map((p, idx) => (
        <div key={idx} className="grid grid-cols-5 gap-2 items-center">
          <select className="p-2 border rounded text-sm" value={p.priceType} onChange={e => { const next=[...data.prices]; next[idx]={...p, priceType:e.target.value}; update({prices:next}); }}>
            {['LIST','MSRP','COST','JOBBER'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input type="number" className="p-2 border rounded text-sm" value={p.price} onChange={e => { const next=[...data.prices]; next[idx]={...p, price: parseFloat(e.target.value||'0')}; update({prices:next}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Currency" value={p.currency} onChange={e => { const next=[...data.prices]; next[idx]={...p, currency:e.target.value}; update({prices:next}); }} />
          <SearchableSelect options={uomOptions} value={p.priceUom || ''} onChange={(val)=>{const next=[...data.prices]; next[idx]={...p, priceUom:val}; update({prices:next});}} placeholder="UOM (optional)" />
          {p.priceUom && !isValidUOM(p.priceUom) && <p className="text-xs text-red-600">Invalid UOM</p>}
        </div>
      ))}
    </div>
  );

  const renderEXPI = () => (
    <div className="space-y-3 max-w-4xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addEXPI}>Add EXPI</button>
      {data.expi.map((eItem, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-center">
          <input className="p-2 border rounded text-sm" placeholder="EXPI Code" value={eItem.expiCode} onChange={e => { const next=[...data.expi]; next[idx]={...eItem, expiCode:e.target.value}; update({expi:next}); }} />
          <input className="p-2 border rounded text-sm col-span-2" placeholder="Value" value={eItem.expiValue} onChange={e => { const next=[...data.expi]; next[idx]={...eItem, expiValue:e.target.value}; update({expi:next}); }} />
          <SearchableSelect options={uomOptions} value={eItem.uom || ''} onChange={(val)=>{ const next=[...data.expi]; next[idx]={...eItem, uom: val}; update({expi:next}); }} placeholder="UOM" />
          {eItem.uom && !isValidUOM(eItem.uom) && <p className="text-xs text-red-600">Invalid UOM</p>}
        </div>
      ))}
    </div>
  );

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

  const renderInterchange = () => (
    <div className="space-y-3 max-w-4xl">
      <button className="px-3 py-1 border rounded text-sm" onClick={addInterchange}>Add Interchange</button>
      {data.interchange.map((i, idx) => (
        <div key={idx} className="grid grid-cols-4 gap-2 items-center">
          <select className="p-2 border rounded text-sm" value={i.interchangeType} onChange={e=>{ const n=[...data.interchange]; n[idx]={...i, interchangeType:e.target.value}; update({interchange:n}); }}>
            {['OE','OES','UP','IP'].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <input className="p-2 border rounded text-sm" placeholder="Brand AAIA" value={i.brandAaiaId || ''} onChange={e=>{ const n=[...data.interchange]; n[idx]={...i, brandAaiaId:e.target.value}; update({interchange:n}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Brand Label" value={i.brandLabel || ''} onChange={e=>{ const n=[...data.interchange]; n[idx]={...i, brandLabel:e.target.value}; update({interchange:n}); }} />
          <input className="p-2 border rounded text-sm" placeholder="Part No" value={i.partNo} onChange={e=>{ const n=[...data.interchange]; n[idx]={...i, partNo:e.target.value}; update({interchange:n}); }} />
        </div>
      ))}
    </div>
  );

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
      <div className="flex space-x-2 mb-4">
        {['Item','Descriptions','Prices','EXPI','Attributes','Packages','Kits','Interchange','Assets'].map(t => (
          <button key={t} className={`px-3 py-1 border rounded text-sm ${activeTab===t ? 'bg-blue-50 border-blue-300' : ''}`} onClick={()=>setActiveTab(t as any)}>{t}</button>
        ))}
      </div>

      {activeTab === 'Item' && renderItemTab()}
      {activeTab === 'Descriptions' && renderDescriptionsTab()}
      {activeTab === 'Prices' && renderPricesTab()}
      {activeTab === 'EXPI' && renderEXPI()}
      {activeTab === 'Attributes' && renderAttributes()}
      {activeTab === 'Packages' && renderPackages()}
      {activeTab === 'Kits' && renderKits()}
      {activeTab === 'Interchange' && renderInterchange()}
      {activeTab === 'Assets' && renderAssets()}
    </div>
  );
};
