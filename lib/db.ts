// lib/db.ts
import * as SQLite from 'expo-sqlite';

export function getDB() {
  return SQLite.openDatabaseSync('tasks.db');
}
