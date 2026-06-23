import "dotenv/config";
import fs from "node:fs/promises";
import path from "node:path";
import { query } from "./db";

const initDb = async () => {
  try {
    const sql = await fs.readFile(path.join(__dirname, "schema.sql"), "utf-8");
    await query(sql);
    console.log("Tables created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error creating tables:", error);
    process.exit(1);
  }
};

initDb();
