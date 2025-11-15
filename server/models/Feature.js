import pool from '../config/database.js';

class Feature {
  // Get all features
  static async findAll() {
    const query = 'SELECT * FROM features ORDER BY name';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get feature by ID
  static async findById(id) {
    const query = 'SELECT * FROM features WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get feature by name
  static async findByName(name) {
    const query = 'SELECT * FROM features WHERE name = $1';
    const result = await pool.query(query, [name]);
    return result.rows[0];
  }

  // Get feature by path
  static async findByPath(path) {
    const query = 'SELECT * FROM features WHERE path = $1';
    const result = await pool.query(query, [path]);
    return result.rows[0];
  }

  // Create new feature
  static async create(featureData) {
    const { name, icon, path, description } = featureData;
    const query = `
      INSERT INTO features (name, icon, path, description, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [name, icon || null, path || null, description || null]);
    return result.rows[0];
  }

  // Update feature
  static async update(id, featureData) {
    const { name, icon, path, description } = featureData;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }

    if (icon !== undefined) {
      updates.push(`icon = $${paramCount}`);
      params.push(icon || null);
      paramCount++;
    }

    if (path !== undefined) {
      updates.push(`path = $${paramCount}`);
      params.push(path || null);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description || null);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE features 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Delete feature
  static async delete(id) {
    const query = 'DELETE FROM features WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export default Feature;

