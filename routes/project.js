const express = require('express');
const router = express.Router();
const projectController = require('../controllers/ProjectController');
router.get('users', projectController.getUsersByRole);

// Create a new project
router.post('/', projectController.addProject);

// Get all projects
router.get('/', projectController.getProjects);

// Update project progress/status
router.put('/', projectController.updateProjectProgress);

// Delete a project
router.delete('/:project_id', projectController.deleteProject);

module.exports = router;
