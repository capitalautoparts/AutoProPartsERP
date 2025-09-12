import express from 'express';

const router = express.Router();

// Helpers
const jsonFetch = async (url: string, init: any) => {
  const f: any = (global as any).fetch;
  if (!f) throw new Error('fetch is not available in this Node runtime');
  const res = await f(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json();
};

// Nationex
async function getNationexRates(shipment: any, credentials: any) {
  const requestBody = {
    CustomerId: parseInt(credentials.customerId),
    ExpeditionDate: new Date().toISOString().split('T')[0],
    ShipmentType: 'Delivery',
    SourcePostalCode: shipment.origin.postalCode?.replace(/\s/g, ''),
    DestinationPostalCode: shipment.destination.postalCode?.replace(/\s/g, ''),
    TotalWeight: shipment.packages.reduce((sum: number, p: any) => sum + (Number(p.weight) * Number(p.quantity || 1)), 0),
    TotalParcels: shipment.packages.reduce((sum: number, p: any) => sum + Number(p.quantity || 1), 0),
    UnitsOfMeasurement: 'LI',
    Accessory: { InsuranceAmount: 0, FrozenProtection: false, DangerousGoods: false, SNR: false },
    Parcels: shipment.packages.map((p: any) => ({
      NCV: false,
      Weight: Number(p.weight),
      Dimensions: {
        Height: Number(p.height), Length: Number(p.length), Width: Number(p.width),
        Cubing: (Number(p.length) * Number(p.width) * Number(p.height)) / 1728
      }
    }))
  };

  const auth = Buffer.from(`${credentials.customerId}:${credentials.apiKey}`).toString('base64');
  const baseUrl = credentials.environment === 'production' ? 'https://api.nationex.com/api/v4' : 'https://apidev.nationex.com/api/v4';
  const url = `${baseUrl}/Customers/${credentials.customerId}/rates`;

  const data = await jsonFetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  return {
    carrier: 'Nationex',
    service: 'Standard',
    totalCost: data.Total,
    baseCost: data.BasePrice,
    fuelSurcharge: data.FuelCharge,
    taxes: Array.isArray(data.TaxCharges) ? data.TaxCharges.reduce((s: number, t: any) => s + Number(t.Charge || 0), 0) : 0,
    transitDays: String(data.DelayTransitDays ?? 'N/A'),
    deliveryDate: data.EstimatedDeliveryDate || 'N/A',
    color: 'green'
  };
}

// GLS Canada
async function getGLSRates(shipment: any, credentials: any) {
  const requestBody = {
    sender: {
      number: shipment.origin.streetNumber,
      postalCode: shipment.origin.postalCode?.replace(/\s/g, ''),
      provinceCode: shipment.origin.province,
      countryCode: 'CA',
      name: shipment.origin.company,
    },
    consignee: {
      number: shipment.destination.streetNumber,
      postalCode: shipment.destination.postalCode?.replace(/\s/g, ''),
      provinceCode: shipment.destination.province,
      countryCode: 'CA',
      name: shipment.destination.company,
    },
    paymentType: credentials.paymentType || 'Prepaid',
    deliveryType: credentials.deliveryType || 'GRD',
    unitOfMeasurement: credentials.unitOfMeasurement || 'L',
    billing: credentials.billingAccount,
    category: 'Parcel',
    parcels: shipment.packages.map((p: any) => ({
      parcelType: 'Box',
      quantity: Number(p.quantity || 1),
      // GLS supports 'K' for kg and 'L' for lb. If credentials specify 'K', convert from lb to kg assuming UI is lb.
      weight: (credentials.unitOfMeasurement || 'L') === 'K' ? Number(p.weight) * 0.453592 : Number(p.weight),
      length: Number(p.length),
      depth: Number(p.height),
      width: Number(p.width),
    }))
  };

  const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
  const baseUrl = credentials.baseUrl || (credentials.environment === 'production' ? 'https://smart4i.gls-canada.com' : 'https://sandbox-smart4i.gls-canada.com');
  // Postman collection uses POST /v1/rate for quick rate
  const url = `${baseUrl}/v1/rate`;

  const data = await jsonFetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });

  const rate = Array.isArray(data.rates) && data.rates.length > 0 ? (data.rates.find((r: any) => r.accountType === 'NEG') || data.rates[0]) : null;
  if (!rate) throw new Error('No GLS rates returned');

  return {
    carrier: 'GLS Canada',
    service: 'Ground',
    totalCost: rate.total,
    baseCost: rate.subTotal,
    fuelSurcharge: rate.fuelCharge,
    taxes: rate.taxes,
    transitDays: 'N/A',
    deliveryDate: 'N/A',
    color: 'blue'
  };
}

// POST /api/shipping/rate-quotes
router.post('/rate-quotes', async (req, res) => {
  try {
    const { shipment, credentials } = req.body || {};
    const quotes: any[] = [];

    if (credentials?.gls?.username && credentials?.gls?.password) {
      try { quotes.push(await getGLSRates(shipment, credentials.gls)); } catch (e: any) { console.error('GLS error:', e?.message); }
    }
    if (credentials?.nationex?.customerId && credentials?.nationex?.apiKey) {
      try { quotes.push(await getNationexRates(shipment, credentials.nationex)); } catch (e: any) { console.error('Nationex error:', e?.message); }
    }

    quotes.sort((a, b) => Number(a.totalCost) - Number(b.totalCost));

    res.json({ success: true, quotes, summary: {
      totalQuotes: quotes.length,
      bestRate: quotes[0] || null,
      potentialSavings: quotes.length > 1 ? Number(quotes[quotes.length - 1].totalCost) - Number(quotes[0].totalCost) : 0
    }});
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Unknown error' });
  }
});

// POST /api/shipping/test-connection
router.post('/test-connection', async (req, res) => {
  try {
    const { carrier, credentials } = req.body || {};

    const testShipment = {
      origin: { company: 'Test Co', streetNumber: '123', postalCode: 'K1B4N4', province: 'ON' },
      destination: { company: 'Test Dest', streetNumber: '456', postalCode: 'V1L2Y4', province: 'BC' },
      packages: [{ weight: 10, length: 12, width: 8, height: 6, quantity: 1 }]
    };

    if (carrier === 'gls') {
      await getGLSRates(testShipment, credentials);
      return res.json({ success: true, message: 'GLS connection ok' });
    }
    if (carrier === 'nationex') {
      await getNationexRates(testShipment, credentials);
      return res.json({ success: true, message: 'Nationex connection ok' });
    }

    res.json({ success: false, message: 'Unknown carrier' });
  } catch (error: any) {
    res.json({ success: false, message: error?.message || 'Connection failed' });
  }
});

export default router;
