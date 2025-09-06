const API_BASE = '/api/vcdb';

export const vcdbApi = {
  getYears: async (): Promise<number[]> => {
    const response = await fetch(`${API_BASE}/years`);
    return response.json();
  },

  getMakes: async (): Promise<Array<{id: number, name: string}>> => {
    const response = await fetch(`${API_BASE}/makes`);
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