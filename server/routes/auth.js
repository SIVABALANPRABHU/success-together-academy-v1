import express from 'express';
import User from '../models/User.js';
import Role from '../models/Role.js';

const router = express.Router();

// POST /api/auth/register - Self register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, thumbnail } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Password validation
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
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

    // Get roles that allow self-registration
    const roles = await Role.findAll();
    const allowedRole = roles.find(role => role.can_self_register === true);
    
    if (!allowedRole) {
      return res.status(403).json({
        success: false,
        message: 'Self-registration is currently disabled. Please contact administrator.',
      });
    }

    // Create user with the role that allows self-registration
    const user = await User.create({
      name,
      email,
      role_id: allowedRole.id,
      status: 'Active',
      password,
      thumbnail,
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
});

// POST /api/auth/login - Login (for future use)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isValidPassword = await User.verifyPassword(user, password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: userWithoutPassword,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
});

export default router;

