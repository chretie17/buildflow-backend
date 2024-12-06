const db = require('../db');
const multer = require('multer');
const fs = require('fs');
const { json } = require('express');

// Setup multer storage to handle images
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 1. Add a New Project (with image and other data)
exports.addProject = [upload.array('images'), (req, res) => {
  const {
      project_name,
      description,
      status,
      start_date,
      end_date,
      budget,
      location,
      assigned_user,
  } = req.body;

  console.log('Received request to add project');
  console.log('Project Details:', {
      project_name,
      description,
      status,
      start_date,
      end_date,
      budget,
      location,
      assigned_user,  
  });

  if (!assigned_user) {
      return res.status(400).json({ message: 'Assigned user is required' });
  }

  if (!req.files || req.files.length === 0) {
      console.log('Error: No images uploaded');
      return res.status(400).json({ message: 'No images uploaded' });
  }

  // Convert each image buffer to Blob
  const imageBlobs = req.files.map(file => file.buffer);

  // Insert the project first
  const query = `
    INSERT INTO projects 
    (project_name, description, status, start_date, end_date, budget, location, assigned_user)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [
      project_name,
      description,
      status,
      start_date,
      end_date,
      budget,
      location,
      assigned_user, 
  ], (err, result) => {
      if (err) {
          console.log('Error adding project:', err);
          return res.status(500).json({ message: 'Error adding project' });
      }

      console.log('Project added successfully, Project ID:', result.insertId);

      // Insert each image into the `project_images` table
      const imageQueries = imageBlobs.map(imageBlob => {
          return new Promise((resolve, reject) => {
              const imageQuery = `
                  INSERT INTO project_images (project_id, image)
                  VALUES (?, ?)
              `;
              db.query(imageQuery, [result.insertId, imageBlob], (err) => {
                  if (err) reject(err);
                  resolve();
              });
          });
      });

      // Wait for all images to be inserted
      Promise.all(imageQueries)
          .then(() => {
              console.log('Images added successfully');
              res.status(200).json({ message: 'Project added successfully', projectId: result.insertId });
          })
          .catch(err => {
              console.log('Error adding images:', err);
              res.status(500).json({ message: 'Error adding images' });
          });
  });
}];



exports.getProjects = (req, res) => {
  const query = `
      SELECT p.*, u.username AS assigned_user
      FROM projects p
      LEFT JOIN users u ON u.id = p.assigned_user
      LEFT JOIN project_images pi ON pi.project_id = p.id
  `;
  
  db.query(query, (err, projects) => {
      if (err) {
          console.error('Error fetching projects:', err);
          return res.status(500).json({ message: 'Error fetching projects' });
      }

      // Group the images by project_id
      const projectMap = {};

      projects.forEach((project) => {
          const { project_id, image, ...rest } = project;

          if (!projectMap[project_id]) {
              projectMap[project_id] = { ...rest, images: [] };
          }

          if (image) {
              projectMap[project_id].images.push(`data:image/jpeg;base64,${image.toString('base64')}`);
          }
      });

      // Convert projectMap to an array of project objects
      const resultProjects = Object.values(projectMap);

      res.status(200).json(resultProjects);
  });
};

// 3. Update Project Progress or Status (and optionally upload new image)
exports.updateProjectProgress = [upload.array('images'), (req, res) => {
    const { project_id, status, assigned_user } = req.body;  // Use assigned_user as single user
    const imageBlobs = req.files ? req.files.map(file => file.buffer) : null;

    let updateQuery = 'UPDATE projects SET status = ?, assigned_user = ?';
    const updateValues = [status, assigned_user];  // Assign only one user

    if (imageBlobs && imageBlobs.length > 0) {
        updateQuery += ', image = ?';
        updateValues.push(JSON.stringify(imageBlobs));  // Store updated image blobs in DB
    }

    updateQuery += ' WHERE id = ?';
    updateValues.push(project_id);

    db.query(updateQuery, updateValues, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error updating project' });
        }
        res.status(200).json({ message: 'Project updated successfully' });
    });
}];

// 4. Delete a Project (Remove a project from the system)
exports.deleteProject = (req, res) => {
    const { project_id } = req.params;
    const query = 'DELETE FROM projects WHERE id = ?';

    db.query(query, [project_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error deleting project' });
        }
        res.status(200).json({ message: 'Project deleted successfully' });
    });
};

// 5. Get User by ID (Show username and other details if needed)
exports.getUserById = (req, res) => {
    const { user_id } = req.params;

    // Query to fetch the user by their ID
    const query = 'SELECT user_id, username FROM users WHERE user_id = ?';

    db.query(query, [user_id], (err, result) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Error fetching user' });
        }

        if (result.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send the user's data (username and user_id in this case)
        res.status(200).json({
            user_id: result[0].user_id,
            username: result[0].username
        });
    });
};
exports.getUsersByRole = (req, res) => {
  // MySQL query to get users with role 'member'
  const query = 'SELECT id AS user_id, username FROM users WHERE role = "member"';

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching users:', err);
      return res.status(500).json({ message: 'Error fetching users' });
    }
    res.status(200).json(results);  // Send the result (users with their user_id and username)
  });
};