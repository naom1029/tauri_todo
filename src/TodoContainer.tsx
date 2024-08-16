import React, { useState, useEffect } from "react";
import {
  loadTodo,
  updateTodo,
  addTodo,
  deleteTodo,
} from "./services/todoService";
import { Todo } from "./types/todo";
import TodoList from "./components/TodoList";

const TodoApp: React.FC = () => {
  const [todoText, setTodoText] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 初回レンダリング時にTodoリストをロード
  useEffect(() => {
    loadTodo()
      .then((loadedTodos) => {
        setTodos(loadedTodos);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  // Todoを追加するハンドラー
  const handleAddTodo = () => {
    addTodo(todoText, todos, setTodos, setError).then(() => setTodoText(""));
  };

  // Todoの名前を変更するハンドラー
  const handleRenameTodo = (id: string, newName: string) => {
    updateTodo(id, { text: newName }, todos, setTodos, setError);
  };

  // Todoの完了状態を切り替えるハンドラー
  const handleCompleteTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const newCompletedAt = todo.completedAt ? null : new Date();
      updateTodo(
        id,
        { completedAt: newCompletedAt },
        todos,
        setTodos,
        setError
      );
    }
  };

  // リマインダーを設定するハンドラー
  const handleSetReminder = (
    id: string,
    newReminderAt: Date | undefined | null
  ) => {
    updateTodo(id, { reminderAt: newReminderAt }, todos, setTodos, setError);
  };

  // Todoを削除するハンドラー
  const handleDeleteTodo = (id: string) => {
    deleteTodo(id, todos, setTodos, setError);
  };

  return (
    <TodoList
      todos={todos}
      todoText={todoText}
      setTodoText={setTodoText}
      handleAdd={handleAddTodo}
      handleRename={handleRenameTodo}
      handleComplete={handleCompleteTodo}
      handleSetReminder={handleSetReminder}
      handleDelete={handleDeleteTodo}
      error={error}
    />
  );
};

export default TodoApp;
