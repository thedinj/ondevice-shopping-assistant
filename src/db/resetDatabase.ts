// db/resetDatabase.ts
import { CapacitorSQLite } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { closeDb, DB_NAME, getDb } from "./index";

export async function resetDatabase(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
        throw new Error("Database reset only supported on native platforms");
    }

    // Close our known connection
    await closeDb();

    // Delete the database file
    await CapacitorSQLite.deleteDatabase({
        database: DB_NAME,
    });

    // Recreate DB + migrations
    const db = await getDb();
    await db.execute("PRAGMA foreign_keys = ON;");
}
