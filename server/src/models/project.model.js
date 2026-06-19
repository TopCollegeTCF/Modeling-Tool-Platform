import { query } from '../config/database.js';

class ProjectModel {
  static async create(userId, { name, data }) {
    const result = await query(
      'INSERT INTO projects (user_id, name, data) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, data]
    );
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findById(id, userId) {
    const result = await query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  }

  static async update(id, userId, { name, data }) {
    const result = await query(
      'UPDATE projects SET name = $1, data = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [name, data, id, userId]
    );
    return result.rows[0];
  }

  static async delete(id, userId) {
    const result = await query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }
}

export default ProjectModel;