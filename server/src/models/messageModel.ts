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

export const getConversationMessagesWithDocuments = async (conversationId: string, limit: number, offset: number) => {
  const query = `
    SELECT 
      m.id, m.role, m.content, m.actionable_insights, m.created_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', d.id,
            'file_url', d.file_url,
            'file_type', d.file_type,
            'file_name', d.file_name
          )
        ) FILTER (WHERE d.id IS NOT NULL), '[]'
      ) as documents
    FROM messages m
    LEFT JOIN documents d ON m.id = d.message_id
    WHERE m.conversation_id = $1
    GROUP BY m.id
    ORDER BY m.created_at ASC
    LIMIT $2 OFFSET $3;
  `;
  const result = await pool.query(query, [conversationId, limit, offset]);
  return result.rows;
};
