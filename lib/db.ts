// lib/db.ts

import * as SQLite from 'expo-sqlite';

// 安定版のExpo SDK 51 / expo-sqlite@14では、このようにデータベースを開きます
const db = SQLite.openDatabase('tasks.db');

export function initDB() {
  db.transaction(tx => {
    tx.executeSql(
      'CREATE TABLE IF NOT EXISTS items (id INTEGER PRIMARY KEY NOT NULL, value TEXT NOT NULL);',
      [],
      () => {
        console.log('Database and table initialized successfully');
      },
      (_, error) => {
        console.error('Error initializing database:', error);
        return false; // エラーハンドリング
      }
    );
  });
}
