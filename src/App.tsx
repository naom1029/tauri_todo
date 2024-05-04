import React from 'react';
import TodoApp from './TodoApp.tsx'; // TodoAppコンポーネントのインポート

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Todo List</h1>
      </header>
      <TodoApp /> 
    </div>
  );
}

export default App;
