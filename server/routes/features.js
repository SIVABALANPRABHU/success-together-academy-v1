import express from 'express';
import Feature from '../models/Feature.js';

const router = express.Router();

// GET /api/features - Get all features
router.get('/', async (req, res) => {
  try {
    const features = await Feature.findAll();
    res.json({
      success: true,
      data: features,
    });
  } catch (error) {
    console.error('Error fetching features:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching features',
      error: error.message,
    });
  }
});

// GET /api/features/:id - Get feature by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const feature = await Feature.findById(id);

    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found',
      });
    }

    res.json({
      success: true,
      data: feature,
    });
  } catch (error) {
    console.error('Error fetching feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching feature',
      error: error.message,
    });
  }
});

// POST /api/features - Create new feature
router.post('/', async (req, res) => {
  try {
    const { name, icon, path, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Feature name is required',
      });
    }

    // Check if feature name already exists
    const existingFeature = await Feature.findByName(name);
    if (existingFeature) {
      return res.status(400).json({
        success: false,
        message: 'Feature name already exists',
      });
    }

    const feature = await Feature.create({
      name,
      icon,
      path,
      description,
    });

    res.status(201).json({
      success: true,
      message: 'Feature created successfully',
      data: feature,
    });
  } catch (error) {
    console.error('Error creating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating feature',
      error: error.message,
    });
  }
});

// PUT /api/features/:id - Update feature
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, path, description } = req.body;

    // Check if feature exists
    const existingFeature = await Feature.findById(id);
    if (!existingFeature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found',
      });
    }

    // Check if name is being changed and already exists
    if (name && name !== existingFeature.name) {
      const nameExists = await Feature.findByName(name);
      if (nameExists) {
        return res.status(400).json({
          success: false,
          message: 'Feature name already exists',
        });
      }
    }

    const feature = await Feature.update(id, {
      name,
      icon,
      path,
      description,
    });

    res.json({
      success: true,
      message: 'Feature updated successfully',
      data: feature,
    });
  } catch (error) {
    console.error('Error updating feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating feature',
      error: error.message,
    });
  }
});

// DELETE /api/features/:id - Delete feature
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if feature exists
    const existingFeature = await Feature.findById(id);
    if (!existingFeature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found',
      });
    }

    await Feature.delete(id);

    res.json({
      success: true,
      message: 'Feature deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting feature:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting feature',
      error: error.message,
    });
  }
});

export default router;

