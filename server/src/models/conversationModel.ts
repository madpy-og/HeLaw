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
