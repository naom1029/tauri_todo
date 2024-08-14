import React from "react";
import TodoApp from "./TodoApp.tsx"; // TodoAppコンポーネントのインポート
import { Header } from "./components/header";

function App() {
  return (
    <div className="App">
      <Header />
      <TodoApp />
    </div>
  );
}

export default App;
