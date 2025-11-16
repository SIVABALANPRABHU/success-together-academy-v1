import pool from '../config/database.js';

class Offer {
  // Get all offers with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT o.*, p.name as package_name, p.amount as package_amount, u.name as created_by_name
      FROM offers o 
      LEFT JOIN packages p ON o.package_id = p.id 
      LEFT JOIN users u ON o.created_by = u.id 
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.package_id) {
      query += ` AND o.package_id = $${paramCount}`;
      params.push(filters.package_id);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND o.offer_text ILIKE $${paramCount}`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    // Filter by active offers (current date between start and end)
    if (filters.active_only) {
      query += ` AND o.start_date <= CURRENT_TIMESTAMP AND o.end_date >= CURRENT_TIMESTAMP AND o.status = 'active'`;
    }

    query += ' ORDER BY o.created_at DESC';

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

  // Count offers with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM offers o WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.status) {
      query += ` AND o.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.package_id) {
      query += ` AND o.package_id = $${paramCount}`;
      params.push(filters.package_id);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND o.offer_text ILIKE $${paramCount}`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.active_only) {
      query += ` AND o.start_date <= CURRENT_TIMESTAMP AND o.end_date >= CURRENT_TIMESTAMP AND o.status = 'active'`;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get offer by ID
  static async findById(id) {
    const query = `
      SELECT o.*, p.name as package_name, p.amount as package_amount, u.name as created_by_name
      FROM offers o 
      LEFT JOIN packages p ON o.package_id = p.id 
      LEFT JOIN users u ON o.created_by = u.id 
      WHERE o.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Create new offer
  static async create(data) {
    const query = `
      INSERT INTO offers (package_id, offer_text, discount_percentage, start_date, end_date, status, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [
      data.package_id,
      data.offer_text,
      data.discount_percentage,
      data.start_date,
      data.end_date,
      data.status || 'active',
      data.created_by || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update offer
  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.package_id !== undefined) {
      updates.push(`package_id = $${paramCount++}`);
      values.push(data.package_id);
    }
    if (data.offer_text !== undefined) {
      updates.push(`offer_text = $${paramCount++}`);
      values.push(data.offer_text);
    }
    if (data.discount_percentage !== undefined) {
      updates.push(`discount_percentage = $${paramCount++}`);
      values.push(data.discount_percentage);
    }
    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(data.end_date);
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
      UPDATE offers 
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

  // Delete offer
  static async delete(id) {
    const query = 'DELETE FROM offers WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Get offers by package ID
  static async findByPackageId(packageId) {
    const query = `
      SELECT o.*, p.name as package_name, p.amount as package_amount
      FROM offers o
      LEFT JOIN packages p ON o.package_id = p.id
      WHERE o.package_id = $1
      ORDER BY o.created_at DESC
    `;
    const result = await pool.query(query, [packageId]);
    return result.rows;
  }
}

export default Offer;


