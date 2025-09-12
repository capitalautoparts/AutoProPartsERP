import React, { useState } from 'react';
import { Save, TestTube, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface CarrierCredentials {
  gls: {
    username: string;
    password: string;
    billingAccount: string;
    environment: 'sandbox' | 'production';
  };
  nationex: {
    customerId: string;
    apiKey: string;
    environment: 'sandbox' | 'production';
  };
  canpar: {
    username: string;
    password: string;
    environment: 'sandbox' | 'production';
  };
}

const ShippingSettingsPage: React.FC = () => {
  const [credentials, setCredentials] = useState<CarrierCredentials>({
    gls: { username: '', password: '', billingAccount: '', environment: 'sandbox' },
    nationex: { customerId: '302853', apiKey: '5c2fIY9Yb2rrQC9kHssh73fz38JgjoRg', environment: 'sandbox' },
    canpar: { username: '', password: '', environment: 'sandbox' },
  });

  const [connectionStatus, setConnectionStatus] = useState<Record<string, 'idle' | 'testing' | 'success' | 'error'>>({
    gls: 'idle', nationex: 'idle', canpar: 'idle'
  });
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({ gls: false, nationex: false, canpar: false });
  const [isSaving, setIsSaving] = useState(false);

  const updateCredentials = (carrier: keyof CarrierCredentials, field: string, value: string) => {
    setCredentials(prev => ({ ...prev, [carrier]: { ...prev[carrier], [field]: value } }));
  };

  const testConnection = async (carrier: keyof CarrierCredentials) => {
    setConnectionStatus(prev => ({ ...prev, [carrier]: 'testing' }));
    try {
      // Placeholder for API call; simulate for now
      await new Promise(r => setTimeout(r, 1000));
      const ok = carrier === 'nationex'
        ? !!(credentials.nationex.customerId && credentials.nationex.apiKey)
        : carrier === 'gls'
        ? !!(credentials.gls.username && credentials.gls.password)
        : !!(credentials.canpar.username && credentials.canpar.password);
      setConnectionStatus(prev => ({ ...prev, [carrier]: ok ? 'success' : 'error' }));
    } catch {
      setConnectionStatus(prev => ({ ...prev, [carrier]: 'error' }));
    }
  };

  const testAllConnections = async () => {
    await Promise.all([
      testConnection('gls'),
      testConnection('nationex'),
      testConnection('canpar')
    ]);
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      await new Promise(r => setTimeout(r, 800));
      localStorage.setItem('shipping_credentials', JSON.stringify(credentials));
      alert('Settings saved');
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing': return <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Shipping Settings</h1>
          <p className="text-sm text-gray-600">Configure carrier credentials and preferences</p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={testAllConnections} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">
            <TestTube className="h-4 w-4 mr-2" /> Test All
          </button>
          <button onClick={saveSettings} disabled={isSaving} className="inline-flex items-center px-4 py-2 rounded-md text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
            <Save className="h-4 w-4 mr-2" /> {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* GLS */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-blue-500 mr-2" /> <h3 className="font-medium text-gray-900">GLS Canada</h3></div>
          <div className="flex items-center space-x-2">{getStatusIcon(connectionStatus.gls)}<button onClick={() => testConnection('gls')} className="text-sm text-blue-600">Test</button></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={credentials.gls.username} onChange={e=>updateCredentials('gls','username',e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPasswords.gls ? 'text' : 'password'} className="w-full border rounded px-3 py-2 pr-10 text-sm" value={credentials.gls.password} onChange={e=>updateCredentials('gls','password',e.target.value)} />
              <button type="button" onClick={()=>setShowPasswords(p=>({...p,gls:!p.gls}))} className="absolute right-2 top-2 text-gray-400">{showPasswords.gls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Billing Account</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={credentials.gls.billingAccount} onChange={e=>updateCredentials('gls','billingAccount',e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Environment</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={credentials.gls.environment} onChange={e=>updateCredentials('gls','environment',e.target.value)}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nationex */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-green-500 mr-2" /> <h3 className="font-medium text-gray-900">Nationex</h3></div>
          <div className="flex items-center space-x-2">{getStatusIcon(connectionStatus.nationex)}<button onClick={() => testConnection('nationex')} className="text-sm text-blue-600">Test</button></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Customer ID</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={credentials.nationex.customerId} onChange={e=>updateCredentials('nationex','customerId',e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">API Key</label>
            <div className="relative">
              <input type={showPasswords.nationex ? 'text' : 'password'} className="w-full border rounded px-3 py-2 pr-10 text-sm" value={credentials.nationex.apiKey} onChange={e=>updateCredentials('nationex','apiKey',e.target.value)} />
              <button type="button" onClick={()=>setShowPasswords(p=>({...p,nationex:!p.nationex}))} className="absolute right-2 top-2 text-gray-400">{showPasswords.nationex ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Environment</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={credentials.nationex.environment} onChange={e=>updateCredentials('nationex','environment',e.target.value)}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </div>

      {/* Canpar */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-red-500 mr-2" /> <h3 className="font-medium text-gray-900">Canpar</h3></div>
          <div className="flex items-center space-x-2">{getStatusIcon(connectionStatus.canpar)}<button onClick={() => testConnection('canpar')} className="text-sm text-blue-600">Test</button></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input className="w-full border rounded px-3 py-2 text-sm" value={credentials.canpar.username} onChange={e=>updateCredentials('canpar','username',e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input type={showPasswords.canpar ? 'text' : 'password'} className="w-full border rounded px-3 py-2 pr-10 text-sm" value={credentials.canpar.password} onChange={e=>updateCredentials('canpar','password',e.target.value)} />
              <button type="button" onClick={()=>setShowPasswords(p=>({...p,canpar:!p.canpar}))} className="absolute right-2 top-2 text-gray-400">{showPasswords.canpar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Environment</label>
            <select className="w-full border rounded px-3 py-2 text-sm" value={credentials.canpar.environment} onChange={e=>updateCredentials('canpar','environment',e.target.value)}>
              <option value="sandbox">Sandbox</option>
              <option value="production">Production</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingSettingsPage;

