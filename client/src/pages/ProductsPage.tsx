import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Eye, Search as SearchIcon, CheckCircle, MoreHorizontal } from 'lucide-react';
import { productsApi } from '../services/api';
import { Product } from '../types';
import ImportExportButtons from '../components/ImportExportButtons';
import JobStatusModal from '../components/JobStatusModal';
import { getBusinessFriendlyUrl } from '../utils/urlUtils';

// Enhanced Product view focused on data completeness/quality
interface ProductDataView extends Product {
  piesCompleteness: number; // 0-100 percentage
  acesApplicationsCount: number; // count of vehicle applications
  dataQualityScore: 'A' | 'B' | 'C' | 'D' | 'F';
  lastUpdated: string;
  status: 'draft' | 'review' | 'published' | 'archived';
  missingFields: string[]; // array of missing required fields
  category?: string; // PCdb category/code
  partTypeName?: string; // PartType name from PIES
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJobType, setActiveJobType] = useState<'import' | 'export'>('import');
  const [editingProduct, setEditingProduct] = useState<ProductDataView | null>(null);
  const [editForm, setEditForm] = useState<{
    productName: string;
    shortDescription: string;
    longDescription: string;
    piesItem: {
      gtin?: string;
      categoryCode?: string;
      partType?: string;
      unspsc?: string;
    };
  } | null>(null);

  const { data: productsResponse, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => productsApi.getAll().then(res => res.data),
    staleTime: Infinity,
    cacheTime: Infinity,
    refetchOnMount: 'always',
    refetchOnReconnect: true,
  });
  
  const products = productsResponse?.products || [];

  // Local search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showIncompleteOnly, setShowIncompleteOnly] = useState(false);
  const [showMissingACES, setShowMissingACES] = useState(false);
  const [showPoorQuality, setShowPoorQuality] = useState(false);
  const [showNeedsReview, setShowNeedsReview] = useState(false);
  const [recentlyUpdatedOnly, setRecentlyUpdatedOnly] = useState(false);
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [partTypeFilter, setPartTypeFilter] = useState('');
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Helper calculators for completeness and quality
  const calculatePiesCompleteness = (p: Product): number => {
    // Simple heuristic across common PIES data buckets
    const checks: boolean[] = [];
    // Identifiers and naming
    checks.push(!!p.partNumber);
    checks.push(!!p.productName);
    checks.push(!!p.brand);
    // Descriptions
    checks.push(!!p.shortDescription);
    checks.push(!!p.longDescription);
    // PIES item core fields
    const pies = p.piesItem;
    checks.push(!!pies?.partNo || !!p.partNumber);
    checks.push(!!pies?.gtin);
    checks.push(!!pies?.brandId || !!p.brandId);
    // Attributes and packages
    checks.push(!!p.piesAttributes && p.piesAttributes.length > 0);
    checks.push(!!p.piesPackages && p.piesPackages.length > 0);
    // Digital assets / market copy
    checks.push(!!p.piesAssets && p.piesAssets.length > 0);
    checks.push(!!p.piesMarketCopy && p.piesMarketCopy.length > 0);

    const total = checks.length;
    const passed = checks.filter(Boolean).length;
    return Math.round((passed / total) * 100);
  };

  const getMissingFields = (p: Product): string[] => {
    const missing: string[] = [];
    if (!p.manufacturer) missing.push('manufacturer');
    if (!p.brand) missing.push('brand');
    if (!p.partNumber) missing.push('partNumber');
    if (!p.productName) missing.push('productName');
    if (!p.shortDescription) missing.push('shortDescription');
    if (!p.longDescription) missing.push('longDescription');
    if (!p.piesItem?.gtin) missing.push('gtin');
    if (!p.piesAttributes || p.piesAttributes.length === 0) missing.push('attributes');
    if (!p.piesAssets || p.piesAssets.length === 0) missing.push('digitalAssets');
    return missing;
  };

  const calculateQualityGrade = (p: Product, piesPct: number): 'A' | 'B' | 'C' | 'D' | 'F' => {
    const apps = (p.acesApplications?.length || 0) + ((p as any).aces42Applications?.length || 0);
    const hasAssets = !!p.piesAssets && p.piesAssets.length > 0;
    const hasAttrs = !!p.piesAttributes && p.piesAttributes.length > 0;
    const score = piesPct + (apps > 0 ? 10 : 0) + (hasAssets ? 5 : 0) + (hasAttrs ? 5 : 0);
    if (score >= 95) return 'A';
    if (score >= 85) return 'B';
    if (score >= 75) return 'C';
    if (score >= 65) return 'D';
    return 'F';
  };

  const deriveStatus = (piesPct: number, apps: number, grade: string): 'draft' | 'review' | 'published' | 'archived' => {
    if (piesPct >= 90 && apps > 0 && (grade === 'A' || grade === 'B')) return 'published';
    if (piesPct >= 70) return 'review';
    return 'draft';
  };

  // PCdb reference data for name resolution
  const [pcdbPartTypes, setPcdbPartTypes] = useState<any[]>([]);
  const [pcdbCategories, setPcdbCategories] = useState<any[]>([]);

  React.useEffect(() => {
    Promise.all([
      fetch('/api/aces-corrected/part-types').then(r => r.json()).catch(() => []),
      fetch('/api/aces-corrected/pcdb/categories').then(r => r.json()).catch(() => []),
    ]).then(([pts, cats]) => {
      setPcdbPartTypes(Array.isArray(pts) ? pts : (pts?.data || []));
      setPcdbCategories(Array.isArray(cats) ? cats : (cats?.data || []));
    }).catch(() => {
      setPcdbPartTypes([]);
      setPcdbCategories([]);
    });
  }, []);

  const partTypeNameById = (id?: string) => pcdbPartTypes.find((p: any) => String(p.PartTerminologyID) === String(id))?.PartTerminologyName;
  const categoryNameById = (id?: string) => pcdbCategories.find((c: any) => String(c.CategoryID) === String(id))?.CategoryName;

  const enrichedProducts: ProductDataView[] = useMemo(() => {
    return products.map((p) => {
      const piesPct = calculatePiesCompleteness(p);
      const apps = (p.acesApplications?.length || 0) + ((p as any).aces42Applications?.length || 0);
      const grade = calculateQualityGrade(p, piesPct);
      const status = deriveStatus(piesPct, apps, grade);
      const piesCategory = (p as any).piesItem?.categoryCode || (p as any).piesItem?.categoryId;
      const piesPartType = (p as any).piesItem?.partType;
      return {
        ...p,
        piesCompleteness: piesPct,
        acesApplicationsCount: apps,
        dataQualityScore: grade,
        lastUpdated: p.updatedAt,
        status,
        missingFields: getMissingFields(p),
        category: categoryNameById(piesCategory) || piesCategory || '-',
        partTypeName: partTypeNameById(piesPartType) || piesPartType || '-',
      };
    });
  }, [products, pcdbPartTypes, pcdbCategories]);

  // Helper UI components
  const PIESCompletenessBar: React.FC<{ percentage: number }> = ({ percentage }) => (
    <div className="flex items-center gap-2">
      <div className="w-24 bg-gray-200 rounded h-2">
        <div
          className={`h-2 rounded ${percentage >= 90 ? 'bg-green-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
        />
      </div>
      <span className="text-xs text-gray-600">{percentage}%</span>
    </div>
  );

  const QualityBadge: React.FC<{ grade: ProductDataView['dataQualityScore'] }> = ({ grade }) => {
    const colors: Record<ProductDataView['dataQualityScore'], string> = {
      A: 'bg-green-100 text-green-800',
      B: 'bg-blue-100 text-blue-800',
      C: 'bg-yellow-100 text-yellow-800',
      D: 'bg-orange-100 text-orange-800',
      F: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[grade]}`}>
        {grade}
      </span>
    );
  };

  const StatusBadge: React.FC<{ status: ProductDataView['status'] }> = ({ status }) => {
    const colors: Record<ProductDataView['status'], string> = {
      draft: 'bg-gray-100 text-gray-800',
      review: 'bg-yellow-100 text-yellow-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-red-100 text-red-800',
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Selection handlers
  const handleSelectProduct = (id: string) => {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!checked) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
    }
  };

  // Quick action handlers (stubs or navigations)
  const handleEditProduct = (id: string) => {
    navigate(`/products/${id}`);
  };
  const handleCompletePIES = (id: string) => {
    const p = enrichedProducts.find(x => (x.internalProductId || x.id) === id);
    if (p) openEdit(p);
  };
  const handleAddACES = (id: string) => {
    navigate(`/products/${id}#aces`);
  };
  const handleMoreActions = (id: string) => {
    alert(`More actions for ${id}`);
  };

  const brandOptions = useMemo(() => Array.from(new Set(enrichedProducts.map(p => p.brand).filter(Boolean))).sort(), [enrichedProducts]);
  const categoryOptions = useMemo(() => Array.from(new Set(enrichedProducts.map(p => p.category || 'Uncategorized'))).sort(), [enrichedProducts]);
  const partTypeOptions = useMemo(() => Array.from(new Set(enrichedProducts.map(p => p.partTypeName || 'Unknown'))).sort(), [enrichedProducts]);

  const filteredProducts = useMemo(() => {
    let list = enrichedProducts;
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter(p =>
        p.partNumber.toLowerCase().includes(q) ||
        p.productName.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.shortDescription || '').toLowerCase().includes(q) ||
        (p.longDescription || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) list = list.filter(p => p.status === statusFilter);
    if (showNeedsReview) list = list.filter(p => p.status === 'review');
    if (showIncompleteOnly) list = list.filter(p => p.piesCompleteness < 90);
    if (showMissingACES) list = list.filter(p => p.acesApplicationsCount === 0);
    if (showPoorQuality) list = list.filter(p => p.dataQualityScore === 'D' || p.dataQualityScore === 'F');
    if (recentlyUpdatedOnly) {
      const now = new Date().getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      list = list.filter(p => now - new Date(p.lastUpdated).getTime() <= sevenDays);
    }
    if (brandFilter) list = list.filter(p => p.brand === brandFilter);
    if (categoryFilter) list = list.filter(p => (p.category || 'Uncategorized') === categoryFilter);
    if (partTypeFilter) list = list.filter(p => (p.partTypeName || 'Unknown') === partTypeFilter);
    return list;
  }, [enrichedProducts, searchTerm, statusFilter, showNeedsReview, showIncompleteOnly, showMissingACES, showPoorQuality, recentlyUpdatedOnly, brandFilter, categoryFilter, partTypeFilter]);

  // KPI cards
  const productKPIs = useMemo(() => {
    const total = enrichedProducts.length;
    const incomplete = enrichedProducts.filter(p => p.piesCompleteness < 90).length;
    const missingACES = enrichedProducts.filter(p => p.acesApplicationsCount === 0).length;
    const needsReview = enrichedProducts.filter(p => p.status === 'review').length;
    const published = enrichedProducts.filter(p => p.status === 'published').length;
    const avgCompleteness = total ? Math.round(enrichedProducts.reduce((acc, p) => acc + p.piesCompleteness, 0) / total) : 0;
    return { total, incomplete, missingACES, needsReview, published, avgCompleteness };
  }, [enrichedProducts]);

  const importExcelMutation = useMutation({
    mutationFn: productsApi.importExcel,
    onSuccess: (response) => {
      setActiveJobId(response.data.jobId);
      setActiveJobType('import');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert('Import job creation failed.');
    },
  });

  const importXMLMutation = useMutation({
    mutationFn: productsApi.importXML,
    onSuccess: (response) => {
      setActiveJobId(response.data.jobId);
      setActiveJobType('import');
    },
    onError: (error) => {
      console.error('Import failed:', error);
      alert('Import job creation failed.');
    },
  });

  const handleExportExcel = async () => {
    try {
      const response = await productsApi.exportExcel();
      setActiveJobId(response.data.jobId);
      setActiveJobType('export');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export job creation failed.');
    }
  };

  const handleExportXML = async () => {
    try {
      const response = await productsApi.exportXML();
      setActiveJobId(response.data.jobId);
      setActiveJobType('export');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export job creation failed.');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/export/template');
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'pies-template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download failed:', error);
      alert('Template download failed.');
    }
  };

  // Update product mutation (saves to server/in-memory store now; DB later)
  const updateProductMutation = useMutation({
    mutationFn: async (params: { id: string; updates: Partial<Product> }) => {
      const { id, updates } = params;
      const res = await productsApi.update(id, updates);
      return res.data;
    },
    onSuccess: () => {
      setEditingProduct(null);
      setEditForm(null);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      console.error('Update failed:', error);
      alert('Failed to save product changes.');
    },
  });

  const openEdit = (p: ProductDataView) => {
    setEditingProduct(p);
    setEditForm({
      productName: p.productName || '',
      shortDescription: p.shortDescription || '',
      longDescription: p.longDescription || '',
      piesItem: {
        gtin: p.piesItem?.gtin,
        categoryCode: p.piesItem?.categoryCode || p.category,
        partType: p.piesItem?.partType || p.partTypeName,
        unspsc: p.piesItem?.unspsc,
      },
    });
  };

  const saveEdit = () => {
    if (!editingProduct || !editForm) return;
    const id = editingProduct.internalProductId || editingProduct.id;
    const updates: Partial<Product> = {
      productName: editForm.productName,
      shortDescription: editForm.shortDescription,
      longDescription: editForm.longDescription,
      piesItem: {
        ...(editingProduct.piesItem || {}),
        gtin: editForm.piesItem.gtin,
        categoryCode: editForm.piesItem.categoryCode,
        partType: editForm.piesItem.partType,
        unspsc: editForm.piesItem.unspsc,
      },
    } as Partial<Product>;
    updateProductMutation.mutate({ id, updates });
  };



  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Products (PIM)</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product catalog with ACES and PIES compliance
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <ImportExportButtons
            showXML={true}
            showTemplate={true}
            onImportExcel={(file) => importExcelMutation.mutate(file)}
            onImportXML={(file) => importXMLMutation.mutate(file)}
            onExportExcel={handleExportExcel}
            onExportXML={handleExportXML}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-5">
        <div className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">Total Products</div><div className="text-xl font-semibold">{productKPIs.total}</div></div>
        <div className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">Avg PIES Completion</div><div className="text-xl font-semibold">{productKPIs.avgCompleteness}%</div></div>
        <div className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">Incomplete PIES</div><div className="text-xl font-semibold text-red-600">{productKPIs.incomplete}</div></div>
        <div className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">Missing ACES</div><div className="text-xl font-semibold text-yellow-700">{productKPIs.missingACES}</div></div>
        <div className="rounded-lg border bg-white p-4"><div className="text-xs text-gray-500">Needs Review</div><div className="text-xl font-semibold text-amber-700">{productKPIs.needsReview}</div></div>
      </div>

      {/* Search */}
      <div className="mt-6 mb-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by part number, name, brand, category, or description"
            className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="review">Needs Review</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>

        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">All Brands</option>
          {brandOptions.map(b => (<option key={b} value={b}>{b}</option>))}
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categoryOptions.map(c => (<option key={c} value={c}>{c}</option>))}
        </select>

        <select
          value={partTypeFilter}
          onChange={(e) => setPartTypeFilter(e.target.value)}
          className="border rounded px-3 py-1 text-sm bg-white"
        >
          <option value="">All Part Types</option>
          {partTypeOptions.map(pt => (<option key={pt} value={pt}>{pt}</option>))}
        </select>

        <button
          onClick={() => setShowIncompleteOnly(!showIncompleteOnly)}
          className={`px-3 py-1 rounded text-sm ${showIncompleteOnly ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}
        >
          Incomplete PIES
        </button>
        <button
          onClick={() => setShowMissingACES(!showMissingACES)}
          className={`px-3 py-1 rounded text-sm ${showMissingACES ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}
        >
          Missing ACES
        </button>
        <button
          onClick={() => setShowPoorQuality(!showPoorQuality)}
          className={`px-3 py-1 rounded text-sm ${showPoorQuality ? 'bg-orange-100 text-orange-800' : 'bg-gray-100'}`}
        >
          Poor Quality (D/F)
        </button>
        <button
          onClick={() => setShowNeedsReview(!showNeedsReview)}
          className={`px-3 py-1 rounded text-sm ${showNeedsReview ? 'bg-amber-100 text-amber-800' : 'bg-gray-100'}`}
        >
          Needs Review
        </button>
        <button
          onClick={() => setRecentlyUpdatedOnly(!recentlyUpdatedOnly)}
          className={`px-3 py-1 rounded text-sm ${recentlyUpdatedOnly ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
        >
          Recently Updated
        </button>
        <button
          onClick={() => { setStatusFilter(''); setShowIncompleteOnly(false); setShowMissingACES(false); setShowPoorQuality(false); setShowNeedsReview(false); setRecentlyUpdatedOnly(false); setBrandFilter(''); setCategoryFilter(''); setPartTypeFilter(''); }}
          className="ml-auto px-3 py-1 rounded text-sm bg-gray-200"
        >
          Reset
        </button>
        <button
          onClick={() => navigate('/settings/pim/completeness')}
          className="px-3 py-1 rounded text-sm bg-white border hover:bg-gray-50"
          title="Configure PIES completeness rules by segment"
        >
          Completeness Settings
        </button>
      </div>

      {/* Bulk actions */}
      {selectedProducts.size > 0 && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-800">{selectedProducts.size} product(s) selected</span>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">Complete PIES Data</button>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">Add ACES Apps</button>
              <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">Mark for Review</button>
              <button className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700">Bulk Edit</button>
              <button onClick={() => setSelectedProducts(new Set())} className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">Clear</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 pl-4 pr-3">
                    <input
                      type="checkbox"
                      checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        if (!checked) setSelectedProducts(new Set());
                        else setSelectedProducts(new Set(filteredProducts.map(p => p.id)));
                      }}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </th>
                  <th className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">Part Number</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Product Name</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Brand</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Part Type</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">PIES Complete</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">ACES Apps</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Quality</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Last Updated</th>
                  <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td className="py-4 pl-4 pr-3">
                      <input
                        type="checkbox"
                        checked={selectedProducts.has(product.id)}
                        onChange={() => setSelectedProducts(prev => {
                          const n = new Set(prev);
                          if (n.has(product.id)) n.delete(product.id); else n.add(product.id);
                          return n;
                        })}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                    </td>
                    <td className="whitespace-nowrap py-4 pr-3 text-sm font-medium text-gray-900">{product.partNumber}</td>
                    <td className="px-3 py-4 text-sm text-gray-900 max-w-xl truncate" title={product.productName}>{product.productName}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.brand}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.category || 'Uncategorized'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{product.partTypeName || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <PIESCompletenessBar percentage={product.piesCompleteness || 0} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`${product.acesApplicationsCount > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                        {product.acesApplicationsCount} apps
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <QualityBadge grade={product.dataQualityScore || 'F'} />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(product.lastUpdated).toLocaleDateString()}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <StatusBadge status={product.status || 'draft'} />
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => navigate(`/products/${product.internalProductId || product.id}`)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Product Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openEdit(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit Product Information"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {product.piesCompleteness < 90 && (
                          <button
                            onClick={() => handleCompletePIES(product.internalProductId || product.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Complete PIES Data"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {product.acesApplicationsCount === 0 && (
                          <button
                            onClick={() => handleAddACES(product.internalProductId || product.id)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Add ACES Applications"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleMoreActions(product.internalProductId || product.id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="More Actions"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Job Status Modal */}
      {activeJobId && (
        <JobStatusModal
          jobId={activeJobId}
          jobType={activeJobType}
          onClose={() => {
            setActiveJobId(null);
            queryClient.invalidateQueries({ queryKey: ['products'] });
          }}
        />
      )}

      {/* Edit Modal */}
      {editingProduct && editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setEditingProduct(null); setEditForm(null); }} />
          <div className="relative z-10 w-full max-w-3xl bg-white rounded-lg shadow-lg">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit Product Data</h3>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => { setEditingProduct(null); setEditForm(null); }}>
                ✕
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={editForm.productName}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, productName: e.target.value } : prev)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">GTIN</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={editForm.piesItem.gtin || ''}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, piesItem: { ...prev.piesItem, gtin: e.target.value } } : prev)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">PCdb Category Code</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={editForm.piesItem.categoryCode || ''}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, piesItem: { ...prev.piesItem, categoryCode: e.target.value } } : prev)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Part Type Name</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={editForm.piesItem.partType || ''}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, piesItem: { ...prev.piesItem, partType: e.target.value } } : prev)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">UNSPSC</label>
                <input
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  value={editForm.piesItem.unspsc || ''}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, piesItem: { ...prev.piesItem, unspsc: e.target.value } } : prev)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Short Description</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  rows={2}
                  value={editForm.shortDescription}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, shortDescription: e.target.value } : prev)}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Long Description</label>
                <textarea
                  className="mt-1 w-full border rounded px-3 py-2 text-sm"
                  rows={4}
                  value={editForm.longDescription}
                  onChange={(e) => setEditForm(prev => prev ? { ...prev, longDescription: e.target.value } : prev)}
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t flex items-center justify-end gap-2">
              <button className="px-3 py-2 text-sm rounded border" onClick={() => { setEditingProduct(null); setEditForm(null); }}>Cancel</button>
              <button
                className="px-3 py-2 text-sm rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                onClick={saveEdit}
                disabled={updateProductMutation.isLoading}
              >
                {updateProductMutation.isLoading ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
