import React, { useState } from 'react';
import { Plus, Minus, Truck, DollarSign } from 'lucide-react';
import shippingApi from '../../services/shippingApi';

interface Pkg {
  id: string;
  weight: number;
  length: number;
  width: number;
  height: number;
  quantity: number;
}

interface Address {
  company: string;
  streetNumber: string;
  postalCode: string;
  province: string;
  country: string;
}

interface RateQuote {
  carrier: string;
  service: string;
  totalCost: number;
  baseCost: number;
  fuelSurcharge: number;
  taxes: number;
  transitDays: string;
  deliveryDate: string;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

const colorClass = (c: RateQuote['color']) => ({
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
}[c]);

const RateShoppingTab: React.FC = () => {
  const [origin, setOrigin] = useState<Address>({ company: 'Capital Auto Parts', streetNumber: '123', postalCode: 'K1B4N4', province: 'ON', country: 'CA' });
  const [destination, setDestination] = useState<Address>({ company: '', streetNumber: '', postalCode: '', province: '', country: 'CA' });
  const [packages, setPackages] = useState<Pkg[]>([{ id: '1', weight: 10, length: 12, width: 8, height: 6, quantity: 1 }]);
  const [quotes, setQuotes] = useState<RateQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPackage = () => setPackages(p => [...p, { id: Date.now().toString(), weight: 10, length: 12, width: 8, height: 6, quantity: 1 }]);
  const removePackage = (id: string) => setPackages(p => (p.length > 1 ? p.filter(x => x.id !== id) : p));
  const updatePackage = (id: string, field: keyof Pkg, value: number) => setPackages(p => p.map(pkg => (pkg.id === id ? { ...pkg, [field]: value } : pkg)));

  const getRateQuotes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // gather credentials from localStorage (saved on Settings page)
      const credsRaw = localStorage.getItem('shipping_credentials');
      const credentials = credsRaw ? JSON.parse(credsRaw) : {};

      const shipment = {
        origin: {
          company: origin.company,
          streetNumber: origin.streetNumber,
          postalCode: origin.postalCode,
          province: origin.province,
        },
        destination: {
          company: destination.company,
          streetNumber: destination.streetNumber,
          postalCode: destination.postalCode,
          province: destination.province,
        },
        packages: packages.map(p => ({
          weight: p.weight,
          length: p.length,
          width: p.width,
          height: p.height,
          quantity: p.quantity,
        }))
      };

      const resp = await shippingApi.getRateQuotes(shipment as any, credentials);
      const srvQuotes = (resp?.quotes || []) as Array<any>;
      const mapped: RateQuote[] = srvQuotes.map((q: any) => ({
        carrier: q.carrier,
        service: q.service,
        totalCost: Number(q.totalCost ?? q.total ?? 0),
        baseCost: Number(q.baseCost ?? q.subTotal ?? 0),
        fuelSurcharge: Number(q.fuelSurcharge ?? q.fuelCharge ?? 0),
        taxes: Number(q.taxes ?? 0),
        transitDays: String(q.transitDays ?? 'N/A'),
        deliveryDate: String(q.deliveryDate ?? 'N/A'),
        color: (q.color as any) || 'blue',
      }));

      setQuotes(mapped);
    } catch (e: any) {
      setError(e?.message || 'Failed to get rate quotes');
      setQuotes([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Origin & Destination */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Origin</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Company Name</label>
              <input className="w-full border rounded px-3 py-2 text-sm" value={origin.company} onChange={e=>setOrigin({...origin, company: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Street Number</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={origin.streetNumber} onChange={e=>setOrigin({...origin, streetNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Postal Code</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={origin.postalCode} onChange={e=>setOrigin({...origin, postalCode: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Province</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={origin.province} onChange={e=>setOrigin({...origin, province: e.target.value})}>
                {['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE','YT','NT','NU'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Destination</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Company Name</label>
              <input className="w-full border rounded px-3 py-2 text-sm" value={destination.company} onChange={e=>setDestination({...destination, company: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">Street Number</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={destination.streetNumber} onChange={e=>setDestination({...destination, streetNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Postal Code</label>
                <input className="w-full border rounded px-3 py-2 text-sm" value={destination.postalCode} onChange={e=>setDestination({...destination, postalCode: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Province</label>
              <select className="w-full border rounded px-3 py-2 text-sm" value={destination.province} onChange={e=>setDestination({...destination, province: e.target.value})}>
                <option value="">Select Province</option>
                {['ON','QC','BC','AB','MB','SK','NS','NB','NL','PE','YT','NT','NU'].map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Packages */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Packages</h3>
          <button onClick={addPackage} className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"> <Plus className="h-4 w-4 mr-1"/> Add Package</button>
        </div>
        <div className="space-y-4">
          {packages.map((pkg, index) => (
            <div key={pkg.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Package {index+1}</h4>
                {packages.length > 1 && (<button onClick={()=>removePackage(pkg.id)} className="text-red-600"><Minus className="h-4 w-4"/></button>)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Weight (lbs)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={pkg.weight} onChange={e=>updatePackage(pkg.id,'weight',Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Length (in)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={pkg.length} onChange={e=>updatePackage(pkg.id,'length',Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Width (in)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={pkg.width} onChange={e=>updatePackage(pkg.id,'width',Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Height (in)</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={pkg.height} onChange={e=>updatePackage(pkg.id,'height',Number(e.target.value))} />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Quantity</label>
                  <input type="number" className="w-full border rounded px-3 py-2 text-sm" value={pkg.quantity} onChange={e=>updatePackage(pkg.id,'quantity',Number(e.target.value))} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Get Quotes */}
      <div className="flex justify-center">
        <button onClick={getRateQuotes} disabled={isLoading} className="inline-flex items-center px-6 py-3 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? (<>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"/>
            Getting Quotes...
          </>) : (<>
            <Truck className="h-5 w-5 mr-2"/> Get Rate Quotes
          </>)}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3">{error}</div>}

      {quotes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-900">Rate Quotes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quotes.map((q, idx) => (
              <div key={idx} className={`bg-white border-2 rounded-lg p-6 hover:shadow ${idx===0 ? 'border-green-500' : 'border-gray-200'}`}>
                {idx===0 && <div className="mb-2"><span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Best Rate</span></div>}
                <div className="flex items-center mb-3">
                  <div className={`w-3 h-3 rounded-full mr-2 ${colorClass(q.color)}`}/>
                  <h4 className="text-lg font-medium text-gray-900">{q.carrier}</h4>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Service:</span><span className="font-medium">{q.service}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Transit:</span><span className="font-medium">{q.transitDays} days</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Delivery:</span><span className="font-medium">{q.deliveryDate}</span></div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">${q.totalCost.toFixed(2)}</span>
                    <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">Select</button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Base: ${q.baseCost.toFixed(2)} + Fuel: ${q.fuelSurcharge.toFixed(2)} + Tax: ${q.taxes.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RateShoppingTab;
