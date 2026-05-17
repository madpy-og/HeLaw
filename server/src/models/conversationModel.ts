import pool from "../config/db";

export const createConversationTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS conversations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'conversations' created or already exists.");
  } catch (error) {
    console.error("Error creating 'conversations' table:", error);
    throw error;
  }
};

export const getConversationsByUserId = async (userId: string, limit: number, offset: number) => {
  const query = `
    SELECT * FROM conversations
    WHERE user_id = $1
    ORDER BY updated_at DESC
    LIMIT $2 OFFSET $3;
  `;
  const result = await pool.query(query, [userId, limit, offset]);
  return result.rows;
};

export const createConversation = async (userId: string, title: string = "Percakapan Baru") => {
  const query = `
    INSERT INTO conversations (user_id, title)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const result = await pool.query(query, [userId, title]);
  return result.rows[0];
};

export const getConversationByIdAndUser = async (id: string, userId: string) => {
  const query = `
    SELECT * FROM conversations
    WHERE id = $1 AND user_id = $2;
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};

export const updateConversationTitle = async (id: string, userId: string, title: string) => {
  const query = `
    UPDATE conversations
    SET title = $1, updated_at = NOW()
    WHERE id = $2 AND user_id = $3
    RETURNING *;
  `;
  const result = await pool.query(query, [title, id, userId]);
  return result.rows[0];
};

export const deleteConversation = async (id: string, userId: string) => {
  const query = `
    DELETE FROM conversations
    WHERE id = $1 AND user_id = $2
    RETURNING id;
  `;
  const result = await pool.query(query, [id, userId]);
  return result.rows[0];
};
