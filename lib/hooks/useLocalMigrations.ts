import { db, sqliteDb } from "@/lib/db/init";
import migrations from "@/drizzle/migrations";
import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
export function useLocalMigrations() {
  const migrationData = useMigrations(db, migrations);

  if (__DEV__) {
    useDrizzleStudio(sqliteDb());
  }
  return migrationData;
}
