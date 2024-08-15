import { invoke } from "@tauri-apps/api/tauri";
import { v4 as uuidv4 } from "uuid";
import { Todo } from "../types/todo";

// Todosをロードする関数
export const loadTodo = async (): Promise<Todo[]> => {
  try {
    const data = await invoke("load_data");
    const parseData = JSON.parse(data as string);
    return parseData.map((todo: any) => ({
      ...todo,
      reminderAt: todo.reminderAt ? new Date(todo.reminderAt) : undefined,
    }));
  } catch (e) {
    console.error("データの読み込みに失敗しました:", e);
    throw new Error("データの読み込み中にエラーが発生しました。");
  }
};

// 新しいTodoを追加する関数
export const addTodo = async (
  todoText: string,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);
  if (todoText !== "") {
    const newTodo: Todo = {
      id: uuidv4(),
      text: todoText,
      createdAt: new Date(),
      completedAt: undefined,
    };
    await invoke("add_data", { data: JSON.stringify(newTodo) })
      .then()
      .catch((e) => {
        console.error("データ保存時のエラー:", e);
        setError(
          `データの保存中にエラーが発生しました: ${e.message || e.toString()}`
        );
      });
  } else {
    setError("テキストが入力されていません。");
  }
};

// Todoを更新する関数
export const updateTodo = async (
  id: string,
  updates: Partial<Todo>,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);

  // `undefined` を `null` に変換
  const sanitizedUpdates = Object.fromEntries(
    Object.entries(updates).map(([key, value]) => [
      key,
      value === undefined ? null : value,
    ])
  );

  await invoke("update_data", {
    id: id,
    data: JSON.stringify(sanitizedUpdates),
  }).catch((e) => {
    setError("データの更新中にエラーが発生しました。");
    console.error(e);
  });
};

// Todoを削除する関数
export const deleteTodo = async (
  id: string,
  setError: (error: string | null) => void
): Promise<void> => {
  setError(null);
  await invoke("delete_data", { id: id }).catch((e) => {
    setError("データの削除中にエラーが発生しました。");
    console.error(e);
  });
};
