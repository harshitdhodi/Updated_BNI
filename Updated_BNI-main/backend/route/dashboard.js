const express = require('express');
const router = express.Router();
const { getUserCounters, getDashboardStats } = require('../controller/dashboard');
const { requireAuth } = require('../middeleware/requireAuth');

/**
 * Get counter values for a specific user
 * GET /api/dashboard/counters?userId=<userId>
 */
// Support both query and route param usage:
// GET /api/dashboard/counters?userId=<userId>
// GET /api/dashboard/counters/:userId
router.get('/counters', requireAuth, getUserCounters);
router.get('/counters/:userId', requireAuth, getUserCounters);

/**
 * Get overall dashboard statistics
 * GET /api/dashboard/stats
 */
router.get('/stats',  getDashboardStats);

module.exports = router;
