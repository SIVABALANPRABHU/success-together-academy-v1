import pool from '../config/database.js';

class Membership {
  // Get all memberships with optional filters
  static async findAll(filters = {}) {
    let query = `
      SELECT m.*, 
             u.name as user_name, u.email as user_email,
             p.name as package_name, p.amount as package_amount, p.duration_days as package_duration,
             created_by_user.name as created_by_name
      FROM memberships m 
      LEFT JOIN users u ON m.user_id = u.id 
      LEFT JOIN packages p ON m.package_id = p.id
      LEFT JOIN users created_by_user ON m.created_by = created_by_user.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND m.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.package_id) {
      query += ` AND m.package_id = $${paramCount}`;
      params.push(filters.package_id);
      paramCount++;
    }

    if (filters.payment_type) {
      query += ` AND m.payment_type = $${paramCount}`;
      params.push(filters.payment_type);
      paramCount++;
    }

    if (filters.payment_status) {
      query += ` AND m.payment_status = $${paramCount}`;
      params.push(filters.payment_status);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND m.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount} OR p.name ILIKE $${paramCount})`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    query += ' ORDER BY m.created_at DESC';

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

  // Count memberships with filters
  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM memberships m WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (filters.user_id) {
      query += ` AND m.user_id = $${paramCount}`;
      params.push(filters.user_id);
      paramCount++;
    }

    if (filters.package_id) {
      query += ` AND m.package_id = $${paramCount}`;
      params.push(filters.package_id);
      paramCount++;
    }

    if (filters.payment_type) {
      query += ` AND m.payment_type = $${paramCount}`;
      params.push(filters.payment_type);
      paramCount++;
    }

    if (filters.payment_status) {
      query += ` AND m.payment_status = $${paramCount}`;
      params.push(filters.payment_status);
      paramCount++;
    }

    if (filters.status) {
      query += ` AND m.status = $${paramCount}`;
      params.push(filters.status);
      paramCount++;
    }

    if (filters.search) {
      query += ` AND EXISTS (
        SELECT 1 FROM users u WHERE u.id = m.user_id AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})
        UNION
        SELECT 1 FROM packages p WHERE p.id = m.package_id AND p.name ILIKE $${paramCount}
      )`;
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Get membership by ID
  static async findById(id) {
    const query = `
      SELECT m.*, 
             u.name as user_name, u.email as user_email,
             p.name as package_name, p.amount as package_amount, p.duration_days as package_duration,
             created_by_user.name as created_by_name
      FROM memberships m 
      LEFT JOIN users u ON m.user_id = u.id 
      LEFT JOIN packages p ON m.package_id = p.id
      LEFT JOIN users created_by_user ON m.created_by = created_by_user.id
      WHERE m.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (!result.rows[0]) return null;
    return result.rows[0];
  }

  // Get active membership for a user
  static async findActiveByUserId(userId) {
    const query = `
      SELECT m.*, 
             u.name as user_name, u.email as user_email,
             p.name as package_name, p.amount as package_amount, p.duration_days as package_duration
      FROM memberships m 
      LEFT JOIN users u ON m.user_id = u.id 
      LEFT JOIN packages p ON m.package_id = p.id
      WHERE m.user_id = $1 
        AND m.status = 'active' 
        AND m.payment_status = 'paid'
        AND m.end_date >= CURRENT_DATE
      ORDER BY m.end_date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  // Create new membership
  static async create(data) {
    const query = `
      INSERT INTO memberships (
        user_id, package_id, payment_type, payment_status, 
        start_date, end_date, amount, 
        razorpay_order_id, razorpay_payment_id, 
        status, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const values = [
      data.user_id,
      data.package_id,
      data.payment_type || 'manual',
      data.payment_status || 'pending',
      data.start_date,
      data.end_date,
      data.amount,
      data.razorpay_order_id || null,
      data.razorpay_payment_id || null,
      data.status || 'active',
      data.created_by || null,
    ];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Update membership
  static async update(id, data) {
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (data.payment_status !== undefined) {
      updates.push(`payment_status = $${paramCount++}`);
      values.push(data.payment_status);
    }
    if (data.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.start_date !== undefined) {
      updates.push(`start_date = $${paramCount++}`);
      values.push(data.start_date);
    }
    if (data.end_date !== undefined) {
      updates.push(`end_date = $${paramCount++}`);
      values.push(data.end_date);
    }
    if (data.razorpay_order_id !== undefined) {
      updates.push(`razorpay_order_id = $${paramCount++}`);
      values.push(data.razorpay_order_id);
    }
    if (data.razorpay_payment_id !== undefined) {
      updates.push(`razorpay_payment_id = $${paramCount++}`);
      values.push(data.razorpay_payment_id);
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE memberships 
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

  // Delete membership
  static async delete(id) {
    const query = 'DELETE FROM memberships WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  // Find by Razorpay order ID
  static async findByRazorpayOrderId(orderId) {
    const query = 'SELECT * FROM memberships WHERE razorpay_order_id = $1';
    const result = await pool.query(query, [orderId]);
    return result.rows[0] || null;
  }
}

export default Membership;

