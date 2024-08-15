import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { handelUpdate, handleAdd, handleDelete } from "./services/todoService";
import { Todo } from "./types/todo";
import TodoList from "./components/TodoList";

const TodoApp: React.FC = () => {
  const [todoText, setTodoText] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke("load_data")
      .then((data) => {
        try {
          const parseData = JSON.parse(data as string);
          if (parseData) {
            const todosWithDates = parseData.map((todo: any) => ({
              ...todo,
              reminderAt: todo.reminderAt ? new Date(todo.reminderAt) : undefined,
            }));
            setTodos(todosWithDates);
          }
        } catch (e) {
          setError("データのパースに失敗しました。");
          console.error(e);
        }
      })
      .catch((e) => {
        setError("データの読み込み中にエラーが発生しました。");
        console.error(e);
      });
  }, []);
  

  const handleAddTodo = () => {
    handleAdd(todos, setTodos, setError, todoText, setTodoText);
  };
  const handleRenameTodo = (id: string, newName: string) => {
    handelUpdate(id, { text: newName }, todos, setTodos, setError);
  };

  const handleCompleteTodo = (id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      const newCompletedAt = todo.completedAt ? undefined : new Date();
      handelUpdate(
        id,
        { completedAt: newCompletedAt },
        todos,
        setTodos,
        setError
      );
    }
  };

  const handleSetReminder = (id: string, newreminderAt: Date | undefined) => {
    handelUpdate(id, { reminderAt: newreminderAt }, todos, setTodos, setError);
  };

  const handleDeleteTodo = (id: string) => {
    handleDelete(id, todos, setTodos, setError);
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