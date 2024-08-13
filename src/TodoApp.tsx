import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { handleAdd, handleDelete } from "./services/todoService";
import { Todo } from "./types/todo";
import TodoList from "./components/TodoList";

const TodoApp: React.FC = () => {
  const [todoText, setTodoText] = useState<string>("");
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke("load_data")
      .then((data) => {
        const parseData = JSON.parse(data as string);
        try {
          if (parseData) {
            setTodos(parseData);
          }
        } catch (e) {
          setError("データの読み込みに失敗しました。");
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

  const handleDeleteTodo = (id: string) => {
    handleDelete(id, todos, setTodos, setError);
  };

  return (
    <TodoList
      todos={todos}
      todoText={todoText}
      setTodoText={setTodoText}
      handleAdd={handleAddTodo}
      handleDelete={handleDeleteTodo}
      error={error}
    />
  );
};

export default TodoApp;
