import pool from '../config/database.js';

class Permission {
  // Get all permissions
  static async findAll() {
    const query = `
      SELECT 
        p.*,
        f.name as feature_name,
        f.icon as feature_icon,
        f.path as feature_path,
        r.name as role_name
      FROM permissions p
      JOIN features f ON p.feature_id = f.id
      JOIN roles r ON p.role_id = r.id
      ORDER BY r.name, f.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  // Get permission by ID
  static async findById(id) {
    const query = `
      SELECT 
        p.*,
        f.name as feature_name,
        f.icon as feature_icon,
        f.path as feature_path,
        r.name as role_name
      FROM permissions p
      JOIN features f ON p.feature_id = f.id
      JOIN roles r ON p.role_id = r.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Get permissions by role ID
  static async findByRoleId(roleId) {
    const query = `
      SELECT 
        p.*,
        f.name as feature_name,
        f.icon as feature_icon,
        f.path as feature_path,
        r.name as role_name
      FROM permissions p
      JOIN features f ON p.feature_id = f.id
      JOIN roles r ON p.role_id = r.id
      WHERE p.role_id = $1
      ORDER BY f.name
    `;
    const result = await pool.query(query, [roleId]);
    return result.rows;
  }

  // Get permissions by feature ID
  static async findByFeatureId(featureId) {
    const query = `
      SELECT 
        p.*,
        f.name as feature_name,
        f.icon as feature_icon,
        f.path as feature_path,
        r.name as role_name
      FROM permissions p
      JOIN features f ON p.feature_id = f.id
      JOIN roles r ON p.role_id = r.id
      WHERE p.feature_id = $1
      ORDER BY r.name
    `;
    const result = await pool.query(query, [featureId]);
    return result.rows;
  }

  // Get permission by feature and role
  static async findByFeatureAndRole(featureId, roleId) {
    const query = `
      SELECT 
        p.*,
        f.name as feature_name,
        f.icon as feature_icon,
        f.path as feature_path,
        r.name as role_name
      FROM permissions p
      JOIN features f ON p.feature_id = f.id
      JOIN roles r ON p.role_id = r.id
      WHERE p.feature_id = $1 AND p.role_id = $2
    `;
    const result = await pool.query(query, [featureId, roleId]);
    return result.rows[0];
  }

  // Check if user has permission
  static async checkPermission(roleId, featurePath, action) {
    const query = `
      SELECT p.${action}
      FROM permissions p
      JOIN features f ON p.feature_id = f.id
      WHERE p.role_id = $1 AND f.path = $2
    `;
    const result = await pool.query(query, [roleId, featurePath]);
    return result.rows[0]?.[action] || false;
  }

  // Create new permission
  static async create(permissionData) {
    const { feature_id, role_id, can_view, can_view_detail, can_add, can_edit, can_delete } = permissionData;
    const query = `
      INSERT INTO permissions (feature_id, role_id, can_view, can_view_detail, can_add, can_edit, can_delete, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *
    `;
    const result = await pool.query(query, [
      feature_id,
      role_id,
      can_view || false,
      can_view_detail || false,
      can_add || false,
      can_edit || false,
      can_delete || false
    ]);
    return result.rows[0];
  }

  // Update permission
  static async update(id, permissionData) {
    const { can_view, can_view_detail, can_add, can_edit, can_delete } = permissionData;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (can_view !== undefined) {
      updates.push(`can_view = $${paramCount}`);
      params.push(can_view);
      paramCount++;
    }

    if (can_view_detail !== undefined) {
      updates.push(`can_view_detail = $${paramCount}`);
      params.push(can_view_detail);
      paramCount++;
    }

    if (can_add !== undefined) {
      updates.push(`can_add = $${paramCount}`);
      params.push(can_add);
      paramCount++;
    }

    if (can_edit !== undefined) {
      updates.push(`can_edit = $${paramCount}`);
      params.push(can_edit);
      paramCount++;
    }

    if (can_delete !== undefined) {
      updates.push(`can_delete = $${paramCount}`);
      params.push(can_delete);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findById(id);
    }

    updates.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE permissions 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Update permission by feature and role
  static async updateByFeatureAndRole(featureId, roleId, permissionData) {
    const { can_view, can_view_detail, can_add, can_edit, can_delete } = permissionData;
    const updates = [];
    const params = [];
    let paramCount = 1;

    if (can_view !== undefined) {
      updates.push(`can_view = $${paramCount}`);
      params.push(can_view);
      paramCount++;
    }

    if (can_view_detail !== undefined) {
      updates.push(`can_view_detail = $${paramCount}`);
      params.push(can_view_detail);
      paramCount++;
    }

    if (can_add !== undefined) {
      updates.push(`can_add = $${paramCount}`);
      params.push(can_add);
      paramCount++;
    }

    if (can_edit !== undefined) {
      updates.push(`can_edit = $${paramCount}`);
      params.push(can_edit);
      paramCount++;
    }

    if (can_delete !== undefined) {
      updates.push(`can_delete = $${paramCount}`);
      params.push(can_delete);
      paramCount++;
    }

    if (updates.length === 0) {
      return await this.findByFeatureAndRole(featureId, roleId);
    }

    updates.push(`updated_at = NOW()`);
    params.push(featureId, roleId);

    const query = `
      UPDATE permissions 
      SET ${updates.join(', ')}
      WHERE feature_id = $${paramCount} AND role_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    return result.rows[0];
  }

  // Delete permission
  static async delete(id) {
    const query = 'DELETE FROM permissions WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Delete permission by feature and role
  static async deleteByFeatureAndRole(featureId, roleId) {
    const query = 'DELETE FROM permissions WHERE feature_id = $1 AND role_id = $2 RETURNING id';
    const result = await pool.query(query, [featureId, roleId]);
    return result.rows[0];
  }
}

export default Permission;

