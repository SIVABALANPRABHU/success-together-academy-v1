import pool from '../config/database.js';

export default class Assessment {
  static async findAll(filters = {}) {
    let query = `
      SELECT a.*, c.title as content_title, u.name as created_by_name
      FROM assessments a
      LEFT JOIN contents c ON a.content_id = c.id
      LEFT JOIN users u ON a.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let n = 1;
    if (filters.search) {
      query += ` AND (a.title ILIKE $${n} OR a.description ILIKE $${n})`;
      params.push(`%${filters.search}%`);
      n++;
    }
    query += ' ORDER BY a.created_at DESC';
    if (filters.limit) {
      query += ` LIMIT $${n}`;
      params.push(filters.limit);
      n++;
    }
    if (filters.offset) {
      query += ` OFFSET $${n}`;
      params.push(filters.offset);
      n++;
    }
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT a.*, c.title as content_title, c.content_type, u.name as created_by_name
       FROM assessments a
       LEFT JOIN contents c ON a.content_id = c.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  static async findByContentId(contentId) {
    const result = await pool.query(
      `SELECT a.*, c.title as content_title, c.content_type, u.name as created_by_name
       FROM assessments a
       LEFT JOIN contents c ON a.content_id = c.id
       LEFT JOIN users u ON a.created_by = u.id
       WHERE a.content_id = $1`,
      [contentId]
    );
    return result.rows[0] || null;
  }

  static async create(data) {
    const { content_id, title, description, created_by } = data;
    const result = await pool.query(
      `INSERT INTO assessments (content_id, title, description, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [content_id, title, description || null, created_by || null]
    );
    return result.rows[0];
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    let n = 1;
    if (data.title !== undefined) {
      updates.push(`title = $${n++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push(`description = $${n++}`);
      values.push(data.description);
    }
    if (updates.length === 0) return await this.findById(id);
    updates.push('updated_at = NOW()');
    values.push(id);
    await pool.query(`UPDATE assessments SET ${updates.join(', ')} WHERE id = $${n} RETURNING id`, values);
    return await this.findById(id);
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM assessments WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async getQuestions(assessmentId) {
    const result = await pool.query(
      `SELECT q.id, q.title, q.question_type, q.question_text, q.options, q.correct_answers, q.language, aq.order_index
       FROM assessment_questions aq
       JOIN questions q ON aq.question_id = q.id
       WHERE aq.assessment_id = $1
       ORDER BY aq.order_index ASC, q.id ASC`,
      [assessmentId]
    );
    return result.rows.map(row => ({
      ...row,
      options: row.options && typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correct_answers: row.correct_answers && typeof row.correct_answers === 'string' ? JSON.parse(row.correct_answers) : row.correct_answers,
    }));
  }

  static async addQuestion(assessmentId, questionId, orderIndex = 0) {
    await pool.query(
      `INSERT INTO assessment_questions (assessment_id, question_id, order_index)
       VALUES ($1, $2, $3)
       ON CONFLICT (assessment_id, question_id) DO UPDATE SET order_index = $3`,
      [assessmentId, questionId, orderIndex]
    );
    return { assessment_id: assessmentId, question_id: questionId, order_index: orderIndex };
  }

  static async removeQuestion(assessmentId, questionId) {
    const result = await pool.query(
      'DELETE FROM assessment_questions WHERE assessment_id = $1 AND question_id = $2 RETURNING assessment_id',
      [assessmentId, questionId]
    );
    return result.rows[0];
  }

  static async reorderQuestions(assessmentId, questionIds) {
    for (let i = 0; i < questionIds.length; i++) {
      await pool.query(
        `UPDATE assessment_questions SET order_index = $1 WHERE assessment_id = $2 AND question_id = $3`,
        [i, assessmentId, questionIds[i]]
      );
    }
    return await this.getQuestions(assessmentId);
  }
}
