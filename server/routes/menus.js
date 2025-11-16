import express from 'express';
import Menu from '../models/Menu.js';

const router = express.Router();

// GET /api/menus - Get all menus
router.get('/', async (req, res) => {
  try {
    const { search, status, limit, offset } = req.query;

    const filters = {
      search,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const menus = await Menu.findAll(filters);
    const total = await Menu.count(filters);

    res.json({
      success: true,
      data: menus,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching menus:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menus',
      error: error.message,
    });
  }
});

// GET /api/menus/:id - Get menu by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const menu = await Menu.findById(id);

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found',
      });
    }

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu',
      error: error.message,
    });
  }
});

// POST /api/menus - Create new menu
router.post('/', async (req, res) => {
  try {
    const { title, description, thumbnail_url, order_index, status, created_by } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const menu = await Menu.create({
      title,
      description,
      thumbnail_url,
      order_index,
      status: status || 'active',
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: menu,
    });
  } catch (error) {
    console.error('Error creating menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating menu',
      error: error.message,
    });
  }
});

// PUT /api/menus/:id - Update menu
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, order_index, status } = req.body;

    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const menu = await Menu.update(id, {
      title,
      description,
      thumbnail_url,
      order_index,
      status,
    });

    res.json({
      success: true,
      message: 'Menu updated successfully',
      data: menu,
    });
  } catch (error) {
    console.error('Error updating menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating menu',
      error: error.message,
    });
  }
});

// DELETE /api/menus/:id - Delete menu
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingMenu = await Menu.findById(id);
    if (!existingMenu) {
      return res.status(404).json({
        success: false,
        message: 'Menu not found',
      });
    }

    await Menu.delete(id);

    res.json({
      success: true,
      message: 'Menu deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting menu',
      error: error.message,
    });
  }
});

// POST /api/menus/:id/courses - Add course to menu (single or bulk)
router.post('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, course_ids, order_index } = req.body;

    // Check if bulk add (course_ids array) or single add (course_id)
    if (course_ids && Array.isArray(course_ids)) {
      // Bulk add
      if (course_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'course_ids array cannot be empty',
        });
      }

      const results = await Menu.addCourses(id, course_ids);

      res.json({
        success: true,
        message: `${results.length} course(s) added to menu successfully`,
        data: results,
      });
    } else if (course_id) {
      // Single add
      const result = await Menu.addCourse(id, course_id, order_index || 0);

      res.json({
        success: true,
        message: 'Course added to menu successfully',
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either course_id or course_ids array is required',
      });
    }
  } catch (error) {
    console.error('Error adding course to menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course to menu',
      error: error.message,
    });
  }
});

// DELETE /api/menus/:id/courses/:courseId - Remove course from menu
router.delete('/:id/courses/:courseId', async (req, res) => {
  try {
    const { id, courseId } = req.params;

    await Menu.removeCourse(id, courseId);

    res.json({
      success: true,
      message: 'Course removed from menu successfully',
    });
  } catch (error) {
    console.error('Error removing course from menu:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course from menu',
      error: error.message,
    });
  }
});

// PUT /api/menus/:id/courses/order - Update course order in menu
router.put('/:id/courses/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { courseOrders } = req.body; // Array of { courseId, orderIndex }

    if (!Array.isArray(courseOrders)) {
      return res.status(400).json({
        success: false,
        message: 'courseOrders must be an array',
      });
    }

    await Menu.updateCourseOrder(id, courseOrders);

    res.json({
      success: true,
      message: 'Course order updated successfully',
    });
  } catch (error) {
    console.error('Error updating course order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course order',
      error: error.message,
    });
  }
});

export default router;

