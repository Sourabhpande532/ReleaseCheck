const resolveApiBase = () => {
  // If explicitly configured via environment variable
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL.replace(/\/+$/, '');
  }

  // When hosted on Vercel or remote production domain, default to deployed backend
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://release-check-p8xw.vercel.app/api';
  }

  // Default for local development with local proxy
  return '/api';
};

const API_BASE = resolveApiBase();

export const api = {
  async getSteps() {
    const res = await fetch(`${API_BASE}/steps`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || 'Failed to fetch release steps');
    }
    return res.json();
  },

  async getReleases() {
    const res = await fetch(`${API_BASE}/releases`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || 'Failed to fetch releases');
    }
    return res.json();
  },

  async getReleaseById(id) {
    const res = await fetch(`${API_BASE}/releases/${id}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
      throw new Error(err.error || `Failed to fetch release with id ${id}`);
    }
    return res.json();
  },

  async createRelease(data) {
    const res = await fetch(`${API_BASE}/releases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({ error: 'Invalid JSON server response' }));
    if (!res.ok) throw new Error(json.error || 'Failed to create release');
    return json;
  },

  async updateRelease(id, data) {
    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json().catch(() => ({ error: 'Invalid JSON server response' }));
    if (!res.ok) throw new Error(json.error || 'Failed to update release');
    return json;
  },

  async deleteRelease(id) {
    const res = await fetch(`${API_BASE}/releases/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json().catch(() => ({ error: 'Invalid JSON server response' }));
    if (!res.ok) throw new Error(json.error || 'Failed to delete release');
    return json;
  }
};
