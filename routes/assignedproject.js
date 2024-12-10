const express = require('express');
const router = express.Router();
const projectController = require('../controllers/MemberProjectController'); 


router.get('/assigned/:userId', projectController.getAssignedProject);

// 2. Update Project Status & Add Construction Images
// PUT /projects/assigned/:userId
router.put('/assigned/:userId', projectController.updateAssignedProject);

module.exports = router;
