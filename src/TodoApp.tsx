import React, { useState, useEffect } from 'react';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';
import { invoke } from '@tauri-apps/api/tauri';
import {v4 as uuidv4} from 'uuid';
interface Todo {
  id: string;
  text: string;
}

const TodoApp: React.FC = () => {
  const [todoText, setTodoText] = useState<string>('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoke('load_data')
      .then((data: string) => {
        try {
          if (data) {
            setTodos(JSON.parse(data));
          }
        } catch (e) {
          setError('データの読み込みに失敗しました。');
          console.error(e);
        }
      })
      .catch(e => {
        setError('データの読み込み中にエラーが発生しました。');
        console.error(e);
      });
  }, []);
  const generateUUID = (): string =>{
    return uuidv4();
  }
  const handleAdd = (): void => {
    if (todoText !== '') {
      const newTodo: Todo = { id: generateUUID(), text: todoText };
      invoke('save_data', { data: JSON.stringify([...todos, newTodo]) })
        .then(() => {
          setTodos([...todos, newTodo]);
          setTodoText('');
        })
        .catch(e => {
          // エラー情報を詳細にログ出力
          console.error("データ保存時のエラー:", e);
          setError(`データの保存中にエラーが発生しました: ${e.message || e.toString()}`);
        });
    } else {
      // 入力が空の場合のエラーハンドリング
      setError('テキストが入力されていません。');
    }
  };

  const handleDelete = (id: string): void => {
    const updatedTodos = todos.filter(todo => todo.id !== id);
    invoke('save_data', { data: JSON.stringify(updatedTodos) })
      .then(() => setTodos(updatedTodos))
      .catch(e => {
        setError('データの削除中にエラーが発生しました。');
        console.error(e);
      });
  };

  return (
    <div>
      <TextField
        label="Add Todo"
        variant="outlined"
        value={todoText}
        onChange={e => setTodoText(e.target.value)}
      />
      <Button onClick={handleAdd} variant="contained" color="primary">
        Add
      </Button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <List>
        {todos.map(todo => (
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

export default TodoApp;