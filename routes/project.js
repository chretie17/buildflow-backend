const express = require('express');
const router = express.Router();
const projectController = require('../controllers/ProjectController');

router.get('/users', projectController.getUsersByRole);

router.post('/', projectController.addProject);

router.get('/:project_id/images', projectController.getProjectImages);  // New route for images


router.get('/', projectController.getProjects);

// Update project progress/status
router.put('/', projectController.updateProjectProgress);

// Delete a project
router.delete('/:project_id', projectController.deleteProject);

module.exports = router;
