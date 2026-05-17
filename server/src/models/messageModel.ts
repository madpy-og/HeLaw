import pool from "../config/db";

export const createMessageTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
      role VARCHAR(50) CHECK (role IN ('user', 'ai')),
      content TEXT NOT NULL,
      actionable_insights JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'messages' created or already exists.");
  } catch (error) {
    console.error("Error creating 'messages' table:", error);
    throw error;
  }
};
