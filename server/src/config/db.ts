import { Pool } from "pg";
import "dotenv/config";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("connect", () => {
  console.log("Connected to the Supabase database successfully!");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

export const connectDB = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log("Database connection verified.");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
};

export default pool;
