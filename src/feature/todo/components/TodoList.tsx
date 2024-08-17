import React from "react";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { Button, TextField } from "@mui/material";
import { Todo } from "../types/todo";
import CustomDatePicker from "../../../components/header/CustomDatePicker";

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
  const rows: Todo[] = todos;
  const columns: GridColDef[] = [
    {
      field: "completed",
      headerName: "完了",
      width: 100,
      renderCell: (params: GridRenderCellParams) => (
        <input
          type="checkbox"
          checked={
            params.row.completedAt !== undefined &&
            params.row.completedAt !== null
          }
          onChange={() => handleComplete(params.row.id)}
        />
      ),
    },
    {
      field: "text",
      headerName: "タスク名",
      width: 200,
      editable: true,
      preProcessEditCellProps: (params) => {
        const hasError = params.props.value.length < 1;
        return { ...params.props, error: hasError };
      },
    },
    {
      field: "createdAt",
      headerName: "作成日時",
      width: 180,
      type: "dateTime",
    },
    {
      field: "completedAt",
      headerName: "完了日時",
      width: 180,
      type: "dateTime",
    },
    {
      field: "reminderAt",
      headerName: "リマインド日時",
      width: 220,
      renderCell: (params: GridRenderCellParams<Todo>) => (
        <CustomDatePicker
          value={params.row.reminderAt}
          onChange={(newValue) => handleSetReminder(params.row.id, newValue)}
          slotProps={{ textField: { size: "small" } }}
        />
      ),
    },
    { field: "deadlineAt", headerName: "期限", width: 180, type: "dateTime" },
  ];

  const processRowUpdate = (newRow: Todo, oldRow: Todo) => {
    if (newRow.text !== oldRow.text) {
      handleRename(newRow.id, newRow.text);
    }
    return newRow;
  };

  return (
    <div>
      {error && <p style={{ color: "red" }}>{error}</p>}
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
      <DataGrid
        rows={rows}
        columns={columns}
        processRowUpdate={processRowUpdate}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 5 },
          },
        }}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
};

export default TodoList;
