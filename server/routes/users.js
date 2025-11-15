import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', async (req, res) => {
  try {
    const { search, role_id, status, limit, offset } = req.query;
    const filters = {
      search,
      role_id: role_id ? parseInt(role_id) : undefined,
      status,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0,
    };

    const users = await User.findAll(filters);
    const total = await User.count(filters);

    res.json({
      success: true,
      data: users,
      total,
      limit: filters.limit,
      offset: filters.offset,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message,
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message,
    });
  }
});

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const { name, email, role_id, status, password, thumbnail } = req.body;

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    // Check if email already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    // Validate role_id if provided
    if (role_id) {
      const role = await Role.findById(role_id);
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
        });
      }
    }

    // Hash password if provided
    const user = await User.create({
      name,
      email,
      role_id: role_id ? parseInt(role_id) : undefined,
      status: status || 'Active',
      password,
      thumbnail,
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating user',
      error: error.message,
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role_id, status, password, thumbnail } = req.body;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await User.findByEmail(email);
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists',
        });
      }
    }

    // Validate role_id if provided
    if (role_id) {
      const role = await Role.findById(parseInt(role_id));
      if (!role) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role ID',
        });
      }
    }

    const user = await User.update(id, {
      name,
      email,
      role_id: role_id ? parseInt(role_id) : undefined,
      status,
      password,
      thumbnail,
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message,
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await User.delete(id);

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message,
    });
  }
});


export default router;

