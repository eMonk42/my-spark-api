import { Pool } from "pg";
export const db = new Pool({
  // user: process.env.SPARK_DB_USER,
  // database: process.env.SPARK_DB_DATABASE,
  // password: process.env.SPARK_DB_PASSWORD,
  // host: process.env.SPARK_DB_HOST,
  // port: Number(process.env.SPARK_DB_PORT),
  connectionString: process.env.DATABASE_URL,
  // ssl: {
  //   rejectUnauthorized: false,
  // }
  ssl:
    process.env.NODE_ENV == "production"
      ? { rejectUnauthorized: false }
      : false,
  //this is for Heroku
});
