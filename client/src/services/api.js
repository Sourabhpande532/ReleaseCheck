const API_BASE = process.env.REACT_APP_API_URL || '/api';

export const api = {
  async getSteps() {
    const res = await fetch(`${API_BASE}/steps`);
    if (!res.ok) throw new Error('Failed to fetch release steps');
    return res.json();
  },

  async getReleases() {
    const res = await fetch(`${API_BASE}/releases`);
    if (!res.ok) throw new Error('Failed to fetch releases');
    return res.json();
  },

  async getReleaseById(id) {
    const res = await fetch(`${API_BASE}/releases/${id}`);
    if (!res.ok) throw new Error(`Failed to fetch release with id ${id}`);
    return res.json();
  },

  async createRelease(data) {
    const res = await fetch(`${API_BASE}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create release');
    return json;
  },

  async updateRelease(id, data) {
    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update release');
    return json;
  },

  async deleteRelease(id) {
    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete release');
    return json;
  }
};
