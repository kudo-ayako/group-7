import { create } from 'zustand';
import { getDB } from '../lib/db';
import { Task } from '../types';

type State = {
  tasks: Task[];
  loadTasks: () => void;
  addTask: (title: string, description: string) => void;
  updateTask: (task: Task) => void;
};

export const useTaskStore = create<State>((set) => {
  const db = getDB();

  return {
    tasks: [],
    loadTasks: () => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM tasks;',
          [],
          (_, { rows }) => {
            const data: Task[] = rows._array.map(row => ({
              id: row.id,
              title: row.title,
              description: row.description,
              completed: !!row.completed,
            }));
            set({ tasks: data });
          }
        );
      });
    },

    addTask: (title, description) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO tasks (title, description) VALUES (?, ?);',
          [title, description],
          () => {
            // 成功後に読み直し
            setTimeout(() => {
              useTaskStore.getState().loadTasks();
            }, 100);
          }
        );
      });
    },

    updateTask: (task) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?;',
          [task.title, task.description, task.completed ? 1 : 0, task.id],
          () => {
            setTimeout(() => {
              useTaskStore.getState().loadTasks();
            }, 100);
          }
        );
      });
    }
  };
});
