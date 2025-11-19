const express = require('express');
const router = express.Router();
const { getUserCounters, getDashboardStats } = require('../controller/dashboard');
const { requireAuth } = require('../middeleware/requireAuth');

/**
 * Get counter values for a specific user
 * GET /api/dashboard/counters?userId=<userId>
 */
router.get('/counters',  getUserCounters);

/**
 * Get overall dashboard statistics
 * GET /api/dashboard/stats
 */
router.get('/stats',  getDashboardStats);

module.exports = router;
