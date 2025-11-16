import express from 'express';
import Package from '../models/Package.js';

const router = express.Router();

// GET /api/packages - Get all packages
router.get('/', async (req, res) => {
  try {
    const { search, status, package_type, menu_id, limit, offset } = req.query;

    const filters = {
      search,
      status,
      package_type,
      menu_id,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    };

    const packages = await Package.findAll(filters);
    const total = await Package.count(filters);

    res.json({
      success: true,
      data: packages,
      total,
      limit: filters.limit,
      offset: filters.offset || 0,
    });
  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching packages',
      error: error.message,
    });
  }
});

// GET /api/packages/:id - Get package by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const packageData = await Package.findById(id);

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    // Get courses for this package
    const courses = await Package.getCoursesByPackageId(id);

    res.json({
      success: true,
      data: {
        ...packageData,
        courses,
      },
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching package',
      error: error.message,
    });
  }
});

// POST /api/packages - Create new package
router.post('/', async (req, res) => {
  try {
    const { name, description, duration_days, amount, menu_id, package_type, status, created_by } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    if (!duration_days || duration_days < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid duration_days is required (minimum 1 day)',
      });
    }

    if (amount === undefined || amount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required (minimum 0)',
      });
    }

    if (package_type && !['free', 'basic', 'intermediate', 'advanced', 'premium'].includes(package_type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid package_type is required (free, basic, intermediate, advanced, premium)',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const packageData = await Package.create({
      name,
      description,
      duration_days,
      amount,
      menu_id,
      package_type,
      status: status || 'active',
      created_by,
    });

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: packageData,
    });
  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating package',
      error: error.message,
    });
  }
});

// PUT /api/packages/:id - Update package
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration_days, amount, menu_id, package_type, status } = req.body;

    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    if (package_type && !['free', 'basic', 'intermediate', 'advanced', 'premium'].includes(package_type)) {
      return res.status(400).json({
        success: false,
        message: 'Valid package_type is required (free, basic, intermediate, advanced, premium)',
      });
    }

    if (status && !['active', 'inactive', 'draft'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (active, inactive, draft)',
      });
    }

    const packageData = await Package.update(id, {
      name,
      description,
      duration_days,
      amount,
      menu_id,
      package_type,
      status,
    });

    res.json({
      success: true,
      message: 'Package updated successfully',
      data: packageData,
    });
  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating package',
      error: error.message,
    });
  }
});

// DELETE /api/packages/:id - Delete package
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingPackage = await Package.findById(id);
    if (!existingPackage) {
      return res.status(404).json({
        success: false,
        message: 'Package not found',
      });
    }

    await Package.delete(id);

    res.json({
      success: true,
      message: 'Package deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting package',
      error: error.message,
    });
  }
});

// POST /api/packages/:id/courses - Add course(s) to package
router.post('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const { course_id, course_ids } = req.body;

    if (course_ids && Array.isArray(course_ids)) {
      // Bulk add
      if (course_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'course_ids array cannot be empty',
        });
      }

      const results = await Package.addCourses(id, course_ids);

      res.json({
        success: true,
        message: `${results.length} course(s) added to package successfully`,
        data: results,
      });
    } else if (course_id) {
      // Single add
      const result = await Package.addCourse(id, course_id);

      res.json({
        success: true,
        message: 'Course added to package successfully',
        data: result,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either course_id or course_ids array is required',
      });
    }
  } catch (error) {
    console.error('Error adding course to package:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding course to package',
      error: error.message,
    });
  }
});

// DELETE /api/packages/:id/courses/:courseId - Remove course from package
router.delete('/:id/courses/:courseId', async (req, res) => {
  try {
    const { id, courseId } = req.params;

    await Package.removeCourse(id, courseId);

    res.json({
      success: true,
      message: 'Course removed from package successfully',
    });
  } catch (error) {
    console.error('Error removing course from package:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing course from package',
      error: error.message,
    });
  }
});

// GET /api/packages/:id/courses - Get courses by package ID
router.get('/:id/courses', async (req, res) => {
  try {
    const { id } = req.params;
    const courses = await Package.getCoursesByPackageId(id);

    res.json({
      success: true,
      data: courses,
    });
  } catch (error) {
    console.error('Error fetching package courses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching package courses',
      error: error.message,
    });
  }
});

export default router;


