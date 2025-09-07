/**
 * Internal ID Manager Component
 * UI for managing internal product identifiers
 */

import React, { useState, useEffect } from 'react';
import { Search, Package, Hash, CheckCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { internalIdService } from '../services/internalIdService';
import { Product } from '../types';

interface InternalIdManagerProps {
  onProductSelect?: (product: Product) => void;
}

export const InternalIdManager: React.FC<InternalIdManagerProps> = ({ onProductSelect }) => {
  const [activeTab, setActiveTab] = useState<'lookup' | 'generate' | 'batch'>('lookup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lookup tab state
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState<Product | null>(null);

  // Generate tab state
  const [brandId, setBrandId] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [generatePreview, setGeneratePreview] = useState<{
    internalId: string;
    valid: boolean;
    errors: string[];
  } | null>(null);

  // Batch tab state
  const [batchIds, setBatchIds] = useState('');
  const [batchResults, setBatchResults] = useState<Product[]>([]);

  // Update generate preview when inputs change
  useEffect(() => {
    if (brandId || partNumber) {
      const preview = internalIdService.previewInternalId(brandId, partNumber);
      setGeneratePreview(preview);
    } else {
      setGeneratePreview(null);
    }
  }, [brandId, partNumber]);

  const handleLookup = async () => {
    if (!lookupId.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const product = await internalIdService.getProduct(lookupId.trim());
      setLookupResult(product);
      if (onProductSelect) {
        onProductSelect(product);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lookup failed');
      setLookupResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!brandId.trim() || !partNumber.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const result = await internalIdService.generateInternalId(brandId.trim(), partNumber.trim());
      // Copy to clipboard
      await navigator.clipboard.writeText(result.internalId);
      alert(`Internal ID generated and copied to clipboard: ${result.internalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchLookup = async () => {
    const ids = batchIds.split('\n').map(id => id.trim()).filter(id => id);
    if (ids.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      const products = await internalIdService.batchLookup(ids);
      setBatchResults(products);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Batch lookup failed');
      setBatchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'lookup', label: 'Product Lookup', icon: Search },
            { id: 'generate', label: 'Generate ID', icon: Hash },
            { id: 'batch', label: 'Batch Operations', icon: Package }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Lookup Tab */}
        {activeTab === 'lookup' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Product ID
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  placeholder="e.g., PROBPB12345"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLookup()}
                />
                <button
                  onClick={handleLookup}
                  disabled={loading || !lookupId.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Search className="w-4 h-4" />
                  <span>{loading ? 'Looking up...' : 'Lookup'}</span>
                </button>
              </div>
            </div>

            {lookupResult && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <h3 className="font-medium text-green-800">Product Found</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Internal ID:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-blue-600">{lookupResult.id}</span>
                      <button
                        onClick={() => copyToClipboard(lookupResult.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Product Name:</span>
                    <p className="text-gray-900">{lookupResult.productName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Brand:</span>
                    <p className="text-gray-900">{lookupResult.brand}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Part Number:</span>
                    <p className="text-gray-900">{lookupResult.partNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Stock:</span>
                    <p className="text-gray-900">{lookupResult.qtyOnHand} {lookupResult.unitType}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Manufacturer:</span>
                    <p className="text-gray-900">{lookupResult.manufacturer}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Brand ID
                </label>
                <input
                  type="text"
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
                  placeholder="e.g., PROB"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">2-10 characters, letters and numbers only</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Part Number
                </label>
                <input
                  type="text"
                  value={partNumber}
                  onChange={(e) => setPartNumber(e.target.value)}
                  placeholder="e.g., PB12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">1-50 characters, letters and numbers only</p>
              </div>
            </div>

            {generatePreview && (
              <div className={`p-4 rounded-md border ${
                generatePreview.valid 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  {generatePreview.valid ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`font-medium ${
                    generatePreview.valid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    Preview: {generatePreview.internalId}
                  </span>
                </div>
                {generatePreview.errors.length > 0 && (
                  <ul className="text-sm text-red-700 list-disc list-inside">
                    {generatePreview.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !generatePreview?.valid}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Hash className="w-4 h-4" />
              <span>{loading ? 'Generating...' : 'Generate & Copy ID'}</span>
            </button>
          </div>
        )}

        {/* Batch Tab */}
        {activeTab === 'batch' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Product IDs (one per line)
              </label>
              <textarea
                value={batchIds}
                onChange={(e) => setBatchIds(e.target.value)}
                placeholder="PROBPB12345&#10;CLEACA67890&#10;BRANDPART123"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleBatchLookup}
              disabled={loading || !batchIds.trim()}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>{loading ? 'Processing...' : 'Batch Lookup'}</span>
            </button>

            {batchResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-900 mb-3">
                  Results ({batchResults.length} products found)
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {batchResults.map((product) => (
                    <div
                      key={product.id}
                      className="p-3 bg-gray-50 rounded-md flex items-center justify-between"
                    >
                      <div>
                        <div className="font-mono text-sm text-blue-600">{product.id}</div>
                        <div className="text-sm text-gray-900">{product.productName}</div>
                        <div className="text-xs text-gray-500">{product.brand} • {product.partNumber}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => copyToClipboard(product.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        {onProductSelect && (
                          <button
                            onClick={() => onProductSelect(product)}
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};