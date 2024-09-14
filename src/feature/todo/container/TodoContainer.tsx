import React, { useState, useEffect } from "react";
import { loadTodo, updateTodo, addTodo, deleteTodo } from "../api/todoApi";
import TodoList from "../components/TodoList";
import { Todo } from "../types/todo";

const TodoContainer: React.FC = () => {
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
  const handleAdd = () => {
    addTodo(todoText, todos, setTodos, setError).then(() => setTodoText(""));
  };

  const handleRename = async (id: string, newName: string) => {
    await updateTodo(id, { text: newName }, todos, setTodos, setError);
  };

  const handleComplete = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const newCompletedAt = todo.completedAt ? null : new Date();
      await updateTodo(
        id,
        { completedAt: newCompletedAt },
        todos,
        setTodos,
        setError
      );
    }
  };

  const handleSetReminder = async (
    id: string,
    newReminderAt: Date | undefined | null
  ) => {
    await updateTodo(
      id,
      { reminderAt: newReminderAt },
      todos,
      setTodos,
      setError
    );
  };

  const handleDelete = async (id: string) => {
    await deleteTodo(id, todos, setTodos, setError);
  };

  return (
    <TodoList
      todos={todos}
      todoText={todoText}
      setTodoText={setTodoText}
      handleAdd={handleAdd}
      handleRename={handleRename}
      handleComplete={handleComplete}
      handleSetReminder={handleSetReminder}
      handleDelete={handleDelete}
      error={error}
    />
  );
};

export default TodoContainer;
