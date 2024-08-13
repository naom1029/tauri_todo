import React from "react";
import { List, ListItem, ListItemText, Button, TextField } from "@mui/material";
import { Todo } from "../types/todo";

interface TodoListProps {
  todos: Todo[];
  todoText: string;
  setTodoText: (text: string) => void;
  handleAdd: () => void;
  handleDelete: (id: string) => void;
  error: string | null;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  todoText,
  setTodoText,
  handleAdd,
  handleDelete,
  error
}) => {
  return (
    <div>
      <TextField
        label="Add Todo"
        variant="outlined"
        value={todoText}
        onChange={(e) => setTodoText(e.target.value)}
      />
      <Button onClick={handleAdd} variant="contained" color="primary">
        Add
      </Button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <List>
        {todos.map((todo) => (
          <ListItem key={todo.id}>
            <ListItemText primary={todo.text} />
            <Button onClick={() => handleDelete(todo.id)} color="secondary">
              Delete
            </Button>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default TodoList;
