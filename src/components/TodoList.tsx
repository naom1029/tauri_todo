import React, { useState } from "react";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Checkbox,
} from "@mui/material";
import { Todo } from "../types/todo";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

interface TodoListProps {
  todos: Todo[];
  todoText: string;
  setTodoText: (text: string) => void;
  handleAdd: () => void;
  handleRename: (id: string, newName: string) => void;
  handleComplete: (id: string) => void;
  handleSetReminder: (id: string, reminderAt: Date | undefined | null) => void;
  handleDelete: (id: string) => void;
  error: string | null;
}

const TodoList: React.FC<TodoListProps> = ({
  todos,
  todoText,
  setTodoText,
  handleAdd,
  handleRename,
  handleComplete,
  handleSetReminder,
  handleDelete,
  error,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>("");

  // 完了しているタスク
  const completedTodos = todos.filter((todo) => todo.completedAt);

  // 未完了のタスク
  const incompleteTodos = todos.filter((todo) => !todo.completedAt);

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setNewName(currentName);
  };

  const saveName = (id: string) => {
    handleRename(id, newName);
    setEditingId(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setNewName("");
  };

  return (
    <div>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        {/* Todoを追加するためのフォーム */}
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

        {/* 未完了のTodoリスト */}
        <h3>Incomplete Todos</h3>
        <List>
          {incompleteTodos.map((todo) => (
            <ListItem key={todo.id}>
              <Checkbox
                checked={false}
                onChange={() => handleComplete(todo.id)}
                inputProps={{ "aria-label": "controlled" }}
              />
              {editingId === todo.id ? (
                <TextField
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => saveName(todo.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveName(todo.id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                  autoFocus
                />
              ) : (
                <ListItemText
                  primary={todo.text}
                  onClick={() => startEditing(todo.id, todo.text)}
                />
              )}
              <DateTimePicker
                label="Reminder"
                value={todo.reminderAt || null} // undefinedではなくnullを設定
                onChange={(newValue) => handleSetReminder(todo.id, newValue)}
              />
              <Button onClick={() => handleDelete(todo.id)} color="secondary">
                Delete
              </Button>
            </ListItem>
          ))}
        </List>

        {/* 完了したTodoリスト */}
        <h3>Completed Todos</h3>
        <List>
          {completedTodos.map((todo) => (
            <ListItem key={todo.id}>
              <Checkbox
                checked={true}
                onChange={() => handleComplete(todo.id)}
                inputProps={{ "aria-label": "controlled" }}
              />
              <ListItemText
                primary={todo.text}
                secondary={`Completed at: ${new Date(
                  todo.completedAt!
                ).toLocaleString()}`}
              />
              <Button onClick={() => handleDelete(todo.id)} color="secondary">
                Delete
              </Button>
            </ListItem>
          ))}
        </List>
      </LocalizationProvider>
    </div>
  );
};

export default TodoList;
