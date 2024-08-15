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

  useEffect(() => {
    loadTodo()
      .then((loadedTodos) => {
        setTodos(loadedTodos);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);

  const handleAddTodo = async () => {
    await addTodo(todoText, setError);
    loadTodo()
      .then(setTodos)
      .catch((e) => setError(e.message));
  };

  const handleRenameTodo = async (id: string, newName: string) => {
    await updateTodo(id, { text: newName }, setError);
    loadTodo()
      .then(setTodos)
      .catch((e) => setError(e.message));
  };

  const handleCompleteTodo = async (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const newCompletedAt = todo.completedAt ? undefined : new Date();
      await updateTodo(id, { completedAt: newCompletedAt }, setError);
      loadTodo()
        .then(setTodos)
        .catch((e) => setError(e.message));
    }
  };

  const handleSetReminder = async (
    id: string,
    newreminderAt: Date | undefined
  ) => {
    await updateTodo(id, { reminderAt: newreminderAt }, setError);
    loadTodo()
      .then(setTodos)
      .catch((e) => setError(e.message));
  };

  const handleDeleteTodo = (id: string) => {
    deleteTodo(id, setError);
    loadTodo()
      .then(setTodos)
      .catch((e) => setError(e.message));
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
