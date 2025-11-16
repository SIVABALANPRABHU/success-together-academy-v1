import pool from '../config/database.js';

class Content {
  // Get all contents with optional filters
  static async findAll(filters = {}) {
    let query = 'SELECT c.*, u.name as created_by_name FROM contents c LEFT JOIN users u ON c.created_by = u.id WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.content_type) {
      query += ` AND c.content_type = $${paramCount}`;
      params.push(filters.content_type);
      paramCount++;
    }

    if (filters.content_source) {
      query += ` AND c.content_source = $${paramCount}`;
      params.push(filters.content_source);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY c.created_at DESC';

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
    // Parse metadata JSONB to object if it exists
    return result.rows.map(row => ({
      ...row,
      metadata: row.metadata && typeof row.metadata === 'string' 
        ? JSON.parse(row.metadata) 
        : row.metadata,
    }));
  }

  // Count contents with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM contents c WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.content_type) {
      query += ` AND c.content_type = $${paramCount}`;
      params.push(filters.content_type);
      paramCount++;
    }

    if (filters.content_source) {
      query += ` AND c.content_source = $${paramCount}`;
      params.push(filters.content_source);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND c.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get content by ID
  static async findById(id) {
    const query = `
      SELECT c.*, u.name as created_by_name 
      FROM contents c 
      LEFT JOIN users u ON c.created_by = u.id 
      WHERE c.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    // Parse metadata JSONB to object if it exists
    const content = result.rows[0];
    return {
      ...content,
      metadata: content.metadata && typeof content.metadata === 'string'
        ? JSON.parse(content.metadata)
        : content.metadata,
    };
  }

  // Create new content
  static async create(contentData) {
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
    } = contentData;

    const query = `
      INSERT INTO contents (
        title, description, content_type, content_source, content_url,
        thumbnail_url, status, metadata, created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
      RETURNING *
    `;

    const result = await pool.query(query, [
      title,
      description || null,
      content_type,
      content_source,
      content_url,
      thumbnail_url || null,
      status || 'active',
      metadata ? JSON.stringify(metadata) : null,
      created_by || null,
    ]);

    // Fetch with created_by_name
    return await this.findById(result.rows[0].id);
  }

  // Update content
  static async update(id, contentData) {
    const {
      title,
      description,
      content_type,
      content_source,
      content_url,
      thumbnail_url,
      status,
      metadata,
    } = contentData;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount}`);
      params.push(title);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description || null);
      paramCount++;
    }

    if (content_type !== undefined) {
      updates.push(`content_type = $${paramCount}`);
      params.push(content_type);
      paramCount++;
    }

    if (content_source !== undefined) {
      updates.push(`content_source = $${paramCount}`);
      params.push(content_source);
      paramCount++;
    }

    if (content_url !== undefined) {
      updates.push(`content_url = $${paramCount}`);
      params.push(content_url);
      paramCount++;
    }

    if (thumbnail_url !== undefined) {
      updates.push(`thumbnail_url = $${paramCount}`);
      params.push(thumbnail_url || null);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (metadata !== undefined) {
      updates.push(`metadata = $${paramCount}`);
      params.push(metadata ? JSON.stringify(metadata) : null);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE contents 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    // Fetch with created_by_name
    return await this.findById(result.rows[0].id);
  }

  // Delete content
  static async delete(id) {
    const query = 'DELETE FROM contents WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Content;

