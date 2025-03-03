import { db } from "./init";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";

export async function runMigrations() {
  try {
    console.log("Starting database migrations...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed successfully");
    return true;
  } catch (error) {
    console.error("Migration failed:", error);
 