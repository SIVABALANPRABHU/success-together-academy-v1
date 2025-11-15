import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  // Get all users with role information
  static async findAll(filters = {}) {
    const { search, role_id, status, limit = 100, offset = 0 } = filters;
    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role_id,
        r.name as role_name,
        u.status,
        u.thumbnail,
        u.password,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role_id) {
      query += ` AND u.role_id = $${paramCount}`;
      params.push(role_id);
      paramCount++;
    }

    if (status) {
      query += ` AND u.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    // Remove password from results
    return result.rows.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  // Get user by ID with role information
  static async findById(id) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role_id,
        r.name as role_name,
        u.status,
        u.thumbnail,
        u.password,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = $1
    `;
    const result = await pool.query(query, [id]);
    if (result.rows[0]) {
      const { password, ...userWithoutPassword } = result.rows[0];
      return userWithoutPassword;
    }
    return null;
  }

  // Get user by email with role information
  static async findByEmail(email) {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role_id,
        r.name as role_name,
        u.status,
        u.thumbnail,
        u.password,
        u.created_at,
        u.updated_at
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  // Create new user
  static async create(userData) {
    const { name, email, role_id, status = 'Active', password, thumbnail } = userData;
    
    // Hash password if provided
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // If role_id not provided, get default Student role
    let finalRoleId = role_id;
    if (!finalRoleId) {
      const roleResult = await pool.query("SELECT id FROM roles WHERE name = 'Student' LIMIT 1");
      finalRoleId = roleResult.rows[0]?.id;
    }

    const query = `
      INSERT INTO users (name, email, role_id, status, password, thumbnail, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING id, name, email, role_id, status, thumbnail, created_at, updated_at
    `;
    const result = await pool.query(query, [
      name, 
      email, 
      finalRoleId, 
      status, 
      hashedPassword, 
      thumbnail || null
    ]);
    
    // Get role name
    const user = result.rows[0];
    if (user.role_id) {
      const roleResult = await pool.query('SELECT name FROM roles WHERE id = $1', [user.role_id]);
      user.role_name = roleResult.rows[0]?.name;
    }
    
    return user;
  }

  // Update user
  static async update(id, userData) {
    const { name, email, role_id, status, password, thumbnail } = userData;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      params.push(email);
      paramCount++;
    }

    if (role_id !== undefined) {
      updates.push(`role_id = $${paramCount}`);
      params.push(role_id);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (thumbnail !== undefined) {
      updates.push(`thumbnail = $${paramCount}`);
      params.push(thumbnail);
      paramCount++;
    }

    if (password !== undefined) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.push(`password = $${paramCount}`);
      params.push(hashedPassword);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role_id, status, thumbnail, created_at, updated_at
    `;

    const result = await pool.query(query, params);
    const user = result.rows[0];
    
    // Get role name
    if (user.role_id) {
      const roleResult = await pool.query('SELECT name FROM roles WHERE id = $1', [user.role_id]);
      user.role_name = roleResult.rows[0]?.name;
    }
    
    return user;
  }

  // Delete user
  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get total count
  static async count(filters = {}) {
    const { search, role_id, status } = filters;
    let query = 'SELECT COUNT(*) FROM users WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (search) {
      query += ` AND (name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (role_id) {
      query += ` AND role_id = $${paramCount}`;
      params.push(role_id);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }

  // Verify password
  static async verifyPassword(user, password) {
    if (!user.password) {
      return false;
    }
    return await bcrypt.compare(password, user.password);
  }
}

export default User;

