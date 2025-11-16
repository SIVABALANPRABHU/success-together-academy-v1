import express from 'express';
import Content from '../models/Content.js';

const router = express.Router();

// GET /api/contents - Get all contents
router.get('/', async (req, res) => {
  try {
    const {
      search,
      content_type,
      content_source,
      status,
      limit,
      offset,
    } = req.query;

    const filters = {
      search,
      content_type,
      content_source,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const contents = await Content.findAll(filters);
    const total = await Content.count(filters);

    res.json({
      success: true,
      data: contents,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching contents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contents',
      error: error.message,
    });
  }
});

// GET /api/contents/:id - Get content by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    res.json({
      success: true,
      data: content,
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching content',
      error: error.message,
    });
  }
});

// POST /api/contents - Create new content
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      content_type,
      content_source,
      content_url,
      thumbnail_url,
      status,
      metadata,
      created_by,
    } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    if (!content_type || !['video', 'file', 'markdown', 'image'].includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content_type is required (video, file, markdown, image)',
      });
    }

    if (!content_source || !['internal', 'external'].includes(content_source)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content_source is required (internal, external)',
      });
    }

    if (!content_url) {
      return res.status(400).json({
        success: false,
        message: 'Content URL is required',
      });
    }

    const content = await Content.create({
      title,
      description,
      content_type,
      content_source,
      content_url,
      thumbnail_url,
      status: status || 'active',
      metadata,
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      data: content,
    });
  } catch (error) {
    console.error('Error creating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating content',
      error: error.message,
    });
  }
});

// PUT /api/contents/:id - Update content
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      content_type,
      content_source,
      content_url,
      thumbnail_url,
      status,
      metadata,
    } = req.body;

    // Check if content exists
    const existingContent = await Content.findById(id);
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    // Validate content_type if provided
    if (content_type && !['video', 'file', 'markdown', 'image'].includes(content_type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content_type is required (video, file, markdown, image)',
      });
    }

    // Validate content_source if provided
    if (content_source && !['internal', 'external'].includes(content_source)) {
      return res.status(400).json({
        success: false,
        message: 'Valid content_source is required (internal, external)',
      });
    }

    // Validate status if provided
    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const content = await Content.update(id, {
      title,
      description,
      content_type,
      content_source,
      content_url,
      thumbnail_url,
      status,
      metadata,
    });

    res.json({
      success: true,
      message: 'Content updated successfully',
      data: content,
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating content',
      error: error.message,
    });
  }
});

// DELETE /api/contents/:id - Delete content
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if content exists
    const existingContent = await Content.findById(id);
    if (!existingContent) {
      return res.status(404).json({
        success: false,
        message: 'Content not found',
      });
    }

    await Content.delete(id);

    res.json({
      success: true,
      message: 'Content deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting content',
      error: error.message,
    });
  }
});

export default router;


