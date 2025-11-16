import express from 'express';
import Page from '../models/Page.js';

const router = express.Router();

// GET /api/pages - Get all pages
router.get('/', async (req, res) => {
  try {
    const { search, status, limit, offset } = req.query;

    const filters = {
      search,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const pages = await Page.findAll(filters);
    const total = await Page.count(filters);

    res.json({
      success: true,
      data: pages,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching pages',
      error: error.message,
    });
  }
});

// GET /api/pages/:id - Get page by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const page = await Page.findById(id);

    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching page',
      error: error.message,
    });
  }
});

// POST /api/pages - Create new page
router.post('/', async (req, res) => {
  try {
    const { title, description, thumbnail_url, content_id, order_index, status, created_by } = req.body;

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

    const page = await Page.create({
      title,
      description,
      thumbnail_url,
      content_id,
      order_index,
      status: status || 'active',
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Page created successfully',
      data: page,
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating page',
      error: error.message,
    });
  }
});

// PUT /api/pages/:id - Update page
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, thumbnail_url, content_id, order_index, status } = req.body;

    const existingPage = await Page.findById(id);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const page = await Page.update(id, {
      title,
      description,
      thumbnail_url,
      content_id,
      order_index,
      status,
    });

    res.json({
      success: true,
      message: 'Page updated successfully',
      data: page,
    });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating page',
      error: error.message,
    });
  }
});

// DELETE /api/pages/:id - Delete page
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingPage = await Page.findById(id);
    if (!existingPage) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    await Page.delete(id);

    res.json({
      success: true,
      message: 'Page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting page',
      error: error.message,
    });
  }
});

// GET /api/pages/chapter/:chapterId - Get pages by chapter ID
router.get('/chapter/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const pages = await Page.findByChapterId(chapterId);

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('Error fetching chapter pages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chapter pages',
      error: error.message,
    });
  }
});

export default router;

