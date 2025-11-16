import pool from '../config/database.js';

class Menu {
  // Get all menus with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT m.*, u.name as created_by_name
      FROM menus m 
      LEFT JOIN users u ON m.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND m.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (m.title ILIKE $${paramCount} OR m.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY m.order_index ASC, m.created_at DESC';

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

  // Count menus with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM menus m WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND m.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (m.title ILIKE $${paramCount} OR m.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get menu by ID
  static async findById(id) {
    const query = `
      SELECT m.*, u.name as created_by_name
      FROM menus m 
      LEFT JOIN users u ON m.created_by = u.id 
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Create new menu
  static async create(data) {
    const query = `
      INSERT INTO menus (title, description, thumbnail_url, order_index, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [
      data.title,
      data.description || null,
      data.thumbnail_url || null,
      data.order_index || 0,
      data.status || 'active',
      data.created_by || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update menu
  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramCount++}`);
      values.push(data.thumbnail_url);
    }
    if (data.order_index !== undefined) {
      updates.push(`order_index = $${paramCount++}`);
      values.push(data.order_index);
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
      UPDATE menus 
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

  // Delete menu
  static async delete(id) {
    const query = 'DELETE FROM menus WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Add course to menu
  static async addCourse(menuId, courseId, orderIndex) {
    const query = `
      INSERT INTO menu_courses (menu_id, course_id, order_index)
      VALUES ($1, $2, $3)
      ON CONFLICT (menu_id, course_id) 
      DO UPDATE SET order_index = EXCLUDED.order_index
      RETURNING *
    `;
    const result = await pool.query(query, [menuId, courseId, orderIndex]);
    return result.rows[0];
  }

  // Bulk add courses to menu
  static async addCourses(menuId, courseIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get current max order index
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM menu_courses WHERE menu_id = $1',
        [menuId]
      );
      let currentOrder = maxOrderResult.rows[0].max_order + 1;
      
      const results = [];
      for (const courseId of courseIds) {
        const query = `
          INSERT INTO menu_courses (menu_id, course_id, order_index)
          VALUES ($1, $2, $3)
          ON CONFLICT (menu_id, course_id) 
          DO UPDATE SET order_index = EXCLUDED.order_index
          RETURNING *
        `;
        const result = await client.query(query, [menuId, courseId, currentOrder]);
        results.push(result.rows[0]);
        currentOrder++;
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

  // Remove course from menu
  static async removeCourse(menuId, courseId) {
    const query = 'DELETE FROM menu_courses WHERE menu_id = $1 AND course_id = $2 RETURNING *';
    const result = await pool.query(query, [menuId, courseId]);
    return result.rows[0] || null;
  }

  // Update course order in menu
  static async updateCourseOrder(menuId, courseOrders) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { courseId, orderIndex } of courseOrders) {
        await client.query(
          'UPDATE menu_courses SET order_index = $1 WHERE menu_id = $2 AND course_id = $3',
          [orderIndex, menuId, courseId]
        );
      }
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export default Menu;

