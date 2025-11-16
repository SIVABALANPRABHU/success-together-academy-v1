import pool from '../config/database.js';

class Chapter {
  // Get all chapters with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT ch.*, u.name as created_by_name
      FROM chapters ch 
      LEFT JOIN users u ON ch.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND ch.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (ch.title ILIKE $${paramCount} OR ch.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY ch.order_index ASC, ch.created_at DESC';

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

  // Count chapters with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM chapters ch WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND ch.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (ch.title ILIKE $${paramCount} OR ch.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get chapter by ID
  static async findById(id) {
    const query = `
      SELECT ch.*, u.name as created_by_name
      FROM chapters ch 
      LEFT JOIN users u ON ch.created_by = u.id 
      WHERE ch.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Create new chapter
  static async create(data) {
    const query = `
      INSERT INTO chapters (title, description, thumbnail_url, order_index, status, created_by)
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

  // Update chapter
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
      UPDATE chapters 
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

  // Delete chapter
  static async delete(id) {
    const query = 'DELETE FROM chapters WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Add page to chapter
  static async addPage(chapterId, pageId, orderIndex) {
    const query = `
      INSERT INTO chapter_pages (chapter_id, page_id, order_index)
      VALUES ($1, $2, $3)
      ON CONFLICT (chapter_id, page_id) 
      DO UPDATE SET order_index = EXCLUDED.order_index
      RETURNING *
    `;
    const result = await pool.query(query, [chapterId, pageId, orderIndex]);
    return result.rows[0];
  }

  // Bulk add pages to chapter
  static async addPages(chapterId, pageIds) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Get current max order index
      const maxOrderResult = await client.query(
        'SELECT COALESCE(MAX(order_index), -1) as max_order FROM chapter_pages WHERE chapter_id = $1',
        [chapterId]
      );
      let currentOrder = maxOrderResult.rows[0].max_order + 1;
      
      const results = [];
      for (const pageId of pageIds) {
        const query = `
          INSERT INTO chapter_pages (chapter_id, page_id, order_index)
          VALUES ($1, $2, $3)
          ON CONFLICT (chapter_id, page_id) 
          DO UPDATE SET order_index = EXCLUDED.order_index
          RETURNING *
        `;
        const result = await client.query(query, [chapterId, pageId, currentOrder]);
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

  // Remove page from chapter
  static async removePage(chapterId, pageId) {
    const query = 'DELETE FROM chapter_pages WHERE chapter_id = $1 AND page_id = $2 RETURNING *';
    const result = await pool.query(query, [chapterId, pageId]);
    return result.rows[0] || null;
  }

  // Update page order in chapter
  static async updatePageOrder(chapterId, pageOrders) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      for (const { pageId, orderIndex } of pageOrders) {
        await client.query(
          'UPDATE chapter_pages SET order_index = $1 WHERE chapter_id = $2 AND page_id = $3',
          [orderIndex, chapterId, pageId]
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

  // Get chapters by course ID (ordered)
  static async findByCourseId(courseId) {
    const query = `
      SELECT ch.*, cc.order_index as course_order, u.name as created_by_name
      FROM chapters ch
      INNER JOIN course_chapters cc ON ch.id = cc.chapter_id
      LEFT JOIN users u ON ch.created_by = u.id
      WHERE cc.course_id = $1
      ORDER BY cc.order_index ASC
    `;
    const result = await pool.query(query, [courseId]);
    return result.rows;
  }
}

export default Chapter;

