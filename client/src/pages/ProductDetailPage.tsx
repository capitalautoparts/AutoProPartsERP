import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { productsApi } from '../services/api';
import { vcdbApi } from '../services/vcdbApi';
import { ACESBuilder } from '../components/ACESBuilder';



const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [activePiesTab, setActivePiesTab] = useState('item');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getById(id!).then(res => res.data),
    enabled: !!id,
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
    { id: 'description', name: 'Description' },
    { id: 'price', name: 'Price' },
    { id: 'expi', name: 'EXPI' },
    { id: 'attributes', name: 'Attributes' },
    { id: 'package', name: 'Package' },
    { id: 'kits', name: 'Kits' },
    { id: 'interchange', name: 'Interchange' },
    { id: 'assets', name: 'Assets' },
    { id: 'assortments', name: 'Assortments' },
    { id: 'market-copy', name: 'Market Copy' },
  ];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
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
            
            {/* PIES Tab Content */}
            {activePiesTab === 'item' && <PIESItemTab product={product} />}
            {activePiesTab === 'description' && <PIESDescriptionTab product={product} />}
            {activePiesTab === 'price' && <PIESPriceTab />}
            {activePiesTab === 'expi' && <PIESEXPITab />}
            {activePiesTab === 'attributes' && <PIESAttributesTab product={product} />}
            {activePiesTab === 'package' && <PIESPackageTab product={product} />}
            {activePiesTab === 'kits' && <PIESKitTab />}
            {activePiesTab === 'interchange' && <PIESInterchangeTab />}
            {activePiesTab === 'assets' && <PIESAssetsTab />}
            {activePiesTab === 'assortments' && <PIESAssortmentsTab />}
            {activePiesTab === 'market-copy' && <PIESMarketCopyTab />}
          </div>
        )}
      </div>
    </div>
  );
};

const ProfileTab: React.FC<{ product: any }> = ({ product }) => (
  <div className="grid grid-cols-2 gap-6">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer</label>
      <input type="text" defaultValue={product.manufacturer} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
      <input type="text" defaultValue={product.brand} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
      <input type="text" defaultValue={product.partNumber} className="w-full border border-gray-300 rounded-md px-3 py-2" />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
      <input type="text" defaultValue={product.sku} className="w-full border border-gray-300 rounded-md px-3 py-2" />
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



const PIESItemTab: React.FC<{ product: any }> = ({ product }) => {
  const piesItem = product.piesItem;
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">PIES Item Information</h3>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Manufacturer Code</label>
          <input type="text" defaultValue={piesItem?.mfgCode || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand ID</label>
          <input type="text" defaultValue={piesItem?.brandId || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Part Number</label>
          <input type="text" defaultValue={piesItem?.partNo || product.partNumber} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GTIN</label>
          <input type="text" defaultValue={piesItem?.gtin || ''} placeholder="Global Trade Item Number" className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Brand Label</label>
          <input type="text" defaultValue={piesItem?.brandLabel || product.brand} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">UNSPSC</label>
          <input type="text" defaultValue={piesItem?.unspsc || ''} placeholder="UN Standard Products and Services Code" className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Part Type</label>
          <input type="text" defaultValue={piesItem?.partType || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Code</label>
          <input type="text" defaultValue={piesItem?.categoryCode || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Hazmat Code</label>
          <input type="text" defaultValue={piesItem?.hazMatCode || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Qty Size</label>
          <input type="number" defaultValue={piesItem?.itemQtySize || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Item Qty UOM</label>
          <input type="text" defaultValue={piesItem?.itemQtyUom || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">VMRS Code</label>
          <input type="text" defaultValue={piesItem?.vmrsCode || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
      </div>
    </div>
  );
};

const PIESDescriptionTab: React.FC<{ product: any }> = ({ product }) => {
  const descriptions = product.piesDescriptions || [];
  const getDescriptionByCode = (code: string) => descriptions.find((d: any) => d.descriptionCode === code)?.description || '';
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">PIES Descriptions</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">DES - Product Description</label>
          <textarea rows={3} defaultValue={getDescriptionByCode('DES')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">LAB - Label Description</label>
          <textarea rows={2} defaultValue={getDescriptionByCode('LAB')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">MKT - Marketing Description</label>
          <textarea rows={4} defaultValue={getDescriptionByCode('MKT')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">FAB - Fabrication Description</label>
          <textarea rows={3} defaultValue={getDescriptionByCode('FAB')} className="w-full border border-gray-300 rounded-md px-3 py-2" />
        </div>
        
        {descriptions.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">All Descriptions</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Language</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {descriptions.map((desc: any, index: number) => (
                    <tr key={index}>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900">{desc.descriptionCode}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{desc.description}</td>
                      <td className="px-3 py-2 text-sm text-gray-500">{desc.languageCode || 'EN'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PIESPriceTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Pricing</h3>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price Type</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="LIST">List Price</option>
          <option value="MSRP">MSRP</option>
          <option value="COST">Cost</option>
          <option value="JOBBER">Jobber</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
        <input type="number" step="0.01" placeholder="0.00" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="USD">USD</option>
          <option value="CAD">CAD</option>
          <option value="EUR">EUR</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
        <input type="date" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
    </div>
  </div>
);

const PIESEXPITab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Extended Product Information (EXPI)</h3>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Country of Origin</label>
        <input type="text" placeholder="US" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">NMFC Code</label>
        <input type="text" placeholder="National Motor Freight Classification" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
    </div>
  </div>
);

const PIESAttributesTab: React.FC<{ product: any }> = ({ product }) => {
  const attributes = product.piesAttributes || [];
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">PIES Attributes</h3>
      
      {attributes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attribute ID</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">UOM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {attributes.map((attr: any, index: number) => (
                <tr key={index}>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      defaultValue={attr.attributeId} 
                      className="w-full border border-gray-300 rounded px-2 py-1" 
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      defaultValue={attr.attributeValue} 
                      className="w-full border border-gray-300 rounded px-2 py-1" 
                    />
                  </td>
                  <td className="px-3 py-2">
                    <input 
                      type="text" 
                      defaultValue={attr.attributeUom || ''} 
                      className="w-full border border-gray-300 rounded px-2 py-1" 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No attributes defined for this product.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Attribute
          </button>
        </div>
      )}
    </div>
  );
};

const PIESPackageTab: React.FC<{ product: any }> = ({ product }) => {
  const packages = product.piesPackages || [];
  const primaryPackage = packages[0];
  
  return (
    <div>
      <h3 className="text-lg font-medium mb-4">PIES Package Information</h3>
      
      {primaryPackage ? (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package UOM</label>
            <select defaultValue={primaryPackage.packageUom} className="w-full border border-gray-300 rounded-md px-3 py-2">
              <option value="EA">Each</option>
              <option value="SET">Set</option>
              <option value="KIT">Kit</option>
              <option value="PR">Pair</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Quantity</label>
            <input type="number" defaultValue={primaryPackage.packageQuantity} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length ({primaryPackage.dimensionUom || 'IN'})</label>
            <input type="number" step="0.1" defaultValue={primaryPackage.packageLength || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Width ({primaryPackage.dimensionUom || 'IN'})</label>
            <input type="number" step="0.1" defaultValue={primaryPackage.packageWidth || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Height ({primaryPackage.dimensionUom || 'IN'})</label>
            <input type="number" step="0.1" defaultValue={primaryPackage.packageHeight || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Weight ({primaryPackage.weightUom || 'LB'})</label>
            <input type="number" step="0.1" defaultValue={primaryPackage.packageWeight || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Type</label>
            <input type="text" defaultValue={primaryPackage.packageType || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Description</label>
            <input type="text" defaultValue={primaryPackage.packageDescription || ''} className="w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No package information defined for this product.</p>
          <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Package Info
          </button>
        </div>
      )}
    </div>
  );
};

const PIESKitTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Kit Information</h3>
    <p className="text-gray-600 mb-4">Define kit components and relationships</p>
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-500">Kit component management interface would be implemented here</p>
    </div>
  </div>
);

const PIESInterchangeTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Interchange</h3>
    <div className="grid grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Interchange Type</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="OE">Original Equipment</option>
          <option value="OES">OE Supplier</option>
          <option value="UP">Universal Part</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Brand AAIA ID</label>
        <input type="text" placeholder="Brand identifier" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
    </div>
  </div>
);

const PIESAssetsTab: React.FC = () => (
  <div>
    <h3 className="text-lg font-medium mb-4">PIES Digital Assets</h3>
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Primary Image URL</label>
        <input type="url" placeholder="https://example.com/image.jpg" className="w-full border border-gray-300 rounded-md px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Asset Type</label>
        <select className="w-full border border-gray-300 rounded-md px-3 py-2">
          <option value="P04">Primary Product Image</option>
          <option value="P01">Line Art</option>
          <option value="P02">Lifestyle Image</option>
          <option value="P08">Installation Instructions</option>
        </select>
      </div>
    </div>
  </div>
);

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