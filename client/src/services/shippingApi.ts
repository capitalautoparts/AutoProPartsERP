// Minimal client for shipping API (TypeScript)
export interface ShipmentPackage { weight: number; length: number; width: number; height: number; quantity: number; }
export interface Address { company: string; streetNumber: string; postalCode: string; province: string; }
export interface Shipment { origin: Address; destination: Address; packages: ShipmentPackage[]; }

class ShippingAPI {
  private baseUrl: string;
  constructor() {
    // Vite env at build-time; fallback to common localhost
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const anyImportMeta: any = import.meta as any;
    const viteEnv = anyImportMeta?.env?.VITE_API_BASE_URL;
    // Default to existing ERP API prefix (proxied by Vite to server:3000)
    this.baseUrl = viteEnv || '/api/shipping';
  }

  async getRateQuotes(shipment: Shipment, credentials: unknown) {
    const res = await fetch(`${this.baseUrl}/rate-quotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shipment, credentials })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async testConnection(carrier: string, credentials: unknown) {
    const res = await fetch(`${this.baseUrl}/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ carrier, credentials })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }
}

export default new ShippingAPI();
