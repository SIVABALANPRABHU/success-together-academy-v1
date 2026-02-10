import pool from '../config/database.js';

export default class Question {
  static async findAll(filters = {}) {
    let query = `
      SELECT q.*, u.name as created_by_name FROM questions q
      LEFT JOIN users u ON q.created_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let n = 1;
    if (filters.search) {
      query += ` AND (q.question_text ILIKE $${n} OR q.title ILIKE $${n})`;
      params.push(`%${filters.search}%`);
      n++;
    }
    if (filters.question_type) {
      query += ` AND q.question_type = $${n}`;
      params.push(filters.question_type);
      n++;
    }
    if (filters.language) {
      query += ` AND q.language = $${n}`;
      params.push(filters.language);
      n++;
    }
    query += ' ORDER BY q.created_at DESC';
    if (filters.limit) {
      query += ` LIMIT $${n}`;
      params.push(filters.limit);
      n++;
    }
    if (filters.offset) {
      query += ` OFFSET $${n}`;
      params.push(filters.offset);
    }
    const result = await pool.query(query, params);
    return result.rows.map(row => ({
      ...row,
      options: row.options && typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correct_answers: row.correct_answers && typeof row.correct_answers === 'string' ? JSON.parse(row.correct_answers) : row.correct_answers,
    }));
  }

  static async findById(id) {
    const result = await pool.query(
      `SELECT q.*, u.name as created_by_name FROM questions q
       LEFT JOIN users u ON q.created_by = u.id WHERE q.id = $1`,
      [id]
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...row,
      options: row.options && typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
      correct_answers: row.correct_answers && typeof row.correct_answers === 'string' ? JSON.parse(row.correct_answers) : row.correct_answers,
    };
  }

  static async create(data) {
    const {
      title,
      question_type,
      question_text,
      options,
      correct_answers,
      language,
      created_by,
    } = data;
    const result = await pool.query(
      `INSERT INTO questions (title, question_type, question_text, options, correct_answers, language, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING *`,
      [
        title || null,
        question_type,
        question_text,
        options ? JSON.stringify(options) : null,
        correct_answers ? JSON.stringify(correct_answers) : null,
        language || 'en',
        created_by || null,
      ]
    );
    return await this.findById(result.rows[0].id);
  }

  static async update(id, data) {
    const updates = [];
    const values = [];
    let n = 1;
    ['title', 'question_type', 'question_text', 'options', 'correct_answers', 'language'].forEach(field => {
      if (data[field] !== undefined) {
        if (field === 'options' || field === 'correct_answers') {
          updates.push(`${field} = $${n}`);
          values.push(data[field] ? JSON.stringify(data[field]) : null);
        } else {
          updates.push(`${field} = $${n}`);
          values.push(data[field]);
        }
        n++;
      }
    });
    if (updates.length === 0) return await this.findById(id);
    updates.push('updated_at = NOW()');
    values.push(id);
    await pool.query(
      `UPDATE questions SET ${updates.join(', ')} WHERE id = $${n} RETURNING id`,
      values
    );
    return await this.findById(id);
  }

  static async count(filters = {}) {
    let query = 'SELECT COUNT(*) FROM questions q WHERE 1=1';
    const params = [];
    let n = 1;
    if (filters.search) {
      query += ` AND (q.question_text ILIKE $${n} OR q.title ILIKE $${n})`;
      params.push(`%${filters.search}%`);
      n++;
    }
    if (filters.question_type) {
      query += ` AND q.question_type = $${n}`;
      params.push(filters.question_type);
      n++;
    }
    if (filters.language) {
      query += ` AND q.language = $${n}`;
      params.push(filters.language);
      n++;
    }
    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count, 10);
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}
