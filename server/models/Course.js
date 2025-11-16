import pool from '../config/database.js';

class Course {
  // Get all courses with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT co.*, u.name as created_by_name
      FROM courses co 
      LEFT JOIN users u ON co.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND co.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (co.title ILIKE $${paramCount} OR co.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY co.order_index ASC, co.created_at DESC';

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

  // Count courses with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM courses co WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND co.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (co.title ILIKE $${paramCount} OR co.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get course by ID
  static async findById(id) {
    const query = `
      SELECT co.*, u.name as created_by_name
      FROM courses co 
      LEFT JOIN users u ON co.created_by = u.id 
      WHERE co.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Create new course
  static async create(data) {
    const query = `
      INSERT INTO courses (title, description, thumbnail_url, order_index, status, created_by)
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

  // Update course
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
      UPDATE courses 
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

  // Delete course
  static async delete(id) {
    const query = 'DELETE FROM courses WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Add chapter to course
  static async addChapter(courseId, chapterId, orderIndex) {
    const query = `
      INSERT INTO course_chapters (course_id, chapter_id, order_index)
      VALUES ($1, $2, $3)
      ON CONFLICT (course_id, chapter_id) 
      DO UPDATE SET order_index = EXCLUDED.order_index
      RETURNING *
    `;
    const result = await pool.query(query, [courseId, chapterId, orderIndex]);
    return result.rows[0];
  }

  // Bulk add chapters to course
  static async addChapters(courseId, chapterIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get current max order index
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM course_chapters WHERE course_id = $1',
        [courseId]
      );
      let currentOrder = maxOrderResult.rows[0].max_order + 1;
      
      const results = [];
      for (const chapterId of chapterIds) {
        const query = `
          INSERT INTO course_chapters (course_id, chapter_id, order_index)
          VALUES ($1, $2, $3)
          ON CONFLICT (course_id, chapter_id) 
          DO UPDATE SET order_index = EXCLUDED.order_index
          RETURNING *
        `;
        const result = await client.query(query, [courseId, chapterId, currentOrder]);
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

  // Remove chapter from course
  static async removeChapter(courseId, chapterId) {
    const query = 'DELETE FROM course_chapters WHERE course_id = $1 AND chapter_id = $2 RETURNING *';
    const result = await pool.query(query, [courseId, chapterId]);
    return result.rows[0] || null;
  }

  // Update chapter order in course
  static async updateChapterOrder(courseId, chapterOrders) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { chapterId, orderIndex } of chapterOrders) {
        await client.query(
          'UPDATE course_chapters SET order_index = $1 WHERE course_id = $2 AND chapter_id = $3',
          [orderIndex, courseId, chapterId]
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

  // Get courses by menu ID (ordered)
  static async findByMenuId(menuId) {
    const query = `
      SELECT co.*, mc.order_index as menu_order, u.name as created_by_name
      FROM courses co
      INNER JOIN menu_courses mc ON co.id = mc.course_id
      LEFT JOIN users u ON co.created_by = u.id
      WHERE mc.menu_id = $1
      ORDER BY mc.order_index ASC
    `;
    const result = await pool.query(query, [menuId]);
    return result.rows;
  }
}

export default Course;

