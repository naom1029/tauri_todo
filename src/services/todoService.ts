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
export const addTodo = (
  todos: Todo[],
  setTodos: (todos: Todo[]) => void,
  setError: (error: string | null) => void,
  todoText: string,
  setTodoText: (text: string) => void
): void => {
  setError(null);
  if (todoText !== "") {
    const newTodo: Todo = {
      id: uuidv4(),
      text: todoText,
      createdAt: new Date(),
      completedAt: undefined,
    };
    invoke("save_data", { data: JSON.stringify([...todos, newTodo]) })
      .then(() => {
        setTodos([...todos, newTodo]);
        setTodoText("");
      })
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
export const updateTodo = (
  id: string,
  updates: Partial<Todo>,
  todos: Todo[],
  setTodos: (prevTodos: Todo[]) => void,
  setError: (error: string | null) => void
): void => {
  const updatedTodos = todos.map((todo) =>
    todo.id === id ? { ...todo, ...updates } : todo
  );

  invoke("save_data", { data: JSON.stringify(updatedTodos) })
    .then(() => setTodos(updatedTodos))
    .catch((e) => {
      setError("データの削除中にエラーが発生しました。");
      console.error(e);
    });
};

// Todoを削除する関数
export const deleteTodo = (
  id: string,
  todos: Todo[],
  setTodos: (todos: Todo[]) => void,
  setError: (error: string | null) => void
): void => {
  setError(null);
  const updatedTodos = todos.filter((todo) => todo.id !== id);
  invoke("save_data", { data: JSON.stringify(updatedTodos) })
    .then(() => setTodos(updatedTodos))
    .catch((e) => {
      setError("データの削除中にエラーが発生しました。");
      console.error(e);
    });
};
