// lib/auth.ts
import { getDB } from './db';

const db = getDB();

// テーブルが存在しない場合に作成する非同期関数
const initializeDB = async () => {
  // .execAsyncを使って、複数のSQL文を一度に実行します
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `).catch(e => console.error("DB 初期化エラー:", e));
};

// 初回実行
initializeDB();


/**
 * ユーザーを登録する (最新API版)
 */
export async function registerUser(username: string, password: string): Promise<{ success: boolean; message: string }> {
  try {
    // .runAsync を使って、INSERT文を実行します
    const result = await db.runAsync(
      'INSERT INTO users (username, password) VALUES (?, ?);',
      username,
      password
    );

    // 挿入に成功すれば lastInsertRowId > 0 になります
    if (result.lastInsertRowId > 0) {
      return { success: true, message: '登録成功' };
    }
    return { success: false, message: '登録に失敗しました' };

  } catch (error: any) {
    console.error('ユーザー登録エラー:', error);
    if (error.message.includes('UNIQUE constraint failed')) {
      return { success: false, message: '登録失敗：ユーザー名がすでに存在します' };
    }
    return { success: false, message: '登録失敗：問題が発生しました' };
  }
}

/**
 * ユーザーのログインを確認する (最新API版)
 */
export async function loginUser(username: string, password: string): Promise<boolean> {
  try {
    // .getFirstAsync を使って、条件に合う最初の1行を取得します
    const result = await db.getFirstAsync(
      'SELECT * FROM users WHERE username = ? AND password = ?;',
      username,
      password
    );

    // resultがnullでなければ（何かが見つかれば）、ユーザーが存在します
    return result !== null;

  } catch (error) {
    console.error('ログインエラー:', error);
    return false;
  }
}
