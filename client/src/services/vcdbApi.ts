const API_BASE = '/api/vcdb';

export const vcdbApi = {
  getYears: async (makeId?: number, modelId?: number): Promise<Array<{id: number, name: string}>> => {
    let url = `${API_BASE}/years`;
    const params = new URLSearchParams();
    if (makeId) params.append('makeId', makeId.toString());
    if (modelId) params.append('modelId', modelId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    return response.json();
  },

  getBaseVehicles: async (year?: number, makeId?: number, modelId?: number): Promise<Array<{id: number, year: number, make: string, model: string}>> => {
    let url = `${API_BASE}/basevehicles`;
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (makeId) params.append('makeId', makeId.toString());
    if (modelId) params.append('modelId', modelId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    return response.json();
  },

  getMakes: async (year?: number, modelId?: number): Promise<Array<{id: number, name: string}>> => {
    let url = `${API_BASE}/makes`;
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (modelId) params.append('modelId', modelId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    return response.json();
  },

  getModels: async (year?: number, makeId?: number): Promise<Array<{id: number, name: string}>> => {
    let url = `${API_BASE}/models`;
    const params = new URLSearchParams();
    if (year) params.append('year', year.toString());
    if (makeId) params.append('makeId', makeId.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await fetch(url);
    return response.json();
  },

  getSubModels: async (baseVehicleId?: number): Promise<Array<{id: number, name: string}>> => {
    const url = baseVehicleId ? `${API_BASE}/submodels?baseVehicleId=${baseVehicleId}` : `${API_BASE}/submodels`;
    const response = await fetch(url);
    return response.json();
  },

  getEngineBases: async (baseVehicleId?: number): Promise<Array<{id: number, name: string}>> => {
    const url = baseVehicleId ? `${API_BASE}/enginebases?baseVehicleId=${baseVehicleId}` : `${API_BASE}/enginebases`;
    const response = await fetch(url);
    return response.json();
  },

  getEngineBlocks: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/engineblocks`);
    return response.json();
  },

  getEngineVINs: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/enginevins`);
    return response.json();
  },

  getDriveTypes: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/drivetypes`);
    return response.json();
  },

  getTransmissionTypes: async (baseVehicleId?: number): Promise<Array<{id: number, name: string}>> => {
    const url = baseVehicleId ? `${API_BASE}/transmissiontypes?baseVehicleId=${baseVehicleId}` : `${API_BASE}/transmissiontypes`;
    const response = await fetch(url);
    return response.json();
  },

  getBodyTypes: async (baseVehicleId?: number): Promise<Array<{id: number, name: string}>> => {
    const url = baseVehicleId ? `${API_BASE}/bodytypes?baseVehicleId=${baseVehicleId}` : `${API_BASE}/bodytypes`;
    const response = await fetch(url);
    return response.json();
  },

  getFuelTypes: async (baseVehicleId?: number): Promise<Array<{id: number, name: string}>> => {
    const url = baseVehicleId ? `${API_BASE}/fueltypes?baseVehicleId=${baseVehicleId}` : `${API_BASE}/fueltypes`;
    const response = await fetch(url);
    return response.json();
  },

  getAspirations: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/aspirations`);
    return response.json();
  },

  getVehicleTypes: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/vehicletypes`);
    return response.json();
  },

  getManufacturers: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/manufacturers`);
    return response.json();
  },

  getEquipmentModels: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/equipmentmodels`);
    return response.json();
  },

  getPartTypes: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/parttypes`);
    return response.json();
  },

  getPositions: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/positions`);
    return response.json();
  },

  getQualifiers: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/qualifiers`);
    return response.json();
  },

  getBrands: async (): Promise<Array<{id: string, name: string}>> => {
    const response = await fetch(`${API_BASE}/brands`);
    return response.json();
  }
};