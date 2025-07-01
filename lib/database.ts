// lib/database.ts (日時対応版)
import { getDB } from './db';

const db = getDB();

export interface Task {
  id: number;
  title: string;
  completed: boolean;
  startDate: string; // ISO 8601形式の文字列 (例: '2025-06-30T10:00:00.000Z')
  endDate: string;   // ISO 8601形式の文字列
}

export const initializeDB = async () => {

  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      completed INTEGER DEFAULT 0,
      startDate TEXT NOT NULL,
      endDate TEXT NOT NULL
    );
  `);
  console.log('Tasks table is ready for datetime tasks.');
};

// 特定の月に含まれる全タスクを取得する関数
export const getTasksForMonth = async (year: number, month: number): Promise<Task[]> => {
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`;
  const nextMonthFirstDay = new Date(year, month, 1);
  const lastDay = new Date(nextMonthFirstDay.getTime() - 1).toISOString().split('T')[0];

  // SQLiteのdate()関数を使って、日時から日付部分だけを比較
  return await db.getAllAsync<Task>(
    `SELECT * FROM tasks WHERE
     date(startDate) <= ? AND date(endDate) >= ?
     ORDER BY startDate ASC;`,
    [lastDay, firstDay]
  );
};

// 特定の日に含まれるタスクを取得する関数
export const getTasksForDate = async (date: string): Promise<Task[]> => {
  // SQLiteのdate()関数を使って比較
  return await db.getAllAsync<Task>('SELECT * FROM tasks WHERE ? BETWEEN date(startDate) AND date(endDate) ORDER BY startDate ASC;', date);
};

//タスク追加時に日時の文字列を受け取る
export const addTask = async (title: string, startDate: string, endDate: string): Promise<number> => {
  const result = await db.runAsync(
    'INSERT INTO tasks (title, completed, startDate, endDate) VALUES (?, 0, ?, ?);',
    [title, startDate, endDate]
  );
  return result.lastInsertRowId;
};

export const updateTask = async (id: number, title: string, startDate: string, endDate: string): Promise<number> => {
  const result = await db.runAsync(
    'UPDATE tasks SET title = ?, startDate = ?, endDate = ? WHERE id = ?;',
    [title, startDate, endDate, id]
  );
  return result.changes;
};


export const deleteTask = async (id: number): Promise<number> => { /* ... */ };
export const toggleTaskCompleted = async (id: number, completed: boolean): Promise<number> => { /* ... */ };
