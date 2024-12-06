const express = require('express');
const {
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/:projectId', getTasksByProject);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
