import express from 'express';
import Membership from '../models/Membership.js';
import Package from '../models/Package.js';
import User from '../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';

const router = express.Router();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_RgPbfABQXRxHRe',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '69huvwWacAvITIKxFddhUKYK',
});

// Helper function to calculate end date based on start date and duration
const calculateEndDate = (startDate, durationDays) => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + durationDays);
  return endDate.toISOString().split('T')[0];
};

// GET /api/memberships - Get all memberships
router.get('/', async (req, res) => {
  try {
    const { search, user_id, package_id, payment_type, payment_status, status, limit, offset } = req.query;

    const filters = {
      search,
      user_id,
      package_id,
      payment_type,
      payment_status,
      status,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const memberships = await Membership.findAll(filters);
    const total = await Membership.count(filters);

    res.json({
      success: true,
      data: memberships,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching memberships',
      error: error.message,
    });
  }
});

// GET /api/memberships/:id - Get membership by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    res.json({
      success: true,
      data: membership,
    });
  } catch (error) {
    console.error('Error fetching membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching membership',
      error: error.message,
    });
  }
});

// GET /api/memberships/user/:userId - Get memberships for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const memberships = await Membership.findAll({ user_id: userId, limit: 100 });

    res.json({
      success: true,
      data: memberships,
    });
  } catch (error) {
    console.error('Error fetching user memberships:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user memberships',
      error: error.message,
    });
  }
});

// GET /api/memberships/user/:userId/active - Get active membership for a user
router.get('/user/:userId/active', async (req, res) => {
  try {
    const { userId } = req.params;
    const membership = await Membership.findActiveByUserId(userId);

    res.json({
      success: true,
      data: membership,
    });
  } catch (error) {
    console.error('Error fetching active membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active membership',
      error: error.message,
    });
  }
});

// POST /api/memberships - Create new membership (manual payment)
router.post('/', async (req, res) => {
  try {
    const { user_id, package_id, payment_type, start_date, created_by } = req.body;

    if (!user_id || !package_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Package ID are required',
      });
    }

    // Get package details
    const packageData = await Package.findById(package_id);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    // Get user details
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate dates
    const startDate = start_date ? new Date(start_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const endDate = calculateEndDate(startDate, packageData.duration_days);

    // Create membership
    const membershipData = {
      user_id,
      package_id,
      payment_type: payment_type || 'manual',
      payment_status: payment_type === 'manual' ? 'pending' : 'pending',
      start_date: startDate,
      end_date: endDate,
      amount: parseFloat(packageData.amount),
      status: payment_type === 'manual' ? 'pending' : 'pending',
      created_by: created_by || null,
    };

    const membership = await Membership.create(membershipData);

    res.status(201).json({
      success: true,
      message: 'Membership created successfully',
      data: membership,
    });
  } catch (error) {
    console.error('Error creating membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating membership',
      error: error.message,
    });
  }
});

// POST /api/memberships/razorpay/create-order - Create Razorpay order
router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { user_id, package_id, created_by } = req.body;

    if (!user_id || !package_id) {
      return res.status(400).json({
        success: false,
        message: 'User ID and Package ID are required',
      });
    }

    // Get package details
    const packageData = await Package.findById(package_id);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    // Get user details
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate dates
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = calculateEndDate(startDate, packageData.duration_days);
    const amount = parseFloat(packageData.amount) * 100; // Convert to paise

    // Create Razorpay order
    const options = {
      amount: amount,
      currency: 'INR',
      receipt: `membership_${user_id}_${package_id}_${Date.now()}`,
      notes: {
        user_id: user_id.toString(),
        package_id: package_id.toString(),
        package_name: packageData.name,
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create membership with pending status
    const membershipData = {
      user_id,
      package_id,
      payment_type: 'razorpay',
      payment_status: 'pending',
      start_date: startDate,
      end_date: endDate,
      amount: parseFloat(packageData.amount),
      razorpay_order_id: razorpayOrder.id,
      status: 'pending',
      created_by: created_by || null,
    };

    const membership = await Membership.create(membershipData);

    res.json({
      success: true,
      data: {
        membership,
        razorpay_order: {
          id: razorpayOrder.id,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          key_id: razorpay.key_id,
        },
      },
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating Razorpay order',
      error: error.message,
    });
  }
});

// POST /api/memberships/razorpay/verify-payment - Verify Razorpay payment
router.post('/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Razorpay order ID, payment ID, and signature are required',
      });
    }

    // Find membership by order ID
    const membership = await Membership.findByRazorpayOrderId(razorpay_order_id);
    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Update membership with payment details
    const updatedMembership = await Membership.update(membership.id, {
      razorpay_payment_id,
      payment_status: 'paid',
      status: 'active',
    });

    res.json({
      success: true,
      message: 'Payment verified and membership activated',
      data: updatedMembership,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment',
      error: error.message,
    });
  }
});

// PUT /api/memberships/:id/activate - Activate manual payment membership
router.put('/:id/activate', async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    if (membership.payment_type !== 'manual') {
      return res.status(400).json({
        success: false,
        message: 'This membership is not a manual payment type',
      });
    }

    if (membership.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Membership is already activated',
      });
    }

    // Activate membership
    const updatedMembership = await Membership.update(id, {
      payment_status: 'paid',
      status: 'active',
    });

    res.json({
      success: true,
      message: 'Membership activated successfully',
      data: updatedMembership,
    });
  } catch (error) {
    console.error('Error activating membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error activating membership',
      error: error.message,
    });
  }
});

// PUT /api/memberships/:id - Update membership
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    const updatedMembership = await Membership.update(id, req.body);

    res.json({
      success: true,
      message: 'Membership updated successfully',
      data: updatedMembership,
    });
  } catch (error) {
    console.error('Error updating membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating membership',
      error: error.message,
    });
  }
});

// DELETE /api/memberships/:id - Delete membership
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const membership = await Membership.findById(id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found',
      });
    }

    await Membership.delete(id);

    res.json({
      success: true,
      message: 'Membership deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting membership:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting membership',
      error: error.message,
    });
  }
});

export default router;

