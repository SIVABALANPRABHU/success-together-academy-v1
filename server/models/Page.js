import pool from '../config/database.js';

class Page {
  // Get all pages with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT p.*, u.name as created_by_name, c.title as content_title, c.content_type, c.content_url
      FROM pages p 
      LEFT JOIN users u ON p.created_by = u.id 
      LEFT JOIN contents c ON p.content_id = c.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.order_index ASC, p.created_at DESC';

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

  // Count pages with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM pages p WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (p.title ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get page by ID
  static async findById(id) {
    const query = `
      SELECT p.*, u.name as created_by_name, c.title as content_title, c.content_type, c.content_url
      FROM pages p 
      LEFT JOIN users u ON p.created_by = u.id 
      LEFT JOIN contents c ON p.content_id = c.id 
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Create new page
  static async create(data) {
    const query = `
      INSERT INTO pages (title, description, thumbnail_url, content_id, order_index, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.title,
      data.description || null,
      data.thumbnail_url || null,
      data.content_id || null,
      data.order_index || 0,
      data.status || 'active',
      data.created_by || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update page
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
    if (data.content_id !== undefined) {
      updates.push(`content_id = $${paramCount++}`);
      values.push(data.content_id);
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
      UPDATE pages 
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

  // Delete page
  static async delete(id) {
    const query = 'DELETE FROM pages WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get pages by chapter ID (ordered)
  static async findByChapterId(chapterId) {
    const query = `
      SELECT p.*, cp.order_index as chapter_order, u.name as created_by_name, c.title as content_title, c.content_type, c.content_url
      FROM pages p
      INNER JOIN chapter_pages cp ON p.id = cp.page_id
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN contents c ON p.content_id = c.id
      WHERE cp.chapter_id = $1
      ORDER BY cp.order_index ASC
    `;
    const result = await pool.query(query, [chapterId]);
    return result.rows;
  }
}

export default Page;


