const express = require('express');
const router = express.Router();
const reportController = require('../controllers/ReportController');

// Route to get project overview with date range support
router.get('/project-overview', reportController.getProjectOverview);

// Route to get project budgets with date range support

// Route to get user performance with date range support
router.get('/user-performance', reportController.getUserPerformance);

// Route to get project status with date range support
router.get('/project-status', reportController.getProjectStatus);

// Route to get recent project updates with date range support
router.get('/recent-updates', reportController.getRecentProjectUpdates);

module.exports = router;
