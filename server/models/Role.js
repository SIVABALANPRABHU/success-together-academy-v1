import pool from '../config/database.js';

class Role {
  // Get all roles
  static async findAll() {
    const query = 'SELECT * FROM roles ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get role by ID
  static async findById(id) {
    const query = 'SELECT * FROM roles WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get role by name
  static async findByName(name) {
    const query = 'SELECT * FROM roles WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Create new role
  static async create(roleData) {
    const { name, description, can_self_register = false, home_page } = roleData;
    const query = `
      INSERT INTO roles (name, description, can_self_register, home_page, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [name, description || null, can_self_register, home_page || null]);
    return result.rows[0];
  }

  // Update role
  static async update(id, roleData) {
    const { name, description, can_self_register, home_page } = roleData;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (can_self_register !== undefined) {
      updates.push(`can_self_register = $${paramCount}`);
      params.push(can_self_register);
      paramCount++;
    }

    if (home_page !== undefined) {
      updates.push(`home_page = $${paramCount}`);
      params.push(home_page || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE roles 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Delete role
  static async delete(id) {
    const query = 'DELETE FROM roles WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Role;

