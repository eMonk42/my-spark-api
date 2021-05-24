import { Pool } from "pg";
export const db = new Pool({
  user: process.env.SPARK_DB_USER,
  database: process.env.SPARK_DB_DATABASE,
  password: process.env.SPARK_DB_PASSWORD,
  host: process.env.SPARK_DB_HOST,
  port: 5432,
});
