import Database from "@tauri-apps/plugin-sql";
import { v4 as uuidv4 } from "uuid";
import { Todo } from "../types/todo";

// データベース接続を保持する変数
let db: Database | null = null;

async function getDatabase(): Promise<Database> {
  if (!db) {
    try {
      db = await Database.load("sqlite:sqlite.db");
      await db.execute(`
        CREATE TABLE IF NOT EXISTS todos (
          id TEXT PRIMARY KEY,
          text TEXT NOT NULL,
          createdAt TEXT NOT NULL,
          completedAt TEXT,
          reminderAt TEXT
        )
      `);
    } catch (error) {
      console.error("データベース接続エラー:", error);
      if (error instanceof Error) {
        console.error("エラーメッセージ:", error.message);
        console.error("スタックトレース:", error.stack);
      }
      throw new Error("データベース接続中にエラーが発生しました。");
    }
  }
  return db;
}

// Todosをロードする関数
export const loadTodo = async (): Promise<Todo[]> => {
  try {
    const db = await getDatabase();
    const results = await db.select<any[]>(`
      SELECT id, text, createdAt, completedAt, reminderAt
      FROM todos
    `);

    return results.map((row) => ({
      id: row.id,
      text: row.text,
      createdAt: new Date(row.createdAt),
      completedAt: row.completedAt ? new Date(row.completedAt) : undefined,
      reminderAt: row.reminderAt ? new Date(row.reminderAt) : undefined,
    }));
  } catch (error) {
    console.error("データの読み込みに失敗しました:", error);
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      console.error("スタックトレース:", error.stack);
    }
    throw new Error("データの読み込み中にエラーが発生しました。");
  }
};

// 新しいTodoを追加する関数
export const addTodo = async (
  todoText: string,
  todos: Todo[],
  setTodos: (todos: Todo[]) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);

  if (todoText !== "") {
    const newTodo: Todo = {
      id: uuidv4(),
      text: todoText,
      createdAt: new Date(),
      completedAt: undefined,
      reminderAt: undefined,
    };

    try {
      const db = await getDatabase();
      await db.execute(
        `
        INSERT INTO todos (id, text, createdAt, completedAt, reminderAt)
        VALUES (?, ?, ?, ?, ?)
      `,
        [newTodo.id, newTodo.text, newTodo.createdAt.toISOString(), null, null]
      );

      setTodos([...todos, newTodo]);
      console.log("Todoの追加に成功しました");
    } catch (error) {
      console.error("Todoの追加中にエラーが発生しました:", error);
      if (error instanceof Error) {
        console.error("エラーメッセージ:", error.message);
        console.error("スタックトレース:", error.stack);
      }
      setError("Todoの追加中にエラーが発生しました");
    }
  }
};

// Todoを更新する関数
export const updateTodo = async (
  id: string,
  updates: Partial<Todo>,
  todos: Todo[],
  setTodos: (todos: Todo[]) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);

  try {
    const db = await getDatabase();
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.text !== undefined) {
      fields.push("text = ?");
      values.push(updates.text);
    }
    if (updates.completedAt !== undefined) {
      fields.push("completedAt = ?");
      values.push(
        updates.completedAt ? updates.completedAt.toISOString() : null
      );
    }
    if (updates.reminderAt !== undefined) {
      fields.push("reminderAt = ?");
      values.push(updates.reminderAt ? updates.reminderAt.toISOString() : null);
    }

    if (fields.length > 0) {
      values.push(id);
      await db.execute(
        `UPDATE todos SET ${fields.join(", ")} WHERE id = ?`,
        values
      );

      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, ...updates } : todo
      );

      setTodos(updatedTodos);
      console.log("Todoの更新に成功しました");
    }
  } catch (error) {
    console.error("Todoの更新中にエラーが発生しました:", error);
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      console.error("スタックトレース:", error.stack);
    }
    setError("Todoの更新中にエラーが発生しました");
  }
};

// Todoを削除する関数
export const deleteTodo = async (
  id: string,
  todos: Todo[],
  setTodos: (todos: Todo[]) => void,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);

  try {
    const db = await getDatabase();
    await db.execute(`DELETE FROM todos WHERE id = ?`, [id]);
    const updatedTodos = todos.filter((todo) => todo.id !== id);
    setTodos(updatedTodos);
    console.log("Todoの削除に成功しました");
  } catch (error) {
    console.error("Todoの削除中にエラーが発生しました:", error);
    if (error instanceof Error) {
      console.error("エラーメッセージ:", error.message);
      console.error("スタックトレース:", error.stack);
    }
    setError("Todoの削除中にエラーが発生しました");
  }
};
