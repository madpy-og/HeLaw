import { initializeDatabase } from "./models";
import pool from "./config/db";

const run = async () => {
  await initializeDatabase();
  pool.end();
};

run();
