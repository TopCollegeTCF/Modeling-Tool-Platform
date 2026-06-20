export class Project {
  constructor(pool) {
      this.pool = pool;
  }

  async create(userId, name, description = '') {
      const result = await this.pool.query(
          'INSERT INTO projects (user_id, name, description, scene_data) VALUES ($1, $2, $3, $4) RETURNING *',
          [userId, name, description, '{}']
      );
      return result.rows[0];
  }

  async findByUserId(userId) {
      const result = await this.pool.query(
          'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
          [userId]
      );
      return result.rows;
  }

  async findById(id, userId) {
      const result = await this.pool.query(
          'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
          [id, userId]
      );
      return result.rows[0] || null;
  }

  async update(id, userId, data) {
      const { name, description, scene_data } = data;
      const result = await this.pool.query(
          'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), scene_data = COALESCE($3, scene_data) WHERE id = $4 AND user_id = $5 RETURNING *',
          [name, description, scene_data, id, userId]
      );
      return result.rows[0] || null;
  }

  async delete(id, userId) {
      const result = await this.pool.query(
          'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
          [id, userId]
      );
      return result.rows[0] || null;
  }
}