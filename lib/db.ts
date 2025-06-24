// lib/db.ts
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('tasks.db');

// 初期化：テーブル作成
export function initDB() {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0
      );`
    );

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );`
    );
  });
}

export function getDB() {
  return db;
}
