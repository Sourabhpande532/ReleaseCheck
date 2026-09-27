import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../services/api';

export const fetchSteps = createAsyncThunk(
  'releases/fetchSteps',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getSteps();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReleases = createAsyncThunk(
  'releases/fetchReleases',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getReleases();
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const fetchReleaseById = createAsyncThunk(
  'releases/fetchReleaseById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.getReleaseById(id);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const createRelease = createAsyncThunk(
  'releases/createRelease',
  async (releaseData, { rejectWithValue }) => {
    try {
      const response = await api.createRelease(releaseData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const updateRelease = createAsyncThunk(
  'releases/updateRelease',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.updateRelease(id, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteRelease = createAsyncThunk(
  'releases/deleteRelease',
  async (id, { rejectWithValue }) => {
    try {
      await api.deleteRelease(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const initialState = {
  items: [],
  steps: [
    { id: 'pr_merged', label: 'All relevant Github pull requests have been merged' },
    { id: 'changelog_updated', label: 'CHANGELOG.md files have been updated' },
    { id: 'tests_passing', label: 'All tests are passing' },
    { id: 'github_release_created', label: 'Releases in Github created' },
    { id: 'deployed_demo', label: 'Deployed in demo' },
    { id: 'tested_demo', label: 'Tested thoroughly in demo' },
    { id: 'deployed_production', label: 'Deployed in production' }
  ],
  currentRelease: null,
  activeView: 'list', // 'list' | 'detail' | 'new'
  loading: false,
  saving: false,
  error: null,
  filter: 'all',
  searchQuery: ''
};

const releasesSlice = createSlice({
  name: 'releases',
  initialState,
  reducers: {
    setActiveView: (state, action) => {
      state.activeView = action.payload;
      state.error = null;
    },
    setCurrentRelease: (state, action) => {
      state.currentRelease = action.payload;
    },
    clearCurrentRelease: (state) => {
      state.currentRelease = null;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Steps
      .addCase(fetchSteps.fulfilled, (state, action) => {
        if (action.payload && action.payload.length > 0) {
          state.steps = action.payload;
        }
      })
      // Fetch Releases
      .addCase(fetchReleases.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReleases.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReleases.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load releases';
      })
      // Fetch Release By Id
      .addCase(fetchReleaseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReleaseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRelease = action.payload;
      })
      .addCase(fetchReleaseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load release';
      })
      // Create Release
      .addCase(createRelease.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createRelease.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload);
        state.currentRelease = action.payload;
        state.activeView = 'list';
      })
      .addCase(createRelease.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to create release';
      })
      // Update Release
      .addCase(updateRelease.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateRelease.fulfilled, (state, action) => {
        state.saving = false;
        const index = state.items.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.currentRelease = action.payload;
      })
      .addCase(updateRelease.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to update release';
      })
      // Delete Release
      .addCase(deleteRelease.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(deleteRelease.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
        if (state.currentRelease && state.currentRelease.id === action.payload) {
          state.currentRelease = null;
          state.activeView = 'list';
        }
      })
      .addCase(deleteRelease.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to delete release';
      });
  }
});

export const {
  setActiveView,
  setCurrentRelease,
  clearCurrentRelease,
  setFilter,
  setSearchQuery,
  clearError
} = releasesSlice.actions;

export default releasesSlice.reducer;
