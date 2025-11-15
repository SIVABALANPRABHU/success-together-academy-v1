import express from 'express';
import Permission from '../models/Permission.js';
import Feature from '../models/Feature.js';
import Role from '../models/Role.js';

const router = express.Router();

// GET /api/permissions - Get all permissions
router.get('/', async (req, res) => {
  try {
    const { role_id, feature_id } = req.query;
    
    let permissions;
    if (role_id) {
      permissions = await Permission.findByRoleId(role_id);
    } else if (feature_id) {
      permissions = await Permission.findByFeatureId(feature_id);
    } else {
      permissions = await Permission.findAll();
    }

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permissions',
      error: error.message,
    });
  }
});

// GET /api/permissions/:id - Get permission by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findById(id);

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
    }

    res.json({
      success: true,
      data: permission,
    });
  } catch (error) {
    console.error('Error fetching permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching permission',
      error: error.message,
    });
  }
});

// POST /api/permissions - Create new permission
router.post('/', async (req, res) => {
  try {
    const { feature_id, role_id, can_view, can_view_detail, can_add, can_edit, can_delete } = req.body;

    // Validation
    if (!feature_id || !role_id) {
      return res.status(400).json({
        success: false,
        message: 'Feature ID and Role ID are required',
      });
    }

    // Check if feature exists
    const feature = await Feature.findById(feature_id);
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found',
      });
    }

    // Check if role exists
    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    // Check if permission already exists
    const existingPermission = await Permission.findByFeatureAndRole(feature_id, role_id);
    if (existingPermission) {
      return res.status(400).json({
        success: false,
        message: 'Permission already exists for this feature and role',
      });
    }

    const permission = await Permission.create({
      feature_id,
      role_id,
      can_view,
      can_view_detail,
      can_add,
      can_edit,
      can_delete,
    });

    res.status(201).json({
      success: true,
      message: 'Permission created successfully',
      data: permission,
    });
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating permission',
      error: error.message,
    });
  }
});

// PUT /api/permissions/:id - Update permission
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { can_view, can_view_detail, can_add, can_edit, can_delete } = req.body;

    // Check if permission exists
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
    }

    const permission = await Permission.update(id, {
      can_view,
      can_view_detail,
      can_add,
      can_edit,
      can_delete,
    });

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message,
    });
  }
});

// PUT /api/permissions/feature/:featureId/role/:roleId - Update permission by feature and role
router.put('/feature/:featureId/role/:roleId', async (req, res) => {
  try {
    const { featureId, roleId } = req.params;
    const { can_view, can_view_detail, can_add, can_edit, can_delete } = req.body;

    // Check if feature exists
    const feature = await Feature.findById(featureId);
    if (!feature) {
      return res.status(404).json({
        success: false,
        message: 'Feature not found',
      });
    }

    // Check if role exists
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    const permission = await Permission.updateByFeatureAndRole(featureId, roleId, {
      can_view,
      can_view_detail,
      can_add,
      can_edit,
      can_delete,
    });

    if (!permission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
    }

    res.json({
      success: true,
      message: 'Permission updated successfully',
      data: permission,
    });
  } catch (error) {
    console.error('Error updating permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating permission',
      error: error.message,
    });
  }
});

// DELETE /api/permissions/:id - Delete permission
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if permission exists
    const existingPermission = await Permission.findById(id);
    if (!existingPermission) {
      return res.status(404).json({
        success: false,
        message: 'Permission not found',
      });
    }

    await Permission.delete(id);

    res.json({
      success: true,
      message: 'Permission deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting permission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting permission',
      error: error.message,
    });
  }
});

export default router;

