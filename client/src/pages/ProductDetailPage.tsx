import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { productsApi } from '../services/api';
import { vcdbApi } from '../services/vcdbApi';
import { ACESBuilder } from '../components/ACESBuilder';
import { PIESBuilder, PIESData } from '../components/PIESBuilder';



const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [activePiesTab, setActivePiesTab] = useState('item');

  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      try {
        const response = await productsApi.getById(id!);
        return response.data;
      } catch (error: any) {
        // Enhanced error handling with format detection
        if (error.response?.status === 404) {
          const errorData = error.response.data;
          throw new Error(errorData.hint || `Product not found: ${id}`);
        }
        throw error;
      }
    },
    enabled: !!id,
    retry: false, // Don't retry on 404 errors
    staleTime: Infinity,
    cacheTime: Infinity,
  });

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'aces', name: 'ACES' },
    { id: 'pies', name: 'PIES' },
  ];

  const piesTabs = [
    { id: 'item', name: 'Item' },
    { id: 'descriptions', name: 'Descriptions' },
    { id: 'prices', name: 'Prices' },
    { id: 'expi', name: 'EXPI' },
    { id: 'attributes', name: 'Attributes' },
    { id: 'packages', name: 'Packages' },
    { id: 'kits', name: 'Kits' },
    { id: 'interchange', name: 'Interchange' },
    { id: 'assets', name: 'Assets' },
    { id: 'assortments', name: 'Assortments' },
    { id: 'market-copy', name: 'Market Copy' },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  // Enhanced error display
  if (error) {
    return (
      <div className="text-center py-8">
        <h2 className="text-lg font-semibold text-red-600 mb-2">Product Not Found</h2>
        <p className="text-gray-600 mb-2">Could not find product with ID:</p>
        <code className="bg-gray-100 px-2 py-1 rounded text-sm">{id}</code>
        <div className="mt-4 text-sm text-gray-500">
          <p className="mb-2">Supported ID formats:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>UUID: <code>410d4b6a-1aae-407e-8d34-a27211892c58</code></li>
            <li>Internal ID: <code>JVYDAFF12090511432SMF</code></li>
          </ul>
        </div>
        <button 
          onClick={() => navigate('/products')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-8">
        <p>Product not found</p>
        <p className="text-sm text-gray-500 mt-2">Product ID: {id}</p>
        <button 
          onClick={() => navigate('/products')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Products
        </button>
      </div>
    );
  }

  // Build initial PIES data once for the PIES editor
  const piesInitial: PIESData = {
    item: {
      partNo: product.piesItem?.partNo || product.partNumber || '',
      baseItemNo: product.piesItem?.baseItemNo || '',
      vmrsCode: product.piesItem?.vmrsCode || '',
      gtin: product.piesItem?.gtin || '',
      brandId: product.piesItem?.brandId || '',
      subBrandId: product.piesItem?.subBrandId || '',
      partType: product.piesItem?.partType || '',
      categoryId: product.piesItem?.categoryCode || '',
      unspsc: product.piesItem?.unspsc || '',
      mfgCode: product.piesItem?.mfgCode || '',
      groupCode: product.piesItem?.groupCode || '',
      subGroupCode: product.piesItem?.subGroupCode || '',
      itemQtySize: product.piesItem?.itemQtySize || '',
      itemQtyUom: product.piesItem?.itemQtyUom || ''
    },
    descriptions: product.piesDescriptions || [],
    prices: product.piesPrices || [],
    expi: product.piesExpi || [],
    attributes: product.piesAttributes?.map((a: any) => ({ paid: a.attributeId, value: a.attributeValue, uom: a.attributeUom })) || [],
    packages: product.piesPackages?.map((p: any) => ({
      packageUom: p.packageUom,
      packageQuantity: p.packageQuantity,
      packageLength: p.packageLength,
      packageWidth: p.packageWidth,
      packageHeight: p.packageHeight,
      packageWeight: p.packageWeight,
      dimensionUom: p.dimensionUom,
      weightUom: p.weightUom
    })) || [],
    kits: product.piesKits || [],
    interchange: product.piesInterchange?.map((i: any) => ({
      interchangeType: i.interchangeType,
      brandAaiaId: i.brandAaiaId,
      brandLabel: i.brandLabel,
      partNo: i.partNo
    })) || [],
    digitalAssets: product.piesAssets?.map((a: any) => ({ assetType: a.assetType, uri: a.uri, assetDescription: a.assetDescription })) || []
  };

  return (
    <div>
      <div className="mb-6">
        <button
          onClick={() => navigate('/products')}
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Products
        </button>
        <div className="mt-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">{product.productName}</h1>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'profile' && <ProfileTab product={product} />}
        {activeTab === 'aces' && <ACESTab product={product} />}
        {activeTab === 'pies' && (
          <div>
            {/* PIES Sub-tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8 overflow-x-auto">
                {piesTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActivePiesTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activePiesTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
            
            {/* Title reflecting current PIES segment */}
            <h3 className="text-lg font-medium mb-4">
              {
                (activePiesTab === 'item' && 'PIES Item Information') ||
                (activePiesTab === 'descriptions' && 'PIES Descriptions') ||
                (activePiesTab === 'prices' && 'PIES Pricing') ||
                (activePiesTab === 'expi' && 'PIES Extended Product Information (EXPI)') ||
                (activePiesTab === 'attributes' && 'PIES Attributes') ||
                (activePiesTab === 'packages' && 'PIES Package Information') ||
                (activePiesTab === 'kits' && 'PIES Kits') ||
                (activePiesTab === 'interchange' && 'PIES Interchange') ||
                (activePiesTab === 'assets' && 'PIES Digital Assets') ||
                (activePiesTab === 'assortments' && 'PIES Assortments') ||
                'PIES Market Copy'
              }
            </h3>

            {/* PIES Tab Content - reuse PIESBuilder with external tabs */}
            {['item','descriptions','prices','expi','attributes','packages','kits','interchange','assets'].includes(activePiesTab) && (
              <PIESBuilder
                value={piesInitial}
                onChange={(updated) => { console.log('PIES updated', updated); }}
                partTerminologyId={piesInitial.item.partType}
                activeTab={activePiesTab === 'item' ? 'Item' : activePiesTab === 'descriptions' ? 'Descriptions' : activePiesTab === 'prices' ? 'Prices' : activePiesTab === 'expi' ? 'EXPI' : activePiesTab === 'attributes' ? 'Attributes' : activePiesTab === 'packages' ? 'Packages' : activePiesTab === 'kits' ? 'Kits' : activePiesTab === 'interchange' ? 'Interchange' : 'Assets'}
              />
            )}
            {activePiesTab === 'assortments' && <PIESAssortmentsTab />}
            {activePiesTab === 'market-copy' && <PIESMarketCopyTab />}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileTab: React.FC<{ product: any }> = ({ product }) => {
  const [brandName, setBrandName] = React.useState<string>('');
  React.useEffect(() => {
    const brandId = product?.piesItem?.brandId || product?.brandId || product?.brand;
    if (!brandId) return;
    fetch('/api/reference/brands')
      .then(r => r.json())
      .then((rows: any[]) => {
        const match = rows.find((b: any) => b.brandId === brandId);
        if (match?.brandName) setBrandName(match.brandName);
      })
      .catch(() => {});
  }, [product?.piesItem?.brandId, product?.brandId, product?.brand]);

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Internal ID</label>
        <input type="text" value={product.internalProductId || product.id} readOnly className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
        <input type="text" defaultValue={brandName || product.manufacturer} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
        <input type="text" defaultValue={product?.piesItem?.brandId || product.brand} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
        <input type="text" defaultValue={product.partNumber} className="w-full border border-gray-300 rounded-md px-3 py-2" style={{textTransform: 'uppercase'}} onChange={e => e.target.value = e.target.value.toUpperCase()} />
      </div>

      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
        <input type="text" defaultValue={product.productName} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Short Description</label>
        <textarea defaultValue={product.shortDescription} rows={3} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div className="col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">Long Description</label>
        <textarea defaultValue={product.longDescription} rows={5} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
        <input type="number" defaultValue={product.stock} className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Unit Type</label>
        <select defaultValue={product.unitType} className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="Each">Each</option>
          <option value="Set">Set</option>
          <option value="Pair">Pair</option>
          <option value="Kit">Kit</option>
        </select>
      </div>
    </div>
  );
};

const ACESTab: React.FC<{ product: any }> = ({ product }) => {
  const applications = product.acesApplications || [];
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">ACES Applications</h3>
      <p className="text-sm text-gray-600 mb-4">Vehicle fitment applications with full ACES 4.2 support</p>
      
      <ACESBuilder 
        applications={applications} 
        onUpdate={(updatedApps) => {
          // TODO: Update product with new applications
          console.log('Updated applications:', updatedApps);
        }} 
      />
    </div>
  );
};



// Removed duplicate internal PIES segment tabs; segments now rendered via PIESBuilder using the parent tabs

const PIESAssortmentsTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Assortments</h3>
    <p className="text-gray-600 mb-4">Manage product assortments and groupings</p>
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">Assortment management interface would be implemented here</p>
    </div>
  </div>
);

const PIESMarketCopyTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Market Copy</h3>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Market Copy Code</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="FEAT">Features</option>
          <option value="BENE">Benefits</option>
          <option value="TECH">Technical Specifications</option>
          <option value="INST">Installation Notes</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Market Copy Text</label>
        <textarea rows={5} placeholder="Enter market copy content" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
    </div>
  </div>
);

const VehicleSelector: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const { data: years = [] } = useQuery({
    queryKey: ['vcdb-years'],
    queryFn: vcdbApi.getYears
  });

  const { data: makes = [] } = useQuery({
    queryKey: ['vcdb-makes'],
    queryFn: vcdbApi.getMakes
  });

  const { data: partTypes = [] } = useQuery({
    queryKey: ['vcdb-parttypes'],
    queryFn: vcdbApi.getPartTypes
  });

  const { data: positions = [] } = useQuery({
    queryKey: ['vcdb-positions'],
    queryFn: vcdbApi.getPositions
  });

  // Placeholder for models/engines until we implement full VCdb
  const models = selectedMake ? ['Model A', 'Model B'] : [];
  const subModels = selectedModel ? ['Base', 'Premium'] : [];
  const engines = selectedModel ? ['2.0L', '3.0L'] : [];

  return (
    <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
        <select 
          value={selectedYear || ''} 
          onChange={(e) => {
            const year = e.target.value ? parseInt(e.target.value) : null;
            setSelectedYear(year);
            setSelectedMake('');
            setSelectedModel('');
          }}
          className="w-full border border-gray-300 rounded-md px-3 py-2"
        >
          <option value="">Select Year...</option>
          {years.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
        <select 
          value={selectedMake} 
          onChange={(e) => {
            setSelectedMake(e.target.value);
            setSelectedModel('');
          }}
          disabled={!selectedYear}
          className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">Select Make...</option>
          {makes.map(make => (
            <option key={make.id} value={make.name}>{make.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
        <select 
          value={selectedModel} 
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={!selectedMake}
          className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">Select Model...</option>
          {models.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sub Model</label>
        <select 
          disabled={!selectedModel}
          className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">Select Sub Model...</option>
          {subModels.map(subModel => (
            <option key={subModel} value={subModel}>{subModel}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Engine</label>
        <select 
          disabled={!selectedModel}
          className="w-full border border-gray-300 rounded-md px-3 py-2 disabled:bg-gray-100"
        >
          <option value="">Select Engine...</option>
          {engines.map(engine => (
            <option key={engine} value={engine}>{engine}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="">Select...</option>
          <option value="Automatic">Automatic</option>
          <option value="Manual">Manual</option>
          <option value="CVT">CVT</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Drive Type</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="">Select...</option>
          <option value="FWD">FWD</option>
          <option value="RWD">RWD</option>
          <option value="AWD">AWD</option>
          <option value="4WD">4WD</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="">Select Position...</option>
          {positions.map(position => (
            <option key={position.id} value={position.id}>{position.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Part Type</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="">Select Part Type...</option>
          {partTypes.map(partType => (
            <option key={partType.id} value={partType.id}>{partType.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
        <input type="number" placeholder="1" defaultValue="1" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div className="col-span-3">
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Add Application
        </button>
      </div>
    </div>
  );
};

export default ProductDetailPage;
