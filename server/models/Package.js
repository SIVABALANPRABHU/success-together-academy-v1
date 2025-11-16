import pool from '../config/database.js';

class Package {
  // Get all packages with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, m.title as menu_title, u.name as created_by_name
      FROM packages p 
      LEFT JOIN menus m ON p.menu_id = m.id 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.package_type) {
      query += ` AND p.package_type = $${paramCount}`;
      params.push(filters.package_type);
      paramCount++;
    }

    if (filters.menu_id) {
      query += ` AND p.menu_id = $${paramCount}`;
      params.push(filters.menu_id);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters.offset) {
      query += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Count packages with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM packages p WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.package_type) {
      query += ` AND p.package_type = $${paramCount}`;
      params.push(filters.package_type);
      paramCount++;
    }

    if (filters.menu_id) {
      query += ` AND p.menu_id = $${paramCount}`;
      params.push(filters.menu_id);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get package by ID
  static async findById(id) {
    const query = `
      SELECT p.*, m.title as menu_title, u.name as created_by_name
      FROM packages p 
      LEFT JOIN menus m ON p.menu_id = m.id 
      LEFT JOIN users u ON p.created_by = u.id 
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Create new package
  static async create(data) {
    const query = `
      INSERT INTO packages (name, description, duration_days, amount, menu_id, package_type, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      data.name,
      data.description || null,
      data.duration_days,
      data.amount,
      data.menu_id || null,
      data.package_type || 'basic',
      data.status || 'active',
      data.created_by || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update package
  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.duration_days !== undefined) {
      updates.push(`duration_days = $${paramCount++}`);
      values.push(data.duration_days);
    }
    if (data.amount !== undefined) {
      updates.push(`amount = $${paramCount++}`);
      values.push(data.amount);
    }
    if (data.menu_id !== undefined) {
      updates.push(`menu_id = $${paramCount++}`);
      values.push(data.menu_id);
    }
    if (data.package_type !== undefined) {
      updates.push(`package_type = $${paramCount++}`);
      values.push(data.package_type);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE packages 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0];
  }

  // Delete package
  static async delete(id) {
    const query = 'DELETE FROM packages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Add course to package
  static async addCourse(packageId, courseId) {
    const query = `
      INSERT INTO package_courses (package_id, course_id)
      VALUES ($1, $2)
      ON CONFLICT (package_id, course_id) DO NOTHING
      RETURNING *
    `;
    const result = await pool.query(query, [packageId, courseId]);
    return result.rows[0];
  }

  // Bulk add courses to package
  static async addCourses(packageId, courseIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const results = [];
      for (const courseId of courseIds) {
        const query = `
          INSERT INTO package_courses (package_id, course_id)
          VALUES ($1, $2)
          ON CONFLICT (package_id, course_id) DO NOTHING
          RETURNING *
        `;
        const result = await client.query(query, [packageId, courseId]);
        if (result.rows[0]) {
          results.push(result.rows[0]);
        }
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Remove course from package
  static async removeCourse(packageId, courseId) {
    const query = 'DELETE FROM package_courses WHERE package_id = $1 AND course_id = $2 RETURNING *';
    const result = await pool.query(query, [packageId, courseId]);
    return result.rows[0] || null;
  }

  // Get courses by package ID
  static async getCoursesByPackageId(packageId) {
    const query = `
      SELECT c.*, pc.created_at as added_at
      FROM courses c
      INNER JOIN package_courses pc ON c.id = pc.course_id
      WHERE pc.package_id = $1
      ORDER BY pc.created_at ASC
    `;
    const result = await pool.query(query, [packageId]);
    return result.rows;
  }
}

export default Package;


