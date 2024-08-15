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

  const handleAddTodo = () => {
    addTodo(todos, setTodos, setError, todoText, setTodoText);
  };

  const handleRenameTodo = (id: string, newName: string) => {
    updateTodo(id, { text: newName }, todos, setTodos, setError);
  };

  const handleCompleteTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const newCompletedAt = todo.completedAt ? undefined : new Date();
      updateTodo(
        id,
        { completedAt: newCompletedAt },
        todos,
        setTodos,
        setError
      );
    }
  };

  const handleSetReminder = (id: string, newreminderAt: Date | undefined) => {
    updateTodo(id, { reminderAt: newreminderAt }, todos, setTodos, setError);
  };

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
