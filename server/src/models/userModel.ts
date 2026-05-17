import pool from "../config/db";

export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `;
  try {
    await pool.query(query);
    console.log("Table 'users' created or already exists.");
  } catch (error) {
    console.error("Error creating 'users' table:", error);
    throw error;
  }
};

export const findUserByEmail = async (email: string) => {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

export const findUserById = async (id: string) => {
  const query = "SELECT id, name, email, created_at FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

export const createUser = async (name: string, email: string, passwordHash: string) => {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at;
  `;
  const result = await pool.query(query, [name, email, passwordHash]);
  return result.rows[0];
};

export const updateUser = async (id: string, name: string, email: string) => {
  const query = `
    UPDATE users
    SET name = $1, email = $2
    WHERE id = $3
    RETURNING id, name, email, created_at;
  `;
  const result = await pool.query(query, [name, email, id]);
  return result.rows[0];
};
