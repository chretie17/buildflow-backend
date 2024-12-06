const db = require('../db');

// Get all tasks for a project
exports.getTasksByProject = (req, res) => {
    const projectId = req.params.projectId;
    db.query('SELECT * FROM tasks WHERE project_id = ?', [projectId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json(results);
    });
};

// Create a new task
exports.createTask = (req, res) => {
    const { project_id, name, assigned_to, due_date } = req.body;
    const query = 'INSERT INTO tasks (project_id, name, assigned_to, due_date) VALUES (?, ?, ?, ?)';
    db.query(query, [project_id, name, assigned_to, due_date], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json({ id: results.insertId, project_id, name, assigned_to, due_date });
    });
};

// Update a task
exports.updateTask = (req, res) => {
    const taskId = req.params.id;
    const { name, assigned_to, due_date, status } = req.body;
    const query = 'UPDATE tasks SET name = ?, assigned_to = ?, due_date = ?, status = ? WHERE id = ?';
    db.query(query, [name, assigned_to, due_date, status, taskId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Task updated successfully' });
    });
};

// Delete a task
exports.deleteTask = (req, res) => {
    const taskId = req.params.id;
    db.query('DELETE FROM tasks WHERE id = ?', [taskId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: 'Task deleted successfully' });
    });
};
