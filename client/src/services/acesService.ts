const API_BASE = 'http://localhost:3000/api';

export const acesService = {
  async getYears(): Promise<number[]> {
    const response = await fetch(`${API_BASE}/aces/years`);
    return response.json();
  },

  async getMakes(year: number): Promise<string[]> {
    const response = await fetch(`${API_BASE}/aces/makes/${year}`);
    return response.json();
  },

  async getModels(year: number, make: string): Promise<string[]> {
    const response = await fetch(`${API_BASE}/aces/models/${year}/${encodeURIComponent(make)}`);
    return response.json();
  },

  async getSubModels(year: number, make: string, model: string): Promise<string[]> {
    const response = await fetch(`${API_BASE}/aces/submodels/${year}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`);
    return response.json();
  },

  async getEngines(year: number, make: string, model: string): Promise<string[]> {
    const response = await fetch(`${API_BASE}/aces/engines/${year}/${encodeURIComponent(make)}/${encodeURIComponent(model)}`);
    return response.json();
  }
};