const { query } = require('../db');
const { DEFAULT_STEPS, computeStatus } = require('../constants');

// Fast in-memory cache for read operations
let memoryCache = {
  releasesList: null,
  releasesById: new Map(),
  lastUpdated: null
};

const invalidateCache = () => {
  memoryCache.releasesList = null;
  memoryCache.releasesById.clear();
  memoryCache.lastUpdated = Date.now();
};

// GET /api/steps
const getSteps = (req, res) => {
  res.json({
    success: true,
    data: DEFAULT_STEPS
  });
};

// GET /api/releases
const getAllReleases = async (req, res, next) => {
  try {
    const bypassCache = req.query.noCache === '1' || req.headers['x-no-cache'] === '1';

    // Return cached response if available
    if (!bypassCache && memoryCache.releasesList) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({
        success: true,
        data: memoryCache.releasesList,
        cached: true
      });
    }

    const result = await query(
      `SELECT id, name, TO_CHAR(release_date, 'YYYY-MM-DD') AS release_date, status, additional_info, steps_completed, created_at, updated_at 
       FROM releases 
       ORDER BY release_date DESC, id DESC`
    );

    if (!bypassCache) {
      memoryCache.releasesList = result.rows;
      res.setHeader('X-Cache', 'MISS');
    }

    res.json({
      success: true,
      data: result.rows,
      cached: false
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/releases/:id
const getReleaseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bypassCache = req.query.noCache === '1' || req.headers['x-no-cache'] === '1';

    if (!bypassCache && memoryCache.releasesById.has(id)) {
      res.setHeader('X-Cache', 'HIT');
      return res.json({
        success: true,
        data: memoryCache.releasesById.get(id),
        cached: true
      });
    }

    const result = await query(
      `SELECT id, name, TO_CHAR(release_date, 'YYYY-MM-DD') AS release_date, status, additional_info, steps_completed, created_at, updated_at 
       FROM releases 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    const release = result.rows[0];
    if (!bypassCache) {
      memoryCache.releasesById.set(id, release);
      res.setHeader('X-Cache', 'MISS');
    }

    res.json({
      success: true,
      data: release,
      cached: false
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/releases
const createRelease = async (req, res, next) => {
  try {
    const { name, release_date, additional_info = '', steps_completed = [] } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Release name is required and must be non-empty'
      });
    }

    if (!release_date || isNaN(Date.parse(release_date))) {
      return res.status(400).json({
        success: false,
        error: 'A valid release date is required'
      });
    }

    const stepsArray = Array.isArray(steps_completed) ? steps_completed : [];
    const calculatedStatus = computeStatus(stepsArray);

    const result = await query(
      `INSERT INTO releases (name, release_date, status, additional_info, steps_completed)
       VALUES ($1, $2, $3, $4, $5::jsonb)
       RETURNING id, name, TO_CHAR(release_date, 'YYYY-MM-DD') AS release_date, status, additional_info, steps_completed, created_at, updated_at`,
      [name.trim(), release_date, calculatedStatus, (additional_info || '').trim(), JSON.stringify(stepsArray)]
    );

    // Invalidate cache on write
    invalidateCache();

    res.status(201).json({
      success: true,
      message: 'Release created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/releases/:id
const updateRelease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, release_date, additional_info, steps_completed } = req.body;

    // Check existing release
    const existingResult = await query('SELECT * FROM releases WHERE id = $1', [id]);
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    const current = existingResult.rows[0];

    const updatedName = name !== undefined ? name.trim() : current.name;
    if (!updatedName) {
      return res.status(400).json({
        success: false,
        error: 'Release name cannot be empty'
      });
    }

    const updatedDate = release_date !== undefined ? release_date : current.release_date;
    if (!updatedDate || isNaN(Date.parse(updatedDate))) {
      return res.status(400).json({
        success: false,
        error: 'A valid release date is required'
      });
    }

    const updatedInfo = additional_info !== undefined ? additional_info.trim() : current.additional_info;
    const updatedSteps = steps_completed !== undefined && Array.isArray(steps_completed)
      ? steps_completed
      : (Array.isArray(current.steps_completed) ? current.steps_completed : []);

    const updatedStatus = computeStatus(updatedSteps);

    const updateResult = await query(
      `UPDATE releases
       SET name = $1,
           release_date = $2,
           status = $3,
           additional_info = $4,
           steps_completed = $5::jsonb,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name, TO_CHAR(release_date, 'YYYY-MM-DD') AS release_date, status, additional_info, steps_completed, created_at, updated_at`,
      [updatedName, updatedDate, updatedStatus, updatedInfo, JSON.stringify(updatedSteps), id]
    );

    // Invalidate cache on update
    invalidateCache();

    res.json({
      success: true,
      message: 'Release updated successfully',
      data: updateResult.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/releases/:id
const deleteRelease = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM releases WHERE id = $1 RETURNING id, name', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Release not found'
      });
    }

    // Invalidate cache on delete
    invalidateCache();

    res.json({
      success: true,
      message: `Release "${result.rows[0].name}" deleted successfully`,
      data: { id: result.rows[0].id }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSteps,
  getAllReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease,
  invalidateCache
};
