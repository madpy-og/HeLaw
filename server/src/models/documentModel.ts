import pool from "../config/db";

export const createDocumentTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
      file_url VARCHAR(500) NOT NULL,
      file_type VARCHAR(50) CHECK (file_type IN ('pdf', 'image')),
      file_name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'documents' created or already exists.");
  } catch (error) {
    console.error("Error creating 'documents' table:", error);
    throw error;
  }
};

export const createDocument = async (
  messageId: string,
  fileUrl: string,
  fileType: "pdf" | "image",
  fileName: string
) => {
  const query = `
    INSERT INTO documents (message_id, file_url, file_type, file_name)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const result = await pool.query(query, [messageId, fileUrl, fileType, fileName]);
  return result.rows[0];
};
