import express from 'express';
import Role from '../models/Role.js';
import pool from '../config/database.js';

const router = express.Router();

// GET /api/roles - Get all roles
router.get('/', async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching roles',
      error: error.message,
    });
  }
});

// GET /api/roles/:id - Get role by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching role',
      error: error.message,
    });
  }
});

// POST /api/roles - Create new role
router.post('/', async (req, res) => {
  try {
    const { name, description, can_self_register, home_page } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Role name is required',
      });
    }

    // Check if role name already exists
    const existingRole = await Role.findByName(name);
    if (existingRole) {
      return res.status(400).json({
        success: false,
        message: 'Role name already exists',
      });
    }

    const role = await Role.create({
      name,
      description,
      can_self_register: can_self_register || false,
      home_page,
    });

    res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating role',
      error: error.message,
    });
  }
});

// PUT /api/roles/:id - Update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, can_self_register, home_page } = req.body;

    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== existingRole.name) {
      const nameExists = await Role.findByName(name);
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Role name already exists',
        });
      }
    }

    const role = await Role.update(id, {
      name,
      description,
      can_self_register,
      home_page,
    });

    res.json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating role',
      error: error.message,
    });
  }
});

// DELETE /api/roles/:id - Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists
    const existingRole = await Role.findById(id);
    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if role is being used by any users
    const usersResult = await pool.query('SELECT COUNT(*) FROM users WHERE role_id = $1', [id]);
    const userCount = parseInt(usersResult.rows[0].count);

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role. It is assigned to ${userCount} user(s). Please reassign users first.`,
      });
    }

    await Role.delete(id);

    res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting role',
      error: error.message,
    });
  }
});

export default router;

