const express = require('express');
const router = express.Router();
const {
  getSteps,
  getAllReleases,
  getReleaseById,
  createRelease,
  updateRelease,
  deleteRelease
} = require('../controllers/releaseController');

// Steps meta route
router.get('/steps', getSteps);

// Releases CRUD routes
router.get('/releases', getAllReleases);
router.get('/releases/:id', getReleaseById);
router.post('/releases', createRelease);
router.put('/releases/:id', updateRelease);
router.delete('/releases/:id', deleteRelease);

module.exports = router;
