import express from 'express';
import Chapter from '../models/Chapter.js';

const router = express.Router();

// GET /api/chapters - Get all chapters
router.get('/', async (req, res) => {
  try {
    const { search, status, limit, offset } = req.query;

    const filters = {
      search,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const chapters = await Chapter.findAll(filters);
    const total = await Chapter.count(filters);

    res.json({
      success: true,
      data: chapters,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chapters',
      error: error.message,
    });
  }
});

// GET /api/chapters/:id - Get chapter by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const chapter = await Chapter.findById(id);

    if (!chapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    res.json({
      success: true,
      data: chapter,
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chapter',
      error: error.message,
    });
  }
});

// POST /api/chapters - Create new chapter
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

    const chapter = await Chapter.create({
      title,
      description,
      thumbnail_url,
      order_index,
      status: status || 'active',
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Chapter created successfully',
      data: chapter,
    });
  } catch (error) {
    console.error('Error creating chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating chapter',
      error: error.message,
    });
  }
});

// PUT /api/chapters/:id - Update chapter
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, order_index, status } = req.body;

    const existingChapter = await Chapter.findById(id);
    if (!existingChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const chapter = await Chapter.update(id, {
      title,
      description,
      thumbnail_url,
      order_index,
      status,
    });

    res.json({
      success: true,
      message: 'Chapter updated successfully',
      data: chapter,
    });
  } catch (error) {
    console.error('Error updating chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating chapter',
      error: error.message,
    });
  }
});

// DELETE /api/chapters/:id - Delete chapter
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingChapter = await Chapter.findById(id);
    if (!existingChapter) {
      return res.status(404).json({
        success: false,
        message: 'Chapter not found',
      });
    }

    await Chapter.delete(id);

    res.json({
      success: true,
      message: 'Chapter deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting chapter',
      error: error.message,
    });
  }
});

// POST /api/chapters/:id/pages - Add page to chapter (single or bulk)
router.post('/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { page_id, page_ids, order_index } = req.body;

    // Check if bulk add (page_ids array) or single add (page_id)
    if (page_ids && Array.isArray(page_ids)) {
      // Bulk add
      if (page_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'page_ids array cannot be empty',
        });
      }

      const results = await Chapter.addPages(id, page_ids);

      res.json({
        success: true,
        message: `${results.length} page(s) added to chapter successfully`,
        data: results,
      });
    } else if (page_id) {
      // Single add
      const result = await Chapter.addPage(id, page_id, order_index || 0);

      res.json({
        success: true,
        message: 'Page added to chapter successfully',
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either page_id or page_ids array is required',
      });
    }
  } catch (error) {
    console.error('Error adding page to chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding page to chapter',
      error: error.message,
    });
  }
});

// DELETE /api/chapters/:id/pages/:pageId - Remove page from chapter
router.delete('/:id/pages/:pageId', async (req, res) => {
  try {
    const { id, pageId } = req.params;

    await Chapter.removePage(id, pageId);

    res.json({
      success: true,
      message: 'Page removed from chapter successfully',
    });
  } catch (error) {
    console.error('Error removing page from chapter:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing page from chapter',
      error: error.message,
    });
  }
});

// PUT /api/chapters/:id/pages/order - Update page order in chapter
router.put('/:id/pages/order', async (req, res) => {
  try {
    const { id } = req.params;
    const { pageOrders } = req.body; // Array of { pageId, orderIndex }

    if (!Array.isArray(pageOrders)) {
      return res.status(400).json({
        success: false,
        message: 'pageOrders must be an array',
      });
    }

    await Chapter.updatePageOrder(id, pageOrders);

    res.json({
      success: true,
      message: 'Page order updated successfully',
    });
  } catch (error) {
    console.error('Error updating page order:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating page order',
      error: error.message,
    });
  }
});

// GET /api/chapters/course/:courseId - Get chapters by course ID
router.get('/course/:courseId', async (req, res) => {
  try {
    const { courseId } = req.params;
    const chapters = await Chapter.findByCourseId(courseId);

    res.json({
      success: true,
      data: chapters,
    });
  } catch (error) {
    console.error('Error fetching course chapters:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching course chapters',
      error: error.message,
    });
  }
});

export default router;

