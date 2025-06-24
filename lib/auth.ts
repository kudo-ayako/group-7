import { getDB } from './db';
const db = getDB();

export function registerUser(username: string, password: string, callback: (success: boolean, message: string) => void) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO users (username, password) VALUES (?, ?);',
      [username, password],
      () => callback(true, '登録成功'),
      (_, error) => {
        callback(false, '登録失敗：ユーザー名がすでに存在します');
        return true;
      }
    );
  });
}

export function loginUser(username: string, password: string, callback: (success: boolean) => void) {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM users WHERE username = ? AND password = ?;',
      [username, password],
      (_, result) => {
        callback(result.rows.length > 0);
      }
    );
  });
}
