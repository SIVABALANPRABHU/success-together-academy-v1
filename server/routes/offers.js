import express from 'express';
import Offer from '../models/Offer.js';

const router = express.Router();

// GET /api/offers - Get all offers
router.get('/', async (req, res) => {
  try {
    const { search, status, package_id, active_only, limit, offset } = req.query;

    const filters = {
      search,
      status,
      package_id,
      active_only: active_only === 'true',
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const offers = await Offer.findAll(filters);
    const total = await Offer.count(filters);

    res.json({
      success: true,
      data: offers,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offers',
      error: error.message,
    });
  }
});

// GET /api/offers/:id - Get offer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    res.json({
      success: true,
      data: offer,
    });
  } catch (error) {
    console.error('Error fetching offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching offer',
      error: error.message,
    });
  }
});

// POST /api/offers - Create new offer
router.post('/', async (req, res) => {
  try {
    const { package_id, offer_text, discount_percentage, start_date, end_date, status, created_by } = req.body;

    if (!package_id) {
      return res.status(400).json({
        success: false,
        message: 'package_id is required',
      });
    }

    if (!offer_text) {
      return res.status(400).json({
        success: false,
        message: 'offer_text is required',
      });
    }

    if (discount_percentage === undefined || discount_percentage < 0 || discount_percentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Valid discount_percentage is required (0-100)',
      });
    }

    if (!start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'start_date and end_date are required',
      });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        message: 'end_date must be after start_date',
      });
    }

    if (status && !['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, expired)',
      });
    }

    const offer = await Offer.create({
      package_id,
      offer_text,
      discount_percentage,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: status || 'active',
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Offer created successfully',
      data: offer,
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating offer',
      error: error.message,
    });
  }
});

// PUT /api/offers/:id - Update offer
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { package_id, offer_text, discount_percentage, start_date, end_date, status } = req.body;

    const existingOffer = await Offer.findById(id);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    if (discount_percentage !== undefined && (discount_percentage < 0 || discount_percentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Valid discount_percentage is required (0-100)',
      });
    }

    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          message: 'end_date must be after start_date',
        });
      }
    }

    if (status && !['active', 'inactive', 'expired'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, expired)',
      });
    }

    const updateData = {
      package_id,
      offer_text,
      discount_percentage,
      start_date: start_date ? new Date(start_date).toISOString() : undefined,
      end_date: end_date ? new Date(end_date).toISOString() : undefined,
      status,
    };

    const offer = await Offer.update(id, updateData);

    res.json({
      success: true,
      message: 'Offer updated successfully',
      data: offer,
    });
  } catch (error) {
    console.error('Error updating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating offer',
      error: error.message,
    });
  }
});

// DELETE /api/offers/:id - Delete offer
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingOffer = await Offer.findById(id);
    if (!existingOffer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    await Offer.delete(id);

    res.json({
      success: true,
      message: 'Offer deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting offer',
      error: error.message,
    });
  }
});

// GET /api/offers/package/:packageId - Get offers by package ID
router.get('/package/:packageId', async (req, res) => {
  try {
    const { packageId } = req.params;
    const offers = await Offer.findByPackageId(packageId);

    res.json({
      success: true,
      data: offers,
    });
  } catch (error) {
    console.error('Error fetching package offers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching package offers',
      error: error.message,
    });
  }
});

export default router;


