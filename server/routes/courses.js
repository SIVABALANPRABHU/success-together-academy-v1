import express from 'express';
import Course from '../models/Course.js';

const router = express.Router();

// GET /api/courses - Get all courses
router.get('/', async (req, res) => {
  try {
    const { search, status, limit, offset } = req.query;

    const filters = {
      search,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const courses = await Course.findAll(filters);
    const total = await Course.count(filters);

    res.json({
      success: true,
      data: courses,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching courses',
      error: error.message,
    });
  }
});

// GET /api/courses/:id - Get course by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    res.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error fetching course:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course',
      error: error.message,
    });
  }
});

// POST /api/courses - Create new course
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

    const course = await Course.create({
      title,
      description,
      thumbnail_url,
      order_index,
      status: status || 'active',
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating course',
      error: error.message,
    });
  }
});

// PUT /api/courses/:id - Update course
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, order_index, status } = req.body;

    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const course = await Course.update(id, {
      title,
      description,
      thumbnail_url,
      order_index,
      status,
    });

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating course',
      error: error.message,
    });
  }
});

// DELETE /api/courses/:id - Delete course
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingCourse = await Course.findById(id);
    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        message: 'Course not found',
      });
    }

    await Course.delete(id);

    res.json({
      success: true,
      message: 'Course deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting course',
      error: error.message,
    });
  }
});

// POST /api/courses/:id/chapters - Add chapter to course (single or bulk)
router.post('/:id/chapters', async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_id, chapter_ids, order_index } = req.body;

    // Check if bulk add (chapter_ids array) or single add (chapter_id)
    if (chapter_ids && Array.isArray(chapter_ids)) {
      // Bulk add
      if (chapter_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'chapter_ids array cannot be empty',
        });
      }

      const results = await Course.addChapters(id, chapter_ids);

      res.json({
        success: true,
        message: `${results.length} chapter(s) added to course successfully`,
        data: results,
      });
    } else if (chapter_id) {
      // Single add
      const result = await Course.addChapter(id, chapter_id, order_index || 0);

      res.json({
        success: true,
        message: 'Chapter added to course successfully',
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either chapter_id or chapter_ids array is required',
      });
    }
  } catch (error) {
    console.error('Error adding chapter to course:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding chapter to course',
      error: error.message,
    });
  }
});

// DELETE /api/courses/:id/chapters/:chapterId - Remove chapter from course
router.delete('/:id/chapters/:chapterId', async (req, res) => {
  try {
    const { id, chapterId } = req.params;

    await Course.removeChapter(id, chapterId);

    res.json({
      success: true,
      message: 'Chapter removed from course successfully',
    });
  } catch (error) {
    console.error('Error removing chapter from course:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing chapter from course',
      error: error.message,
    });
  }
});

// PUT /api/courses/:id/chapters/order - Update chapter order in course
router.put('/:id/chapters/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { chapterOrders } = req.body; // Array of { chapterId, orderIndex }

    if (!Array.isArray(chapterOrders)) {
      return res.status(400).json({
        success: false,
        message: 'chapterOrders must be an array',
      });
    }

    await Course.updateChapterOrder(id, chapterOrders);

    res.json({
      success: true,
      message: 'Chapter order updated successfully',
    });
  } catch (error) {
    console.error('Error updating chapter order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating chapter order',
      error: error.message,
    });
  }
});

// GET /api/courses/menu/:menuId - Get courses by menu ID
router.get('/menu/:menuId', async (req, res) => {
  try {
    const { menuId } = req.params;
    const courses = await Course.findByMenuId(menuId);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching menu courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching menu courses',
      error: error.message,
    });
  }
});

export default router;

